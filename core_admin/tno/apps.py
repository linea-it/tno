from django.apps import AppConfig


class TnoConfig(AppConfig):
    name = 'tno'

    def ready(self):
        from . import signals
        
        print("Ready")

        from tno import condor 
        condor.start_check_jobs()