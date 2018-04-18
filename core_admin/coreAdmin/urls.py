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

from django.conf.urls import url
from django.views.decorators.csrf import csrf_exempt
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken.views import obtain_auth_token

from tno.views import UserViewSet, SkybotOutputViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'skybotoutput', SkybotOutputViewSet)


urlpatterns = router.urls

urlpatterns += [
    path('admin/', admin.site.urls),
    url(r'^obtain-auth-token/$', csrf_exempt(obtain_auth_token))
]
