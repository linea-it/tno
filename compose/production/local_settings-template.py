# Level do Log (INFO, DEBUG, WARNING, ERROR, CRITICAL)
LOGGING_LEVEL = "INFO"

# the hostname and port number of the current Server URL
# TODO: Verificar onde se ainda é utilizado?
HOST_URL = "//solarsystem.linea.org.br/"

# Email Confs
EMAIL_HOST = "smtp.linea.org.br"
EMAIL_PORT = 587
EMAIL_HOST_USER = ""
EMAIL_HOST_PASSWORD = ""
# https://docs.djangoproject.com/en/dev/ref/settings/#default-from-email
DEFAULT_FROM_EMAIL = "solarsystem <solarsystem.linea.org.br>"

# Skybot Server
# Url para o serviço do skybot sempre com a barra no final.
# Skybot do linea: SKYBOT_SERVER=http://srvskybot.linea.org.br/webservices/skybot/
# Skybot da Franca: SKYBOT_SERVER="http://vo.imcce.fr/webservices/skybot/"
SKYBOT_SERVER = "http://vo.imcce.fr/webservices/skybot/"

# Tamanho maximo em MB do diretório de mapas.
PREDICTION_MAP_MAX_FOLDER_SIZE = 2048
# Determina a quantidade de mapas/subtasks submetidos a cada execução da task
# Em desenvolvimento um numero muito alto pode incomodo devido ao consumo de processamento.
# Block_size = 10 significa que 10 mapas serão criados por hora.
PREDICTION_MAP_BLOCK_SIZE = 500

# Shibboleth Authentication
# Habilita ou desabilita autenticação pelo shibboleth.
# Em ambiente de desenvolvimento ou que não esteja configurado o shibboleth usar SHIBBOLETH_ENABLED = False.
# Em ambiente de produção que já esteja configurado com shibboleth usar SHIBBOLETH_ENABLED = True.
SHIBBOLETH_ENABLED = False
