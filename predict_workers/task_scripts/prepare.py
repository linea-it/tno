import json
import pathlib

from base_worker import BaseWorker
from dao.models import (AsteroidDAO, AsteroidEphemerisDAO, CatalogDAO, LeapSecondDAO,
                        PlanetaryEphemerisDAO, PredictionState, serialize)


class PrepareWorker(BaseWorker):
    def __init__(self, worker_name, database_url):
        super().__init__(worker_name, database_url)
        self.state_to_process = 'PENDING'

        self.asteroid_dao = AsteroidDAO(self.engine, self.log)
        self.asteroid_ephemeris_dao = AsteroidEphemerisDAO(self.engine, self.log)

        self.catalog_dao = CatalogDAO(self.engine, self.log)
        self.planetary_ephemeris_dao = PlanetaryEphemerisDAO(self.engine, self.log)
        self.leap_second_dao = LeapSecondDAO(self.engine, self.log)

        
    def get_star_catalog_params(self, catalog_name):
        catalog = self.catalog_dao.get_by_name(catalog_name)

        return {
            "name": catalog.name,
            "display_name": catalog.display_name,
            "schema": catalog.schema,
            "tablename": catalog.tablename,
            "ra_property": catalog.ra_property,
            "dec_property": catalog.dec_property
        }

    def get_planetary_ephemeris_params(self, ephemeris_name):
        ephemeris = self.planetary_ephemeris_dao.get_by_name(ephemeris_name)

        return {
            "name": ephemeris.name,
            "display_name": ephemeris.display_name,
            "url": ephemeris.url,
            "filename": f'{ephemeris.name}.bsp',
        }

    def get_leap_seconds_params(self, leap_seconds_name):
        leap = self.leap_second_dao.get_by_name(leap_seconds_name)

        return {
            "name": leap.name,
            "display_name": leap.display_name,
            "url": leap.url,
            "filename": f'{leap.name}.tls',
        }

    def get_asteroid_ephemeris_info(self, asteroid_name):
        ast_ephem = self.asteroid_ephemeris_dao.get_by_name(asteroid_name)

        return {
            "source": ast_ephem.source,
            "filename": ast_ephem.filename,
            "start_period": ast_ephem.start_period.isoformat(),
            "end_period": ast_ephem.end_period.isoformat(),
            "mag_and_uncert_filename": ast_ephem.mag_and_uncert_filename,
            "size": ast_ephem.size,
        }


    def perform_task(self, task, db_session):
        self.log.info(f"Performing prepare step for task id: {task.id}")

        # Define work directory for the task
        workdir = pathlib.Path(self.outputs_dir).joinpath(str(task.id))

        # Change task status to PREPARING
        self.update_task_status(db_session, task, PredictionState.PREPARING, workdir=workdir)


        asteroid_model = self.asteroid_dao.get_by_name(task.asteroid_id)
        asteroid = self.asteroid_dao.to_dict(asteroid_model)

        self.log.info(f"Asteroid found: {asteroid.get('name')}")


        if workdir.exists():
            self.log.warning(f"Task directory {workdir} already exists. Removing it for re-run task.")
            self.cleanup_workdir(workdir)

        # Create directory for task
        workdir.mkdir(parents=True, exist_ok=False)
        workdir.chmod(0o775) # rwxrwxr-x
        self.log.info(f"Task directory created at [{workdir}]")

        # Create the asteroid.json file
        self.log.info(f"Creating asteroid.json for asteroid [{asteroid.get('name')}]")

        json_data = {
            'task_id': task.id,
            'path': str(workdir),
            'name': asteroid.get('name'),
            'alias': asteroid.get('alias'),
            'predict_params': {
                "start_date": task.input_manifest.get('start_date'),
                "end_date": task.input_manifest.get('end_date'),
                "maximum_visual_magnitude": int(task.input_manifest.get('maximum_visual_magnitude', 18)),
                "ephemeris_step": int(task.input_manifest.get('ephemeris_step', 60)),
                "asteroid_ephemeris": self.get_asteroid_ephemeris_info(asteroid.get('name')),
                "star_catalog" : self.get_star_catalog_params(task.input_manifest.get('star_catalog', 'gaia_dr3')),
                "planetary_ephemeris": self.get_planetary_ephemeris_params(task.input_manifest.get('planetary_ephemeris', 'de440')),
                "leap_seconds": self.get_leap_seconds_params(task.input_manifest.get('leap_seconds', 'naif0012')),
            },
            'asteroid': asteroid
        }

        # self.log.debug(json_data)

        json_path = workdir.joinpath('asteroid.json')
        self.log.info(f"Writing asteroid.json to [{json_path}]")
        with open(json_path, "w") as json_file:
            json.dump(json_data, json_file, default=serialize)

        self.log.info(f"asteroid.json created successfully.")

        # Change task status to Ready for run
        self.update_task_status(db_session, task, PredictionState.READY_FOR_RUN)


