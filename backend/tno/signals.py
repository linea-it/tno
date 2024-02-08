import errno

# from .models import CustomList, Proccess
# from .skybotoutput import FilterObjects
# from tno.proccess import ProccessManager
import logging
import os
from concurrent import futures

from django.conf import settings
from django.contrib.auth.models import User
from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver
from rest_framework.authtoken.models import Token


@receiver(post_save, sender=User)
def init_new_user(sender, instance, signal, created, **kwargs):
    """
    This method creates an access token every time a new user is created.
    """
    if created:
        Token.objects.create(user=instance)
