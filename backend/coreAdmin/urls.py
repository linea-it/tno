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
from common import views as common_views
from des.views import management_tables as des_management_views
from des.views import (
    CcdViewSet,
    DesSkybotPositionViewSet,
    ExposureViewSet,
    SkybotByDynclassViewSet,
    SkybotByYearViewSet,
    SkybotJobResultViewSet,
    SkybotJobViewSet,
    OrbitTraceJobViewSet,
    OrbitTraceJobResultViewSet,
    SummaryDynclassViewSet,
    ObservationViewSet
)
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, re_path, include
from django.views.decorators.csrf import csrf_exempt
from rest_framework.authtoken.views import obtain_auth_token
from rest_framework.routers import DefaultRouter
from skybot.views import PositionViewSet
from tno.views import AsteroidViewSet, UserViewSet, OccultationViewSet, LeapSecondViewSet, BspPlanetaryViewSet, CatalogViewSet, PredictionJobViewSet, PredictionJobResultViewSet

router = DefaultRouter()
router.register(r"users", UserViewSet)

router.register(r"des/skybot_job", SkybotJobViewSet)
router.register(r"des/orbit_trace_job", OrbitTraceJobViewSet)
router.register(r"des/orbit_trace_job_result", OrbitTraceJobResultViewSet)
router.register(r"des/exposure", ExposureViewSet)
router.register(r"des/ccd", CcdViewSet)
router.register(r"des/skybot_job_result", SkybotJobResultViewSet)
router.register(
    r"des/skybot_position", DesSkybotPositionViewSet, basename="des_skybot_position"
)
router.register(r"des/summary_dynclass", SummaryDynclassViewSet)
router.register(r"des/dashboard/skybot_by_year", SkybotByYearViewSet)
router.register(r"des/dashboard/skybot_by_dynclass", SkybotByDynclassViewSet)
router.register(r"des/observation", ObservationViewSet)



router.register(r"skybot/position", PositionViewSet)

router.register(r"asteroids", AsteroidViewSet)

router.register(r"occultations", OccultationViewSet)

router.register(r"leap_second", LeapSecondViewSet)
router.register(r"bsp_planetary", BspPlanetaryViewSet)
router.register(r"catalog", CatalogViewSet)

router.register(r"prediction_job", PredictionJobViewSet)

router.register(r"prediction_job_result", PredictionJobResultViewSet)

urlpatterns = [
    path("admin/", admin.site.urls),
    re_path(r"^api/", include(router.urls)),
    re_path(r"^api/obtain-auth-token/$", csrf_exempt(obtain_auth_token)),
    path("api/auth/", include("rest_framework.urls")),
    re_path(r"^api/logout/", common_views.logout_view),
    re_path(r"^api/read_file", common_views.read_file),
    re_path(r"^api/read_csv", common_views.read_csv),
    re_path(r"^api/teste", common_views.teste),
    re_path(r"^api/test_background_task", common_views.test_background_task),
    re_path(
        r"^api/des/clear_des_data_preparation_tables",
        des_management_views.clear_des_data_preparation_tables,
    ),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
