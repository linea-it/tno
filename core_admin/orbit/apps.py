from django.apps import AppConfig


class OrbitConfig(AppConfig):
    name = 'orbit'

    def ready(self):
        from . import signals