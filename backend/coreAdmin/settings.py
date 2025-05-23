"""
Django settings for coreAdmin project.

Generated by 'django-admin startproject' using Django 2.0.3.

For more information on this file, see
https://docs.djangoproject.com/en/2.0/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/2.0/ref/settings/
"""

import os
import urllib.parse
from pathlib import Path

import environ
from kombu import Exchange, Queue

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

env = environ.Env()

READ_DOT_ENV_FILE = env.bool("DJANGO_READ_DOT_ENV_FILE", default=False)
if READ_DOT_ENV_FILE:
    # OS environment variables take precedence over variables from .env
    env.read_env(str(BASE_DIR / ".env"))

# GENERAL
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#debug
DEBUG = env.bool("DJANGO_DEBUG", False)
# https://docs.djangoproject.com/en/dev/ref/settings/#secret-key
# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = env("DJANGO_SECRET_KEY", default="fasheefdhjsyaefdvcswqtfgyhudsaipfygbdsa")
# https://docs.djangoproject.com/en/dev/ref/settings/#allowed-hosts
# CORS com essa combinação o serv de desenvolvimento do frontend consegue se authenticar
if DEBUG:
    ALLOWED_HOSTS = ["*"]
    CORS_ALLOW_CREDENTIALS = True
    SESSION_COOKIE_SAMESITE = None
else:
    ALLOWED_HOSTS = env.list(
        "DJANGO_ALLOWED_HOSTS", default=["solarsystem.linea.org.br"]
    )

# the hostname and port number of the current Server URL
SITE_URL = "//localhost"

# Internationalization
# https://docs.djangoproject.com/en/2.0/topics/i18n/
# Local time zone. Choices are
# http://en.wikipedia.org/wiki/List_of_tz_zones_by_name
# though not all of them may be available with every OS.
# In Windows, this must be set to your system time zone.
TIME_ZONE = "UTC"
# https://docs.djangoproject.com/en/dev/ref/settings/#language-code
LANGUAGE_CODE = "en-us"
# https://docs.djangoproject.com/en/dev/ref/settings/#use-i18n
USE_I18N = True
# https://docs.djangoproject.com/en/dev/ref/settings/#use-tz
USE_TZ = True
# https://docs.djangoproject.com/en/dev/ref/settings/#use-i18n
USE_L10N = True

# DATABASES
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#databases
DATABASE_ROUTERS = ["tno.router.CatalogRouter"]


# https://docs.djangoproject.com/en/stable/ref/settings/#std:setting-DEFAULT_AUTO_FIELD
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# Django Admin Database
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql_psycopg2",
        "NAME": env("DATABASE_ADMIN_DB", default="postgres"),
        "USER": env("DATABASE_ADMIN_USER", default="postgres"),
        "PASSWORD": env("DATABASE_ADMIN_PASSWORD", default="postgres"),
        "HOST": env("DATABASE_ADMIN_HOST", default="database"),
        "PORT": env("DATABASE_ADMIN_PORT", default=5432),
        # IF Need Schema
        # "OPTIONS": {"options": "-c search_path=<DB_SCHEMA>,public"},
    },
    "catalog": {
        "ENGINE": "django.db.backends.postgresql_psycopg2",
        "NAME": env("DATABASE_CATALOG_DB", default="postgres"),
        "USER": env("DATABASE_CATALOG_USER", default="postgres"),
        "PASSWORD": env("DATABASE_CATALOG_PASSWORD", default="postgres"),
        "HOST": env("DATABASE_CATALOG_HOST", default="database"),
        "PORT": env("DATABASE_CATALOG_PORT", default=5432),
    },
    "mpc": {
        "ENGINE": "django.db.backends.postgresql_psycopg2",
        "NAME": env("DATABASE_MPC_DB", default="mpc_sbn"),
        "USER": env("DATABASE_MPC_USER", default="postgres"),
        "PASSWORD": env("DATABASE_MPC_PASSWORD", default="postgres"),
        "HOST": env("DATABASE_MPC_HOST", default="database"),
        "PORT": env("DATABASE_MPC_PORT", default=5432),
    },
}
DATABASES["default"]["ATOMIC_REQUESTS"] = True
# IF Database need a Schema use this
# DATABASES["default"]["OPTIONS"] = {"options": "-c search_path=<DB_SCHEMA>,public"}

