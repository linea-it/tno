from django.db import models
from django.conf import settings
   
class Configuration(models.Model):

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE, default=None, verbose_name='Owner', null=True, blank=True)

    creation_date = models.DateTimeField(
        verbose_name='Creation Date',
        auto_now_add=True, null=True, blank=True)

    displayname = models.CharField(
        max_length=128, verbose_name='Name')


class Run(models.Model):

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE, default=None, verbose_name='Owner', null=True, blank=True)

    start_time = models.DateTimeField(
        verbose_name='Start Time',
        auto_now_add=True, null=True, blank=True)

    finish_time = models.DateTimeField(
        verbose_name='Finish Time',
        auto_now_add=True, null=True, blank=True)        

    # Relation With PraiaConfig
    config = models.ForeignKey(
        Configuration, on_delete=models.CASCADE, verbose_name='Config',
        null=True, blank=True, default=None
    )

