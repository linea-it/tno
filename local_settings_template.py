ENVIRONMENT_NAME = "Development"
# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True
# Level do Log (INFO, DEBUG, WARNING, ERROR, CRITICAL)
LOGGING_LEVEL = DEBUG
# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = "m=5=08^4a(il)bba)$cd%f*#wrcammi(r(q#($b$n^-jz8%+j0"

# the hostname and port number of the current Server URL
# TODO: Verificar onde se ainda é utilizado?
HOST_URL = "//localhost"

# Email Confs
EMAIL_HOST = "smtp.linea.org.br"
EMAIL_PORT = 587
EMAIL_HOST_USER = ""
EMAIL_HOST_PASSWORD = ""

# Django Admin Database
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql_psycopg2",
        "NAME": "postgres",
        "USER": "postgres",
        "PASSWORD": "postgres",
        "HOST": "database",
        "PORT": 5432,
        # IF Need Schema
        # "OPTIONS": {"options": "-c search_path=<DB_SCHEMA>,public"},
    },
}

# Skybot Server
# Url para o serviço do skybot sempre com a barra no final.
# Skybot do linea: SKYBOT_SERVER=http://srvskybot.linea.org.br/webservices/skybot/
# Skybot da Franca: SKYBOT_SERVER="http://vo.imcce.fr/webservices/skybot/"
SKYBOT_SERVER = "http://vo.imcce.fr/webservices/skybot/"
SORA_OUTPUT = "/archive/sora/output"
SORA_INPUT = "/archive/sora/input"
SORA_LOG = "/log/sora_maps.log"

# Shibboleth Authentication
# Habilita ou desabilita autenticação pelo shibboleth.
# Em ambiente de desenvolvimento ou que não esteja configurado o shibboleth usar SHIBBOLETH_ENABLED = False.
# Em ambiente de produção que já esteja configurado com shibboleth usar SHIBBOLETH_ENABLED = True.
SHIBBOLETH_ENABLED = False

# Celery Configs
CELERY_BROKER_URL = "amqp://tno:adminadmin@rabbit:5672/tno_vhost"