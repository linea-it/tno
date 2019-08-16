from django.apps import AppConfig


class TnoConfig(AppConfig):
    name = 'tno'

    def ready(self):
        from . import signals
        
        print("Ready")

        from praia.pipeline.daemon import  start_astrometry_daemon
        start_astrometry_daemon()
