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
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))y
"""
from django.conf import settings
from django.conf.urls import include, url
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path
from django.views.decorators.csrf import csrf_exempt
from rest_framework.authtoken.views import obtain_auth_token
from rest_framework.routers import DefaultRouter

from common import views as common_views
from des.views import (CcdViewSet, DesSkybotPositionViewSet,
                       DownloadCcdJobViewSet, ExposureViewSet,
                       SkybotJobResultViewSet, SkybotJobViewSet,
                       SummaryDynclassViewSet,
                       SkybotByYearViewSet,
                       SkybotByDynclassViewSet)
from skybot.views import PositionViewSet
from tno.views import UserViewSet, AsteroidViewSet

# from orbit.views import (BspJplViewSet, ObservationFileViewSet,
#                          OrbitalParameterViewSet, OrbitRunViewSet,
#                          RefinedAsteroidViewSet, RefinedOrbitInputViewSet,
#                          RefinedOrbitViewSet)
# from praia.views import (AstrometryAsteroidViewSet, AstrometryInputViewSet,
#                          AstrometryOutputViewSet, PraiaConfigurationViewSet,
#                          PraiaRunViewSet)
# from predict.views import *

# from tno.views import (CatalogViewSet, CcdImageViewSet, CustomListViewSet,
#                        JohnstonArchiveViewSet, ObjectClassViewSet,
#                        PointingViewSet, ProccessViewSet, SkybotOutputViewSet,
#                        SkybotRunViewSet, UserViewSet)

router = DefaultRouter()
router.register(r'users', UserViewSet)

# router.register(r'pointing', PointingViewSet)
# router.register(r'ccd_image', CcdImageViewSet)
# router.register(r'skybotoutput', SkybotOutputViewSet)
# router.register(r'known_tnos_johnston', JohnstonArchiveViewSet)


# router.register(r'orbit_run', OrbitRunViewSet)
# router.register(r'refined_asteroid', RefinedAsteroidViewSet)
# router.register(r'refined_orbit', RefinedOrbitViewSet)
# router.register(r'refined_input', RefinedOrbitInputViewSet)

# router.register(r'predict_run', PredictRunViewSet)
# router.register(r'predict_asteroid', PredictAsteroidViewSet)
# router.register(r'predict_input', PredictInputViewSet)
# router.register(r'predict_output', PredictOutputViewSet)
# router.register(r'occultation', OccultationViewSet, base_name='occultations')
# router.register(r'leap_seconds', LeapSecondsViewSet)
# router.register(r'bsp_planetary', BspPlanetaryViewSet)
# router.register(r'skybot_run', SkybotRunViewSet)
# router.register(r'bsp_jpl', BspJplViewSet)
# router.register(r'observation_files', ObservationFileViewSet)
# router.register(r'orbital_parameter', OrbitalParameterViewSet)


# router.register(r'customlist', CustomListViewSet)
# router.register(r'proccess', ProccessViewSet)
# router.register(r'praia_run', PraiaRunViewSet)
# router.register(r'praia_configuration', PraiaConfigurationViewSet)
# router.register(r'astrometry_asteroids', AstrometryAsteroidViewSet)
# router.register(r'astrometry_input', AstrometryInputViewSet)
# router.register(r'astrometry_output', AstrometryOutputViewSet)


# router.register(r'catalog', CatalogViewSet)

router.register(r'des/skybot_job', SkybotJobViewSet)
router.register(r'des/exposure', ExposureViewSet)
router.register(r'des/ccd', CcdViewSet)
router.register(r'des/skybot_job_result', SkybotJobResultViewSet)
router.register(r'des/skybot_position', DesSkybotPositionViewSet,
                base_name='des_skybot_position')
router.register(r'des/summary_dynclass', SummaryDynclassViewSet)

router.register(r'des/download_ccd/job', DownloadCcdJobViewSet,
                base_name='des_download_ccd_job')

router.register(r'des/dashboard/skybot_by_year',
                SkybotByYearViewSet)
router.register(r'des/dashboard/skybot_by_dynclass',
                SkybotByDynclassViewSet)

router.register(r'skybot/position', PositionViewSet)

router.register(r'asteroids', AsteroidViewSet)


urlpatterns = [
    path('admin/', admin.site.urls),
    url(r'^api/', include(router.urls)),
    url(r'^api/obtain-auth-token/$', csrf_exempt(obtain_auth_token)),
    path('api/auth/', include('rest_framework.urls')),
    url(r'^api/logout/', common_views.logout_view),
    url(r'^api/import-skybot', common_views.import_skybot),
    url(r'^api/read_file', common_views.read_file),
    url(r'^api/read_csv', common_views.read_csv),
    url(r'^api/teste/', common_views.teste),
] + static('api'+settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Adiciona a rota de authenticacao com Shibboleth se a variavel AUTH_SHIB_URL tiver valor
if settings.AUTH_SHIB_URL is not None:
    urlpatterns.append(url(r'^api/auth_shibboleth/',
                           common_views.auth_shibboleth))
