import datetime
import logging
import os
import pathlib
import time
import traceback
from enum import StrEnum
from typing import Optional

import pandas as pd
import sqlalchemy as sa
from sqlalchemy import (JSON, Boolean, Column, DateTime, Integer, MetaData,
                        String, Table, create_engine)
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import Session, declarative_base, registry, sessionmaker

# registry is the new recommended way (replaces declarative_base)
mapper_registry = registry()

def create_reflected_model(table_name: str, engine):
    """
    Dynamically creates a SQLAlchemy ORM model reflected from an existing table.
    Each table will have its own unique class.
    """
    metadata = MetaData()
    table = Table(table_name, metadata, autoload_with=engine)

        # dynamically create a class with unique name based on table name
    cls_name = "".join(word.capitalize() for word in table_name.split("_"))

    # create the class in function scope
    new_class = type(cls_name, (), {})

    # map the class to the table
    mapper_registry.map_imperatively(new_class, table)

    return new_class


def serialize(obj):
    """JSON serializer for objects not serializable by default json code"""

    if isinstance(obj, datetime.date):
        serial = obj.isoformat()
        return serial

    if isinstance(obj, datetime.time):
        serial = obj.isoformat()
        return serial

    if isinstance(obj, pathlib.PosixPath):
        serial = str(obj)
        return serial

    if isinstance(obj, logging.Logger):
        return None

    return obj.__dict__

class BaseDAO: 

    def __init__(self, engine, model, log):
        self.engine = engine
        self.model = model
        self.log = log

    def to_dict(self, instance):
        """
        Converts an ORM instance (reflected model) to dict with only the table columns.
        """
        return {
            c.name: getattr(instance, c.name)
            for c in instance.__table__.columns
        }

class WorkerHeartbeatDAO(BaseDAO):
    def __init__(self, engine, log):
        WorkerHeartbeat = create_reflected_model("predict_occultation_workersheartbeat", engine)
        super().__init__(engine, WorkerHeartbeat, log)

    def initialize_heartbeat(self, worker_name):
        with Session(self.engine) as db:
            try:
                heartbeat = db.query(self.model).filter_by(worker=worker_name).first()
                if not heartbeat:
                    heartbeat = self.model(
                        worker=worker_name, 
                        started_at=datetime.datetime.now(tz=datetime.timezone.utc),
                        updated_at=datetime.datetime.now(tz=datetime.timezone.utc),
                        uptime=0
                        )
                    db.add(heartbeat)
                    db.commit()
                    self.log.debug(f"Heartbeat initialized for worker {worker_name}.")
                else:
                    heartbeat.uptime = 0 # Reinicia o uptime toda vez que o worker é iniciado.
                    heartbeat.updated_at = datetime.datetime.now(tz=datetime.timezone.utc)
                    db.commit()
                    # self.log.debug(f"Heartbeat updated for worker {worker_name}.")
            except Exception as e:
                self.log.error(f"Error initializing/updating heartbeat: {e}")
                # add traceback for debugging
                self.log.debug(traceback.format_exc())
                db.rollback()
            finally:
                db.close()

    def send_heartbeat(self, worker_name):
        with Session(self.engine) as db:
            try:
                heartbeat = db.query(self.model).filter_by(worker=worker_name).first()
                if heartbeat:
                    heartbeat.uptime = (int((datetime.datetime.now(tz=datetime.timezone.utc) - heartbeat.started_at).total_seconds()))
                    heartbeat.updated_at = datetime.datetime.now(tz=datetime.timezone.utc)
                    db.commit()
                    # self.log.debug(f"Heartbeat sent for worker {worker_name}.")
                else:
                    self.log.warning(f"Heartbeat for {worker_name} not found. Reinitializing...")
                    self.initialize_heartbeat(worker_name)
            except Exception as e:
                self.log.error(f"Error sending heartbeat: {e}")
                db.rollback()
            finally:
                db.close()


class PredictionTaskDAO(BaseDAO):
    def __init__(self, engine, log):
        PredictionTask = create_reflected_model("predict_occultation_predictiontask", engine)
        self.base_delay = 60  # base delay in seconds for exponential backoff
        super().__init__(engine, PredictionTask, log)

    def get_next_task(self, db_session, state_to_process):
        try:
            task_model = self.model
            task = db_session.query(task_model).filter(
                task_model.state == state_to_process,
                task_model.aborted == False,
                (task_model.next_retry_at == None) | (task_model.next_retry_at <= datetime.datetime.now(tz=datetime.timezone.utc))
            ).order_by(task_model.priority.desc(), task_model.created_at.asc()
            ).with_for_update(skip_locked=True).first()
            return task
        except OperationalError as e:
            self.log.warning(f"Operational error when fetching task (probably lock): {e}")
            db_session.rollback()
            return None
        except Exception as e:
            self.log.error(f"Error searching for next task: {e}")
            db_session.rollback()
            return None

    def update_task_status(self, db_session, task, new_state, slurm_job_id: int = None, workdir: Optional[pathlib.Path] = None):
        try:
            task.state = new_state
            task.updated_at = datetime.datetime.now(tz=datetime.timezone.utc)
            if slurm_job_id is not None:
                task.slurm_job_id = slurm_job_id
            if workdir is not None:
                task.workdir = str(workdir)
            db_session.add(task)
            db_session.commit()
            db_session.refresh(task)
            self.log.info(f"Changed task state to: {task.state}")
            return True
        except Exception as e:
            msg = f"Error updating task {task.id} status: {e}"
            db_session.rollback()
            raise Exception(msg)

    def mark_task_failed(self, db_session, task, error_message):
        try:
            task.attempt_count += 1
            task.last_error = error_message
            if task.attempt_count >= task.max_retries:
                task.state = "STALLED"
                task.next_retry_at = None
                self.log.warning(f"Task {task.id} marked as STALLED after reaching maximum retries.")
            else:
                # Exponential backoff
                delay_seconds = self.base_delay * (2 ** (task.attempt_count - 1)) 
                task.state = "PENDING"
                task.next_retry_at = datetime.datetime.now(tz=datetime.timezone.utc) + datetime.timedelta(seconds=delay_seconds)
                self.log.info(f"Task {task.id} marked as FAILED. Next retry in {delay_seconds} seconds.")

            task.updated_at = datetime.datetime.now(tz=datetime.timezone.utc)
            db_session.add(task)
            db_session.commit()
            db_session.refresh(task)
            return True
        except Exception as e:
            db_session.rollback()
            msg = f"Error marking task {task.id} as FAILED: {e}"
            raise Exception(msg)