# Diretorio com scripts externos.
BIN_DIR = os.path.join(BASE_DIR, "bin")

# PROJECT PATHS
# estes diretorios estao montados no container utilizando variaveis de ambiente, mas para o container sempre vao ser
# os mesmos listados aqui.
LOG_DIR = "/logs"
LOGGING_LEVEL = "INFO"
ARCHIVE_DIR = Path("/archive")
PROCCESS_DIR = "/proccess"
DES_CCD_CATALOGS_DIR = "/archive/des/public/catalogs/"

# Sub diretorios que ficam dentro de /archive

SKYBOT_ROOT = "skybot_output"
SKYBOT_OUTPUT = Path.joinpath(ARCHIVE_DIR, SKYBOT_ROOT)
if not SKYBOT_OUTPUT.exists():
    SKYBOT_OUTPUT.mkdir(parents=True, exist_ok=True)

# JHONSTONS_ARCHIVE_ROOT = "jhonstons_archive"
# JHONSTONS_ARCHIVE = os.path.join(ARCHIVE_DIR, JHONSTONS_ARCHIVE_ROOT)
# if not os.path.exists(JHONSTONS_ARCHIVE):
#     os.mkdir(JHONSTONS_ARCHIVE)

MEDIA_ROOT = ARCHIVE_DIR
MEDIA_URL = "/media/"

MEDIA_TMP_DIR = Path.joinpath(MEDIA_ROOT, "tmp")
if not MEDIA_TMP_DIR.exists():
    MEDIA_TMP_DIR.mkdir(parents=True, exist_ok=False)

MEDIA_TMP_URL = urllib.parse.urljoin(MEDIA_URL, "tmp/")

DATA_URL = "/data/"

DATA_TMP_DIR = MEDIA_TMP_DIR
DATA_TMP_URL = urllib.parse.urljoin(DATA_URL, "tmp/")


# Este diretório é utilizado para armazenar os arquivos de entrada para o processamento das predições.
ASTEROIDS_INPUTS_DIR = Path.joinpath(ARCHIVE_DIR, "asteroids")
if not ASTEROIDS_INPUTS_DIR.exists():
    ASTEROIDS_INPUTS_DIR.mkdir(parents=True, exist_ok=False)

PREDICTION_URL = "maps/"
PREDICTION_MAP_DIR = MEDIA_ROOT.joinpath("maps")
if not PREDICTION_MAP_DIR.exists():
    PREDICTION_MAP_DIR.mkdir(parents=True, exist_ok=False)

PREDICTION_MAP_URL = urllib.parse.urljoin(DATA_URL, PREDICTION_URL)
# Tamanho maximo em MB do diretório de mapas.
PREDICTION_MAP_MAX_FOLDER_SIZE = 50
# Determina a quantidade de mapas/subtasks submetidos a cada execução da task
# Em desenvolvimento um numero muito alto pode incomodo devido ao consumo de processamento.
PREDICTION_MAP_BLOCK_SIZE = 100

# sora map url and dir
SORA_MAP_DIR = MEDIA_ROOT.joinpath("tmp/maps")
if not SORA_MAP_DIR.exists():
    SORA_MAP_DIR.mkdir(parents=True, exist_ok=False)
SORA_MAP_URL = urllib.parse.urljoin(DATA_URL, "tmp/maps")

ENVIRONMENT_NAME = env("DJANGO_ENVIRONMENT_NAME", default="Development")

# Emails
# Notifications Email
EMAIL_NEWSLETTER_NOREPLY = "noreply-solarsystem@linea.org.br"
EMAIL_NOTIFICATION = os.environ.get("EMAIL_NOTIFICATION", "sso-portal@linea.org.br")


EMAIL_HELPDESK = os.environ.get("EMAIL_HELPDESK", "helpdesk@linea.org.br")

EMAIL_NOTIFICATION_COPY_TO = list(
    [os.environ.get("EMAIL_NOTIFICATION", "sso-portal@linea.org.br")]
)

EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_USE_TLS = True
EMAIL_HOST = "smtp.linea.org.br"
EMAIL_PORT = 587
EMAIL_HOST_USER = ""
EMAIL_HOST_PASSWORD = ""


