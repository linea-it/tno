from django.core.management.base import BaseCommand

from django.conf import settings
import json
from tno.models import Asteroid
from tno.models.bsp_asteroid import BspAsteroid
import shutil

class Command(BaseCommand):
    help = "Updates the Bsp Asteroid table with metadata of allready downloaded files."

    def handle(self, *args, **options):
        self.stdout.write("="*60)
        self.stdout.write("Running the update of the Bsp Asteroid table.")

        # Check path for Asteroid bsp files.
        workdir = settings.ASTEROIDS_INPUTS_DIR

        self.stdout.write(f"Checking path: {workdir}")
        if not workdir.exists():
            self.stdout.write(self.style.ERROR(f"Path {workdir} does not exist."))
            return

        for child in workdir.iterdir():
            # iterate over all directories
            if child.is_dir():
                try:
                    asteroid_alias = child.name
                    self.stdout.write(f"Processing asteroid: {asteroid_alias}")

                    # check json info file exists
                    info_file = child.joinpath(f"bsp_jpl_info.json")
                    if not info_file.exists():
                        msg = f"Info file {info_file} does not exist."
                        raise FileNotFoundError(msg)

                    data = {}

                    with open(info_file, 'r') as f:
                        info = json.load(f)
                        data.update(info)
                        
                    # rename some fields to match model
                    data['mag_and_uncert_filename'] = data.pop('mag_and_uncert_file')

                    # get size of uncertainty file
                    mag_and_uncert_file = child.joinpath(data['mag_and_uncert_filename'])
                    if not mag_and_uncert_file.exists():
                        msg = f"Magnitude and Uncertainty file {mag_and_uncert_file} does not exist."
                        raise FileNotFoundError(msg)
                    
                    data['mag_and_uncert_size'] = mag_and_uncert_file.stat().st_size 

                    # check if bsp file exists
                    bsp_file = child.joinpath(data['filename'])
                    if not bsp_file.exists():
                        msg = f"BSP file {bsp_file} does not exist."
                        raise FileNotFoundError(msg)

                    # get size of bsp file
                    data.update({'size': bsp_file.stat().st_size})


                    # TODO: Abrir o bsp e pegar a informação da versão.
                    data.update({'orbit_id': None})

                    # Retrieve the corresponding Asteroid object
                    asteroid = Asteroid.objects.get(alias=asteroid_alias)
                    # self.stdout.write(f"Asteroid found: {asteroid}")
                    data.update({
                        'name': asteroid.name,
                        'number': asteroid.number,
                        'principal_designation': asteroid.principal_designation,
                        'alias': asteroid.alias,
                        'base_dynclass': asteroid.base_dynclass,
                        'dynclass': asteroid.dynclass,
                        })

                    # self.stdout.write(f"Data to be saved: {data}")
                    obj, created = BspAsteroid.objects.update_or_create(
                        name=asteroid.name,
                        defaults=data
                    )
                    if created:
                        msg = f"Created new BspAsteroid entry for {asteroid_alias}."
                    else:
                        msg = f"Updated BspAsteroid entry for {asteroid_alias}."

                    self.stdout.write(self.style.SUCCESS(msg))

                except Exception as e:
                    msg = f"Error processing asteroid {asteroid_alias}: {e}"
                    self.stdout.write(self.style.ERROR(msg))
                    # Remove directory to force re-download?
                    shutil.rmtree(child)
                    self.stdout.write(self.style.WARNING(f"Removed directory {child}."))
                    continue

        self.stdout.write(self.style.SUCCESS("Finished the update of the Bsp Asteroid table."))




