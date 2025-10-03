import logging
import os
import pathlib
import time
from typing import Optional

import colorlog
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from dao.models import PredictionTaskDAO, WorkerHeartbeatDAO


class BaseWorker:
    def __init__(
        self,
        worker_name,
        database_url,
        interval: float = 2.0,
        batch: int = 5,
        base_delay: int = 60,
    ):
        self.worker_name = worker_name
        self.database_url = database_url
        self.engine = create_engine(self.database_url)

        self._setup_logging()

        # DAOs
        self.workers_heartbeat_dao = WorkerHeartbeatDAO(self.engine, self.log)
        self.prediction_task_dao = PredictionTaskDAO(self.engine, self.log)

        self.SessionLocal = sessionmaker(
            autocommit=False, autoflush=False, bind=self.engine
        )

        # self._initialize_heartbeat()
        self.interval = interval
        self.batch = batch
        self.base_delay = base_delay

        self.outputs_dir = os.getenv("OUTPUTS_DIR", "/data/outputs")

        self._initialize_heartbeat()

    def _setup_logging(self):
        self.log = logging.getLogger(self.worker_name)
        self.log.setLevel(logging.DEBUG)
        # Avoid adding multiple handlers if they already exist
        if not self.log.handlers:

            handler = colorlog.StreamHandler()

            formatter = colorlog.ColoredFormatter(
                fmt="%(log_color)s%(asctime)s - [%(levelname)s] - %(message)s",
                log_colors={
                    "DEBUG": "cyan",
                    "INFO": "green",
                    "WARNING": "yellow",
                    "ERROR": "red",
                    "CRITICAL": "bold_red",
                },
            )
            handler.setFormatter(formatter)
            self.log.addHandler(handler)

    def _initialize_heartbeat(self):
        self.workers_heartbeat_dao.initialize_heartbeat(self.worker_name)

    def send_heartbeat(self):
        self.workers_heartbeat_dao.send_heartbeat(self.worker_name)

    def get_next_task(self, db_session, state_to_process):
        return self.prediction_task_dao.get_next_task(db_session, state_to_process)

    def update_task_status(self, db_session, task, new_state, **kwargs):
        self.prediction_task_dao.update_task_status(
            db_session, task, new_state, **kwargs
        )

    def mark_task_failed(self, db_session, task, error_message):
        self.prediction_task_dao.mark_task_failed(db_session, task, error_message)

    def cleanup_workdir(self, workdir: pathlib.Path):
        if not workdir.exists():
            self.log.info(f"Directory {workdir} does not exist, nothing to clean up")
            return

        self.log.info(f"Cleaning up directory: {workdir}")

        items_removed = 0
        for child in workdir.iterdir():
            try:
                if child.is_file() or child.is_symlink():
                    child.unlink()
                    items_removed += 1
                    self.log.debug(f"Removed file/link: {child}")
                elif child.is_dir():
                    import shutil

                    shutil.rmtree(child)
                    items_removed += 1
                    self.log.debug(f"Removed directory: {child}")
            except Exception as e:
                self.log.warning(f"Failed to remove {child}: {e}")

        try:
            workdir.rmdir()
            self.log.info(
                f"Directory {workdir} successfully removed. {items_removed} items cleaned up."
            )
        except OSError as e:
            raise OSError(f"Failed to remove main directory {workdir}: {e}")

    def run(self):
        self.log.info("=" * 60)
        self.log.debug(
            f"Worker {self.worker_name} started to process tasks in state: {self.state_to_process}"
        )

        keep_running = True
        while keep_running:

            # In development, use False to run only one iteration.
            # keep_running = False

            # self.send_heartbeat()
            db = (
                self.SessionLocal()
            )  # SessionLocal is accessible via self.SessionLocal in BaseWorker

            try:
                task = self.get_next_task(db, self.state_to_process)

                if not task:
                    # self.log.info(f"No task with state {self.state_to_process} found. Waiting...")
                    continue

                if task:
                    self.log.info("=" * 60)
                    self.log.info(
                        f"Task {task.id} selected for processing. Current state: {task.state}"
                    )

                    try:
                        self.perform_task(task, db)

                    except Exception as e:
                        db.rollback()
                        self.log.error(e)
                        self.mark_task_failed(db, task, str(e))

            except Exception as e:
                db.rollback()
                self.log.error(f"Error in main worker loop: {e}")
            finally:
                self.send_heartbeat()
                db.close()
                time.sleep(self.interval)

    def perform_task(self, task, db_session):
        raise NotImplementedError(
            "The 'perform_task' method must be implemented by subclasses."
        )
