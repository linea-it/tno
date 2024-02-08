from datetime import datetime

from django.utils import timezone
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from tno.johnstons import JhonstonArchive
from tno.models import JohnstonArchive
from tno.serializers import JohnstonArchiveSerializer


class JohnstonArchiveViewSet(viewsets.ModelViewSet):
    """
    List of Known Trans-Neptunian Objects and other outer solar system objects

    Downloaded from: http://www.johnstonsarchive.net/astro/tnoslist.html

    Table includes TNOs, SDOs, and Centaurs listed by the MPC as of 7 October 2018,
    plus other unusual asteroids with aphelion distances greater than 7.5 AU,
    plus several additional reported objects without MPC designations.

    To search for the object name use the 'search' attribute
    example searches for chariklo object
    /known_tnos_johnston/?search=chariklo

    Any attribute can be used as a filter, just pass the property name as parameter and value.
    example filter all objects with a diameter less than 100
    /known_tnos_johnston/?diameter__lt=100

    For details on how to make filters through the url. (https://github.com/miki725/django-url-filter)

    to update all the contents of the table, just access this url.
    http://localhost:7001/known_tnos_johnston/update_list/

    use the format=json attribute to have the result in json.
    example /known_tnos_johnston/?diameter__lt=100&format=json

    """

    title = "List of Known Trans-Neptunian Objects from Johnston Archive"
    queryset = JohnstonArchive.objects.all()
    serializer_class = JohnstonArchiveSerializer
    filter_fields = (
        "id",
        "number",
        "name",
        "provisional_designation",
        "dynamical_class",
        "a",
        "e",
        "perihelion_distance",
        "aphelion_distance",
        "i",
        "diameter",
        "diameter_flag",
        "albedo",
        "b_r_mag",
        "taxon",
        "density",
        "known_components",
        "discovery",
        "updated",
    )
    search_fields = ("name", "number", "provisional_designation")
    permission_classes = (IsAuthenticatedOrReadOnly,)

    @action(detail=False, methods=["GET"], permission_classes=(IsAuthenticated,))
    def update_list(self, request):

        ja = JhonstonArchive()

        try:
            rows = ja.get_table_data()

            count_created = 0
            count_updated = 0

            if len(rows) > 0:

                # Gera o CSV
                filename = ja.write_csv(rows)

                # Update na tabela
                for row in rows:

                    discovery = None
                    if row["discovery"]:
                        discovery = datetime.strptime(row["discovery"], "%Y-%m")

                    record, created = JohnstonArchive.objects.update_or_create(
                        provisional_designation=row["provisional_designation"],
                        defaults={
                            "number": row["number"],
                            "name": row["name"],
                            "dynamical_class": row["dynamical_class"],
                            "a": row["a"],
                            "e": row["e"],
                            "perihelion_distance": row["perihelion_distance"],
                            "aphelion_distance": row["aphelion_distance"],
                            "i": row["i"],
                            "diameter": row["diameter"],
                            "diameter_flag": row["diameter_flag"],
                            "albedo": row["albedo"],
                            "b_r_mag": row["b_r_mag"],
                            "taxon": row["taxon"],
                            "density": row["density"],
                            "known_components": row["known_components"],
                            "discovery": discovery,
                            "updated": timezone.now(),
                        },
                    )

                    record.save()

                    if created:
                        count_created += 1
                    else:
                        count_updated += 1

            return Response(
                {
                    "success": True,
                    "count": len(rows),
                    # 'filename': filename,
                    "created": count_created,
                    "updated": count_updated,
                }
            )

        except Exception as e:
            raise e
