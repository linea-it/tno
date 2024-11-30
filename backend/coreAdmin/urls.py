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
from des.views import (
    CcdViewSet,
    DesSkybotPositionViewSet,
    ExposureViewSet,
    ObservationViewSet,
    OrbitTraceJobResultViewSet,
    OrbitTraceJobViewSet,
    SkybotByDynclassViewSet,
    SkybotByYearViewSet,
    SkybotJobResultViewSet,
    SkybotJobViewSet,
    SummaryDynclassViewSet,
)
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path, re_path
from django.views.decorators.csrf import csrf_exempt
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)
from newsletter.views import EventFilterViewSet, SubmissionViewSet, SubscriptionViewSet
from rest_framework.authtoken.views import obtain_auth_token
from rest_framework.routers import DefaultRouter, SimpleRouter
from skybot.views import PositionViewSet
from tno.views import (
    AsteroidJobViewSet,
    AsteroidViewSet,
    BspPlanetaryViewSet,
    CatalogViewSet,
    LeapSecondViewSet,
    OccultationViewSet,
    PredictionJobResultViewSet,
    PredictionJobViewSet,
    UserViewSet,
)

if settings.DEBUG:
    router = DefaultRouter()
else:
    router = SimpleRouter()

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


router.register(r"asteroid_jobs", AsteroidJobViewSet)
router.register(r"asteroids", AsteroidViewSet)

router.register(r"occultations", OccultationViewSet, basename="occultations")

router.register(r"leap_second", LeapSecondViewSet)
router.register(r"bsp_planetary", BspPlanetaryViewSet)
router.register(r"catalog", CatalogViewSet)

router.register(r"prediction_job", PredictionJobViewSet)

router.register(r"prediction_job_result", PredictionJobResultViewSet)

router.register(r"subscription", SubscriptionViewSet)
router.register(r"event_filter", EventFilterViewSet, basename="event_filter")
router.register(r"submission", SubmissionViewSet, basename="submission")


urlpatterns = [
    path("admin/", admin.site.urls),
    re_path(r"^api/", include(router.urls)),
    path("api/auth/", include("rest_framework.urls")),
    path("", include("drfpasswordless.urls")),
    re_path(r"^api/which_environment", common_views.which_environment),
    re_path(r"^api/environment_settings", common_views.environment_settings),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/docs/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    path(
        "api/redoc/",
        SpectacularRedocView.as_view(url_name="schema"),
        name="redoc",
    ),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