APPLICATION_NAME = "Solar System - LIneA"
# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/2.0/howto/deployment/checklist/


# Application definition

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # third-party apps
    "rest_framework",
    "rest_framework.authtoken",
    "drfpasswordless",
    "django_filters",
    "url_filter",
    "corsheaders",
    "shibboleth",
    "django_celery_results",
    "drf_spectacular",
    # "django_celery_beat",
    # Project Apps''
    "common",
    "tno",
    "skybot",
    "des",
    "newsletter",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "common.shibboleth.ShibbolethMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "current_user.CurrentUserMiddleware",
]

ROOT_URLCONF = "coreAdmin.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [
            BASE_DIR,
            os.path.join(BASE_DIR, "templates"),
            os.path.join(BASE_DIR, "newsletter/templates"),
        ],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
                "django_settings_export.settings_export",
            ],
        },
    },
]

STATICFILES_DIRS = (os.path.join(BASE_DIR, "staticfiles"),)

WSGI_APPLICATION = "coreAdmin.wsgi.application"


# Password validation
# https://docs.djangoproject.com/en/2.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/2.0/howto/static-files/

STATIC_URL = "/django_static/"
STATIC_ROOT = os.path.join(BASE_DIR, "django_static")

AUTHENTICATION_BACKENDS = ("django.contrib.auth.backends.ModelBackend",)

# https://docs.djangoproject.com/en/4.1/ref/settings/#csrf-cookie-name
CSRF_COOKIE_NAME = "tno.csrftoken"


ACCOUNT_AUTHENTICATED_LOGIN_REDIRECTS = True
LOGIN_REDIRECT_URL = "/"

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework.authentication.TokenAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ),
    "DEFAULT_PAGINATION_CLASS": "common.pagination.StandardResultsSetPagination",
    "PAGE_SIZE": 100,
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticatedOrReadOnly",
    ),
    "DEFAULT_FILTER_BACKENDS": (
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ),
    "TEST_REQUEST_DEFAULT_FORMAT": "json",
    # https://www.django-rest-framework.org/api-guide/relations/#select-field-cutoffs
    "HTML_SELECT_CUTOFF": 50,
    # https://drf-spectacular.readthedocs.io/en/latest/readme.html#installation
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
}

# Disable browsable api in testing/production
if not DEBUG:
    REST_FRAMEWORK["DEFAULT_RENDERER_CLASSES"] = (
        "rest_framework.renderers.JSONRenderer",
    )

# https://drf-spectacular.readthedocs.io/en/latest/settings.html
SPECTACULAR_SETTINGS = {
    "TITLE": "Solar System LIneA API",
    "DESCRIPTION": "Your project description",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
    # OTHER SETTINGS
}


# TODO: Talves nao esteja mais sendo utilizado
# Url para download dos CCDs,
# usar None para desativar esta opcao.
# ex: 'https://desar2.cosmology.illinois.edu/DESFiles/desarchive/'
# DES_ARCHIVE_URL = os.getenv("DES_ARCHIVE_URL")
# if DES_ARCHIVE_URL is not None:
#     try:
#         # Username e Password no DES.
#         DES_USERNAME = os.getenv("DES_USERNAME")
#         DES_PASSWORD = os.getenv("DES_PASSWORD")
#     except Exception as e:
#         raise Exception("DES user settings are required in .env file")


# Skybot Server
# Url para o serviço do skybot sempre com a barra no final.
# Skybot do linea: SKYBOT_SERVER=http://srvskybot.linea.org.br/webservices/skybot/
# Skybot da Franca: SKYBOT_SERVER="http://vo.imcce.fr/webservices/skybot/"
SKYBOT_SERVER = "http://vo.imcce.fr/webservices/skybot/"

# Memcached
CACHE_HOST = os.environ.get("CACHE_HOST", "memcached")
CACHE_PORT = os.environ.get("CACHE_PORT", 11211)
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.memcached.PyMemcacheCache",
        "LOCATION": f"{CACHE_HOST}:{CACHE_PORT}",
    }
}

