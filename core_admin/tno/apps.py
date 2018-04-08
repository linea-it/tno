from django.apps import AppConfig


class TnoConfig(AppConfig):
    name = 'tno'

    def ready(self):
        from . import signals
