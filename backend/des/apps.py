from django.apps import AppConfig


class DesConfig(AppConfig):
    name = "des"

    def ready(self):
        """
        Ao iniciar o app des,
        inicia tambem a scheduler dos pipelines

        """

        # Inicia a Scheduler do Skybot
        import des.skybot.daemon

        # Inicia a Scheduler do Download CCD
        # import des.ccd.daemon
        # Inicia a Scheduler do Des Astrometry (Orbit Trace)
        # import old_apps.astrometry_daemon
