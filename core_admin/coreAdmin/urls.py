"""coreAdmin URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from django.conf.urls.static import static
from django.conf import settings
from django.conf.urls import url
from django.views.decorators.csrf import csrf_exempt
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken.views import obtain_auth_token
from common import views as common_views

from tno.views import UserViewSet, PointingViewSet, SkybotOutputViewSet, ObjectClassViewSet, CustomListViewSet, \
    ProccessViewSet, CatalogViewSet
from praia.views import PraiaRunViewSet, PraiaConfigurationViewSet

from orbit.views import OrbitRunViewSet, RefinedAsteroidViewSet, RefinedOrbitViewSet, RefinedOrbitInputViewSet

from predict.views import *

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'pointing', PointingViewSet)
router.register(r'skybotoutput', SkybotOutputViewSet)

router.register(r'orbit_run', OrbitRunViewSet)
router.register(r'refined_asteroid', RefinedAsteroidViewSet)
router.register(r'refined_orbit', RefinedOrbitViewSet)
router.register(r'refined_input', RefinedOrbitInputViewSet)

router.register(r'predict_run', PredictRunViewSet)
router.register(r'predict_asteroid', PredictAsteroidViewSet)
router.register(r'predict_input', PredictInputViewSet)
router.register(r'predict_output', PredictOutputViewSet)
router.register(r'leap_seconds', LeapSecondsViewSet)
router.register(r'bsp_planetary', BspPlanetaryViewSet)



# router.register(r'observation', ObservationViewSet)
# router.register(r'orbital_parameter', OrbitalParameterViewSet)

router.register(r'customlist', CustomListViewSet)
router.register(r'proccess', ProccessViewSet)
router.register(r'praia_run', PraiaRunViewSet)
router.register(r'praia_configuration', PraiaConfigurationViewSet)


router.register(r'catalog', CatalogViewSet)


urlpatterns = router.urls

urlpatterns += [
                   path('admin/', admin.site.urls),
                   url(r'^obtain-auth-token/$', csrf_exempt(obtain_auth_token)),
                   url(r'^teste/', common_views.teste),
               ] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