# CELERY_BROKER_URL = os.getenv(
#     "CELERY_BROKER_URL", "amqp://tno:adminadmin@rabbit:5672/tno_vhost"
# )
# CELERY_RESULT_BACKEND = "django-db"

# Celery
# settings.py – you still need to declare the queues

CELERY_QUEUES = (
    Queue(
        "default",
        Exchange("default"),
        routing_key="default",
        queue_arguments={"x-max-priority": 5},
    ),
    Queue(
        "thumbnails",
        Exchange("thumbnails"),
        routing_key="thumbnails",
        queue_arguments={"x-max-priority": 2},
    ),
    Queue(
        "scheduled",
        Exchange("scheduled"),
        routing_key="scheduled",
        queue_arguments={"x-max-priority": 8},
    ),
    Queue(
        "maintenance",
        Exchange("maintenance"),
        routing_key="maintenance",
        queue_arguments={"x-max-priority": 7},
    ),
    Queue(
        "user-requested",
        Exchange("user-requested"),
        routing_key="user-requested",
        queue_arguments={"x-max-priority": 10},
    ),
)

# ------------------------------------------------------------------------------
if USE_TZ:
    # https://docs.celeryq.dev/en/stable/userguide/configuration.html#std:setting-timezone
    CELERY_TIMEZONE = TIME_ZONE
# https://docs.celeryq.dev/en/stable/userguide/configuration.html#std:setting-broker_url
CELERY_BROKER_URL = env("DJANGO_CELERY_BROKER_URL")
CELERY_WORKER_CONCURRENCY = env.int("DJANGO_CELERY_WORKER_CONCURRENCY", 2)
# https://docs.celeryq.dev/en/stable/userguide/configuration.html#std:setting-result_backend
CELERY_RESULT_BACKEND = "django-db"
# https://docs.celeryq.dev/en/stable/userguide/configuration.html#result-extended
CELERY_RESULT_EXTENDED = True
# https://docs.celeryq.dev/en/stable/userguide/configuration.html#result-backend-always-retry
# https://github.com/celery/celery/pull/6122
CELERY_RESULT_BACKEND_ALWAYS_RETRY = True
# https://docs.celeryq.dev/en/stable/userguide/configuration.html#result-backend-max-retries
CELERY_RESULT_BACKEND_MAX_RETRIES = 10
# https://docs.celeryq.dev/en/stable/userguide/configuration.html#std:setting-accept_content
CELERY_ACCEPT_CONTENT = ["json"]
# https://docs.celeryq.dev/en/stable/userguide/configuration.html#std:setting-task_serializer
CELERY_TASK_SERIALIZER = "json"
# https://docs.celeryq.dev/en/stable/userguide/configuration.html#std:setting-result_serializer
CELERY_RESULT_SERIALIZER = "json"
# https://docs.celeryq.dev/en/stable/userguide/configuration.html#task-time-limit
# TODO: set to whatever value is adequate in your circumstances
CELERY_TASK_TIME_LIMIT = 7300
# https://docs.celeryq.dev/en/stable/userguide/configuration.html#task-soft-time-limit
# TODO: set to whatever value is adequate in your circumstances
CELERY_TASK_SOFT_TIME_LIMIT = 7200
# https://docs.celeryq.dev/en/stable/userguide/configuration.html#beat-scheduler
# CELERY_BEAT_SCHEDULER = "django_celery_beat.schedulers:DatabaseScheduler"
# https://docs.celeryq.dev/en/stable/userguide/configuration.html#worker-send-task-events
CELERY_WORKER_SEND_TASK_EVENTS = True
# https://docs.celeryq.dev/en/stable/userguide/configuration.html#std-setting-task_send_sent_event
CELERY_TASK_SEND_SENT_EVENT = True

# Autenticacao com Shibboleth desativada por padrão
SHIBBOLETH_ENABLED = False

# Prediction Jobs for Updated Asteroids Automatic
PREDICTION_JOB_AUTO_UPDATE = env.bool("PREDICTION_JOB_AUTO_UPDATE", False)
PORTAL_INTERNAL_USER = "autobot"
# Quantidade maxima de asteroids por job criado automaticamente.
PREDICTION_JOB_CHUNK_SIZE = 2000
# Limita os jobs de predição para executarem apenas para estas classes.
PREDICTION_JOB_BASE_DYNCLASS = ["Trojan", "Centaur", "Kuiper Belt Object"]

