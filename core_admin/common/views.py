from rest_framework.response import Response
from rest_framework.decorators import api_view


@api_view(['GET'])
def teste(request):
    if request.method == 'GET':
        from tno.db import CatalogDB
        from tno.models import Catalog
        from sqlalchemy.sql import text

        db = CatalogDB()

        gaia = Catalog.objects.first()

        print(gaia)

        # select * from y1a1_coadd_stripe82.coadd_objects where q3c_radial_query(ra, "dec", 317.490884, -1.762072 , 0.005 );


        # stm = text(
        #     """select * from y1a1_coadd_stripe82.coadd_objects where q3c_radial_query(ra, "dec", 317.490884, -1.762072, 0.005);""")

        ra = 317.490884
        dec = -1.762072

        rows = db.radial_query(
            schema="y1a1_coadd_stripe82",
            tablename="coadd_objects",
            ra_property='ra',
            dec_property='dec',
            ra=ra,
            dec=dec,
            radius=0.005,
            limit=2
        )

        result = dict({
            'success': True,
            'results': rows,
            'count': len(rows)
        })

    return Response(result)