class AsteroidDAO(BaseDAO):
    def __init__(self, engine, log):
        Asteroid = create_reflected_model("tno_asteroid", engine)
        super().__init__(engine, Asteroid, log)


    def get_by_name(self, name: str) -> dict:
        with Session(self.engine) as db_session:
            try:
                asteroid = db_session.query(self.model).filter_by(name=name).first()
                return asteroid
            except Exception as e:
                msg = f"Error searching for asteroid by name {name}: {e}"
                db_session.rollback()
                raise Exception(msg)

class AsteroidEphemerisDAO(BaseDAO):
    def __init__(self, engine, log):
        AsteroidEphemeris = create_reflected_model("tno_bspasteroid", engine)
        super().__init__(engine, AsteroidEphemeris, log)


    def get_by_name(self, name: str) -> dict:
        with Session(self.engine) as db_session:
            try:
                asteroid = db_session.query(self.model).filter_by(name=name).first()
                return asteroid
            except Exception as e:
                msg = f"Error searching for asteroid ephemeris by name {name}: {e}"
                db_session.rollback()
                raise Exception(msg)


def occultations_upsert(table, conn, keys, data_iter):

    data = [dict(zip(keys, row)) for row in data_iter]

    insert_statement = insert(table.table).values(data)
    upsert_statement = insert_statement.on_conflict_do_update(
        constraint=f"tno_occultation_hash_id_key",
        set_={c.key: c for c in insert_statement.excluded},
    )
    # print(upsert_statement.compile(dialect=postgresql.dialect()))
    result = conn.execute(upsert_statement)
    return result.rowcount

class OccultationDAO(BaseDAO):
    def __init__(self, engine, log):
        Occultation = create_reflected_model("tno_occultation", engine)
        super().__init__(engine, Occultation, log)

    def upinsert_occultations(self, df):

        # Add updated_at column
        df["updated_at"] = pd.to_datetime("now", utc=True)

        try:
            with self.engine.connect() as conn:
                rowcount = df.to_sql(
                    "tno_occultation",
                    con=conn,
                    if_exists="append",
                    method=occultations_upsert,
                    index=False,
                )

                return rowcount
        except Exception as e:
            msg = f"Error upserting occultations: {e}"
            raise Exception(msg)

class CatalogDAO(BaseDAO):
    def __init__(self, engine, log):
        Catalog = create_reflected_model("tno_catalog", engine)
        super().__init__(engine, Catalog, log)

    def get_by_name(self, name: str):
        with Session(self.engine) as db_session:
            try:
                catalog = db_session.query(self.model).filter_by(name=name).first()
                return catalog
            except Exception as e:
                msg = f"Error searching for catalog by name {name}: {e}"
                db_session.rollback()
                raise Exception(msg)

class PlanetaryEphemerisDAO(BaseDAO):
    def __init__(self, engine, log):
        PlanetaryEphemeris = create_reflected_model("tno_bspplanetary", engine)
        super().__init__(engine, PlanetaryEphemeris, log)

    def get_by_name(self, name: str):
        with Session(self.engine) as db_session:
            try:
                bsp = db_session.query(self.model).filter_by(name=name).first()
                return bsp
            except Exception as e:
                msg = f"Error searching for planetary ephemeris by name {name}: {e}"
                db_session.rollback()
                raise Exception(msg)

class LeapSecondDAO(BaseDAO):
    def __init__(self, engine, log):
        LeapSecond = create_reflected_model("tno_leapsecond", engine)
        super().__init__(engine, LeapSecond, log)

    def get_by_name(self, name: str):
        with Session(self.engine) as db_session:
            try:
                leap = db_session.query(self.model).filter_by(name=name).first()
                return leap
            except Exception as e:
                msg = f"Error searching for leap second by name {name}: {e}"
                db_session.rollback()
                raise Exception(msg)


class PredictionState(StrEnum):
    PENDING = "PENDING"
    PREPARING = "PREPARING"
    READY_FOR_RUN = "READY_FOR_RUN"
    SUBMITTING = "SUBMITTING"
    QUEUED = "QUEUED"
    RUNNING = "RUNNING"
    WAITING_RESULTS = "WAITING_RESULTS"
    INGESTING = "INGESTING"
    DONE = "DONE"
    FAILED = "FAILED"
    STALLED = "STALLED"
    ABORTED = "ABORTED"