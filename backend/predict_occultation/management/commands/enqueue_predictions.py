from django.core.management.base import BaseCommand
from predict_occultation.models import PredictionTask
import random
from tno.models import Asteroid


class Command(BaseCommand):
    help = "Cria tasks de predição para asteroids"

    def add_arguments(self, parser):
        parser.add_argument(
            "start",
            help="Start Data in format YYYY-MM-DD",
        )
        parser.add_argument(
            "end",
            default=None,
            help="End Data in format YYYY-MM-DD",
        )
        parser.add_argument("--name", type=str, help="Asteroid name")
        parser.add_argument("--base_dynclass", type=str, help="Base dynamic class")
        parser.add_argument("--dynclass", type=str, help="Dynamic class")

        parser.add_argument("--max_mag", type=str, help="maximum visual magnitude. default is 18", default=18 )
        parser.add_argument("--ephem_step", type=int, help="Ephemeris step in seconds. default is 60", default=60)
        parser.add_argument("--star_catalog", type=str, help="Star catalog. default is gaia_dr3", default="gaia_dr3")
        parser.add_argument("--planetary_ephem", type=str, help="Planetary ephemeris. default is de440", default="de440")
        parser.add_argument("--leap_seconds", type=str, help="Leap seconds file. default is naif0012", default="naif0012")
        parser.add_argument("--priority", type=int, help="Task priority. default is 100", default=100)


    def handle(self, *args, **options):

        name = options.get("name", None)
        base_dynclass = options.get("base_dynclass", None)
        dynclass = options.get("dynclass", None)

        if name is None and base_dynclass is None and dynclass is None:
            self.stdout.write(self.style.ERROR("Por favor, forneça --name ou --base_dynclass ou --dynclass"))
            return

        filter_params = {}
        if dynclass is not None:
            filter_params["dynclass"] = dynclass
        elif base_dynclass is not None:
            filter_params["base_dynclass"] = base_dynclass
        else:
            l_name = name.strip().split(",")
            filter_params["name__in"] = [n.strip() for n in l_name if n.strip() != ""]

        asteroids = Asteroid.objects.filter(**filter_params)

        self.stdout.write(f"Encontrados {asteroids.count()} asteroids para os filtros fornecidos.")

        for asteroid in asteroids:
            priority = options.get("priority", 100)

            input_manifest = {
                "start_date": options["start"],
                "end_date": options["end"],
                "maximum_visual_magnitude": options.get("max_mag", 18),
                "ephemeris_step": options.get("ephem_step", 60),
                "star_catalog": options.get("star_catalog", "gaia_dr3"),
                "planetary_ephemeris": options.get("planetary_ephem", "de440"),
                "leap_seconds": options.get("leap_seconds", "naif0012"),
            }

            task = PredictionTask.objects.create(
                asteroid_id=asteroid.name,
                priority=priority,
                input_manifest=input_manifest,
            )
            self.stdout.write(self.style.SUCCESS(f"Task [{task.id}] criada  para asteroid: [{asteroid.name}]") )
