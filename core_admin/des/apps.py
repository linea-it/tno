from django.apps import AppConfig


class DesConfig(AppConfig):
    name = 'des'

    def ready(self):
        """
            Ao iniciar o app des, 
            inicia tambem a scheduler dos pipelines 
            
        """


        import des.skybot.daemon 
        # start_des_skybot_daemon()
        # print("Des Skybot Pipeline Daemon - Ok")


