import logging

from drf_spectacular.utils import extend_schema
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ParseError
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from tno.db import CatalogDB
from tno.models import Catalog
from tno.serializers import CatalogSerializer


@extend_schema(exclude=True)
class CatalogViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    swagger_schema = None
    queryset = Catalog.objects.all()
    serializer_class = CatalogSerializer
    filterset_fields = (
        "id",
        "name",
    )

    @action(detail=False, methods=["get"], permission_classes=(AllowAny,))
    def q3c_radial_query(self, request):
        """
        Executa query por posição em um catalogo.

        Este endpoint foi criado com intuito de facilitar o desenvolvimento dos demais componentes do portal
        que necessitam de acesso ao banco de catalogos.

        IMPORTANTE: Não deveria ficar disponivel no futuro!
        @param catalog - use internal Catalog.name ex: gaia_dr2
        @param ra
        @param dec
        @param radius
        @param limit
        eg: http://localhost/api/catalog/q3c_radial_query/?catalog=gaia_dr2&ra=10.17196&dec=6.2755&radius=0.15
        """

        catalog = request.query_params.get("catalog")
        if catalog == None:
            raise ParseError(detail="catalog parameter is mandatory.")

        ra = request.query_params.get("ra")
        if ra == None:
            raise ParseError(detail="ra parameter is mandatory.")
        l_ra = [float(x) for x in ra.split(",")]

        dec = request.query_params.get("dec")
        if dec == None:
            raise ParseError(detail="dec parameter is mandatory.")
        l_dec = [float(x) for x in dec.split(",")]

        radius = float(request.query_params.get("radius"))
        if radius == None:
            raise ParseError(detail="radius parameter is mandatory.")

        limit = int(request.query_params.get("limit", 1000))

        # TODO: Dados do catalogo Hardcoded quanto tiver mais catalogos deve vir ta tabela catalogs
        schema = None
        tablename = None
        ra_property = "ra"
        dec_property = "dec"

        if catalog == "gaia_dr2":
            schema = "gaia"
            tablename = "dr2"

        db = CatalogDB(pool=False)
        results = []
        for idx, ra in enumerate(l_ra):
            rows = db.radial_query(
                tablename=tablename,
                schema=schema,
                ra_property=ra_property,
                dec_property=dec_property,
                ra=l_ra[idx],
                dec=l_dec[idx],
                radius=radius,
                limit=limit,
            )

            results.extend(rows)

        result = dict(
            {
                "success": True,
                "query_params": {
                    "catalog": catalog,
                    "ra": l_ra,
                    "dec": l_dec,
                    "radius": radius,
                    "limit": limit,
                },
                "count": len(results),
                "results": results,
            }
        )
        return Response(result)