PASSWORDLESS_AUTH = {
    "PASSWORDLESS_AUTH_TYPES": [
        "EMAIL",
    ],
    "PASSWORDLESS_EMAIL_NOREPLY_ADDRESS": "noreply-solarsystem@linea.org.br",
    "PASSWORDLESS_AUTH_PREFIX": "api/pwl/auth/",
    "PASSWORDLESS_VERIFY_PREFIX": "api/pwl/auth/verify/",
    "PASSWORDLESS_REGISTER_NEW_USERS": False,
    "PASSWORDLESS_EMAIL_SUBJECT": "LIneA Solar System Portal - Validation Token",
    "PASSWORDLESS_EMAIL_PLAINTEXT_MESSAGE": "Enter this token to sign in your LIneA Solar System Portal: %s",
    "PASSWORDLESS_EMAIL_TOKEN_HTML_TEMPLATE_NAME": "validation_token_email_template.html",
}

# NEWSLETTER SUBSCRIPTION
NEWSLETTER_SUBSCRIPTION_ENABLED = env.bool("NEWSLETTER_SUBSCRIPTION_ENABLED", False)

# Aqui é feita a importação do arquivo de variaveis locais.
# As variaveis declaradas neste arquivo sobrescrevem as variaveais declaradas antes
# deste import. isso é usado para permitir diferentes configurações por ambiente.
# basta cada ambiente ter o seu arquivo local_vars.py.
try:
    from coreAdmin.local_settings import *
except Exception:
    raise FileNotFoundError(
        "local_settings.py file not found. it is necessary that the coraAdmin/local_settings.py file exists with the specific settings of this environment."
    )

SETTINGS_EXPORT = []

