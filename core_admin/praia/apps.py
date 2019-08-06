from django.apps import AppConfig


class PraiaConfig(AppConfig):
    name = 'praia'

    def ready(self):
        from . import signals

