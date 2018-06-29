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

    def __str__(self):
        return self.displayname

class Run(models.Model):

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE, default=None, verbose_name='Owner', null=True, blank=True)

    start_time = models.DateTimeField(
        verbose_name='Start Time',
        auto_now_add=True, null=True, blank=True)

    finish_time = models.DateTimeField(
        verbose_name='Finish Time',
        auto_now_add=False, null=True, blank=True)        

    # Relation With PraiaConfig
    configuration = models.ForeignKey(
        Configuration, on_delete=models.CASCADE, verbose_name='Configuration',
        null=True, blank=True, default=None
    )

    # Relation With Tno.CustomList
    input_list = models.ForeignKey(
        'tno.CustomList', on_delete=models.CASCADE, verbose_name='Input List',
        null=True, blank=True, default=None
    )

    status = models.CharField(
        max_length=10,
        verbose_name='Status', 
        default='pending', null=True, blank=True,
        choices=(('pending','Pending'),('running','Running'),('success','Success'),('error','Error'))
    )

    def __str__(self):
        return str(self.id)