# Shibboleth Authentication
if SHIBBOLETH_ENABLED is True:
    # https://github.com/Brown-University-Library/django-shibboleth-remoteuser
    SHIBBOLETH_ATTRIBUTE_MAP = {
        "eppn": (True, "username"),
        "cn": (False, "first_name"),
        "sn": (False, "last_name"),
        "Shib-inetOrgPerson-mail": (False, "email"),
    }
    SHIBBOLETH_GROUP_ATTRIBUTES = "Shibboleth"
    # Including Shibboleth authentication:
    AUTHENTICATION_BACKENDS += ("shibboleth.backends.ShibbolethRemoteUserBackend",)

    SHIBBOLETH_ENABLED = True

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "standard": {"format": "%(asctime)s [%(levelname)s] %(message)s"},
    },
    "handlers": {
        "file": {
            "level": LOGGING_LEVEL,
            "class": "logging.handlers.RotatingFileHandler",
            "filename": os.path.join(LOG_DIR, "django.log"),
            "maxBytes": 1024 * 1024 * 5,  # 5 MB
            "backupCount": 5,
        },
        # "proccess": {
        #     "level": LOGGING_LEVEL,
        #     "class": "logging.handlers.RotatingFileHandler",
        #     "maxBytes": 1024 * 1024 * 5,  # 5 MB
        #     "backupCount": 5,
        #     "filename": os.path.join(LOG_DIR, "proccess.log"),
        #     "formatter": "standard",
        # },
        # Skybot Download
        "skybot": {
            "level": LOGGING_LEVEL,
            "class": "logging.handlers.RotatingFileHandler",
            "maxBytes": 1024 * 1024 * 5,  # 5 MB
            "backupCount": 5,
            "filename": os.path.join(LOG_DIR, "skybot.log"),
            "formatter": "standard",
        },
        # Skybot Load data
        "skybot_load_data": {
            "level": LOGGING_LEVEL,
            "class": "logging.handlers.RotatingFileHandler",
            "maxBytes": 1024 * 1024 * 5,  # 5 MB
            "backupCount": 5,
            "filename": os.path.join(LOG_DIR, "skybot_load_data.log"),
            "formatter": "standard",
        },
        "shibboleth": {
            "level": LOGGING_LEVEL,
            "class": "logging.handlers.RotatingFileHandler",
            "maxBytes": 1024 * 1024 * 5,  # 5 MB
            "backupCount": 5,
            "filename": os.path.join(LOG_DIR, "auth_shibboleth.log"),
            "formatter": "standard",
        },
        "asteroids": {
            "level": LOGGING_LEVEL,
            "class": "logging.handlers.RotatingFileHandler",
            "maxBytes": 1024 * 1024 * 5,  # 5 MB
            "backupCount": 5,
            "filename": os.path.join(LOG_DIR, "asteroids.log"),
            "formatter": "standard",
        },
        "garbage_collector": {
            "level": LOGGING_LEVEL,
            "class": "logging.handlers.RotatingFileHandler",
            "maxBytes": 1024 * 1024 * 5,  # 5 MB
            "backupCount": 5,
            "filename": os.path.join(LOG_DIR, "garbage_collector.log"),
            "formatter": "standard",
        },
        "predict_maps": {
            "level": LOGGING_LEVEL,
            "class": "logging.handlers.RotatingFileHandler",
            "maxBytes": 1024 * 1024 * 5,  # 5 MB
            "backupCount": 5,
            "filename": os.path.join(LOG_DIR, "predict_maps.log"),
            "formatter": "standard",
        },
        "predict_events": {
            "level": LOGGING_LEVEL,
            "class": "logging.handlers.RotatingFileHandler",
            "maxBytes": 1024 * 1024 * 5,  # 5 MB
            "backupCount": 5,
            "filename": os.path.join(LOG_DIR, "predict_events.log"),
            "formatter": "standard",
        },
        "subscription": {
            "level": LOGGING_LEVEL,
            "class": "logging.handlers.RotatingFileHandler",
            "maxBytes": 1024 * 1024 * 5,  # 5 MB
            "backupCount": 5,
            "filename": os.path.join(LOG_DIR, "subscription.log"),
            "formatter": "standard",
        },
        "occultation_highlights": {
            "level": LOGGING_LEVEL,
            "class": "logging.handlers.RotatingFileHandler",
            "maxBytes": 1024 * 1024 * 5,  # 5 MB
            "backupCount": 5,
            "filename": os.path.join(LOG_DIR, "occ_highlights.log"),
            "formatter": "standard",
        },
        "asteroid_cache": {
            "level": LOGGING_LEVEL,
            "class": "logging.handlers.RotatingFileHandler",
            "maxBytes": 1024 * 1024 * 5,  # 5 MB
            "backupCount": 5,
            "filename": os.path.join(LOG_DIR, "asteroid_cache.log"),
            "formatter": "standard",
        },
    },
    "loggers": {
        "django": {
            "handlers": ["file"],
            "level": LOGGING_LEVEL,
            "propagate": False,
        },
        # "proccess": {
        #     "handlers": ["proccess"],
        #     "level": LOGGING_LEVEL,
        #     "propagate": True,
        # },
        "skybot": {
            "handlers": ["skybot"],
            "level": LOGGING_LEVEL,
            "propagate": False,
        },
        "skybot_load_data": {
            "handlers": ["skybot_load_data"],
            "level": LOGGING_LEVEL,
            "propagate": False,
        },
        "shibboleth": {
            "handlers": ["shibboleth"],
            "level": LOGGING_LEVEL,
            "propagate": False,
        },
        "asteroids": {
            "handlers": ["asteroids"],
            "level": LOGGING_LEVEL,
            "propagate": False,
        },
        "garbage_collector": {
            "handlers": ["garbage_collector"],
            "level": LOGGING_LEVEL,
            "propagate": False,
        },
        "predict_maps": {
            "handlers": ["predict_maps"],
            "level": LOGGING_LEVEL,
            "propagate": False,
        },
        "predict_events": {
            "handlers": ["predict_events"],
            "level": LOGGING_LEVEL,
            "propagate": False,
        },
        "subscription": {
            "handlers": ["subscription"],
            "level": LOGGING_LEVEL,
            "propagate": False,
        },
        "occultation_highlights": {
            "handlers": ["occultation_highlights"],
            "level": LOGGING_LEVEL,
            "propagate": False,
        },
        "asteroid_cache": {
            "handlers": ["asteroid_cache"],
            "level": LOGGING_LEVEL,
            "propagate": False,
        },
    },
}
