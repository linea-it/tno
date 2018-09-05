from rest_framework.response import Response
from rest_framework.decorators import api_view


@api_view(['GET'])
def teste(request):
    if request.method == 'GET':
        from predict.stellar import StellarCatalog
        from orbit.models import RefinedAsteroid
        import os

        refAsteroid = RefinedAsteroid.objects.get(pk=2)

        # ephemeris = os.path.join(refAsteroid.relative_path, 'teste.eph')
        ephemeris = os.path.join(refAsteroid.relative_path, '1999RB216.eph')

        print(ephemeris)

        stc = StellarCatalog()

        stc.generate_catalog(ephemeris=ephemeris, output_path=refAsteroid.relative_path)

        result = dict({
            'success': True,
        })

    return Response(result)
