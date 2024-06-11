# Solar Systerm Portal Develompment

<!-- TOC start (generated with https://github.com/derlin/bitdowntoc) -->

- [Setup Development Environment](#setup-development-environment)
  - [Setup Backend](#setup-backend)
  - [Setup Frontend](#setup-frontend)
  - [Setup Pipeline Predict Occultation](#setup-pipeline-predict-occultation)
  - [Setup Pipeline Skybot Discovery](#setup-pipeline-skybot-discovery)
    - [Load DES release data](#load-des-release-data)
  - [Start and Stop Services](#start-and-stop-services)
  - [Test in brownser](#test-in-brownser)
  - [Public Page user documentation](#public_page_documentation)
  - [Useful commands](#useful-commands)
    - [Open bash in backend container](#open-bash-in-backend-container)
    - [Run Django Manage.py](#run-django-managepy)
    - [Acesso ao banco de dados do LINEA usando SSH Tunel](#acesso-ao-banco-de-dados-do-linea-usando-ssh-tunel)
    - [Build manual das imagens e push para docker hub](#build-manual-das-imagens-e-push-para-docker-hub)
    - [Run CI Github Actions Locally](#run-ci-github_actions-localy)

<!-- TOC end -->

## Dependencias

- Docker version 25.0.1
- git version 2.39.3
- Vscode com devcontainer
- Acesso ao banco de dados desdb4 - **prod_gavo**

---

Este passos foram escritos considerando :

- Maquina local do desenvolvedor
- Usuario 1000 Grupo 1000
- Instalação feita no path: `/home/<user>/linea/tno`

---

<!-- TOC --><a name="setup-development-environment"></a>

## Setup Development Environment

Clone this repository

```bash
git clone https://github.com/linea-it/tno.git tno
```

Create directorys

```bash
cd tno && mkdir -p logs data database_subset
```

Inside project folder tno:

Copy docker-compose.yml local_settings.py and .env

```bash
cp compose/local/docker-compose-template.yml docker-compose.yml \
&& cp compose/local/env-template .env \
&& cp compose/local/local_settings-template.py local_settings.py \
&& cp compose/local/nginx-proxy-template.conf nginx-proxy.conf
```

edit local variables if necessary.

> Este repositório tem devcontainer configurado, mas é necessário executar todas as etapas deste readme antes de tentar usar o devcontainer.

## Configuração das Variaveis de ambiente

Os arquivos de configuração .env e local_settings já estão preenchidos com valores compativeis com o ambiente local. Mas é necessário alterar/preencher as variaveis relacionadas a segurança e acessos.

```bash
vim .env
```

No momento deste documento as variaveis a serem editadas são:

- DJANGO_SECRET_KEY
- RABBITMQ_DEFAULT_PASS
- DB_ADMIN_URI
- DB_CATALOG_URI

Alterar o arquivo de configuração do Django de acordo com a necessidade.

```bash
vim local_settings.py
```

> Editar o arquivo docker-compose.yml e conferir os pontos de montagem.

> Para preencher a variavel de ambiente .env/DJANGO_SECRET_KEY é necessário executar um comando dentro do container de backend para gerar uma chave aleatória.

```bash
docker compose run -it --rm backend python -c "import secrets; print(secrets.token_urlsafe())"
```

> Para que os container backend e predict_occultations tenham acesso aos DBs ele está configurado com a rede do tipo "host". utilize nos hostname os valores `localhost` ou caso nao funcione use `host.docker.internal`

> Para acessar o banco admistrativo, certifique-se que o serviço database está com a porta exposta para o Host.

Neste exemplo a variavel DB_ADMIN_URI recebe o seguinte valor:

```bash
DB_ADMIN_URI=postgresql+psycopg2://postgres:postgres@localhost:5432/postgres
```

Já o acesso ao banco de catalogos é mais complicado.
É necessário criar um tunel ssh com o banco de dados do LIneA.

```bash
ssh -f <linea_user>@login.linea.org.br -L <local_port>:desdb4.linea.org.br:5432 -N
```

Neste comando substitua `<linea_user>` pelo seu usuario de acesso a srvlogin e `<local_port>` por uma porta disponivel na sua maquina por ex: `3307`.

É necessário sempre executar esse comando antes de ligar o ambiente.

Exemplo da varival DB_CATALOG_URI no meu ambiente utilizando a porta 3307 no localhost que foi criada com o ssh tunel.

```bash
DB_CATALOG_URI=postgresql://untrustedprod:untrusted@host.docker.internal:3307/prod_gavo
```

<!-- TOC --><a name="setup-backend"></a>

## Setup Backend

Na primeira vez é necessário ligar o database primeiro para que seja criado o db.

Run Database container

```bash
docker compose up database
```

Espere pela mensagem "database system is ready to accept connections" apos a mensagem, desligue o container pressionando `ctrl + c` e inicie o serviço novamente com parametro `-d`

```bash
docker compose up -d database
```

Build backend container

```bash
docker compose build backend
```
Na primeira vez é necessário ligar o backend para que seja aplicado as migrações e criação das tabelas.

Run Backend container

```bash
docker compose up backend
```

Espere pela mensagem `*** uWSGI is running in multiple interpreter mode ***` apos a mensagem, desligue o container pressionando `ctrl + c` e inicie o serviço novamente com parametro `-d`

```bash
docker compose up -d backend
```

Crie um usuario administrativo para o Django.

```bash
docker compose run -it --rm backend python manage.py createsuperuser
```

Crie os indexes Q3C para as tabelas que utilizam index espacial.

```bash
docker compose run -it --rm backend python manage.py create_q3c_index
```

Load Initial Data (LeapSecond, BspPlanetary, Stelar Catalog)

```bash
docker compose run -it --rm backend python manage.py loaddata initial_data.yaml
```

Load Initial Asteroids Data

```bash
docker compose run -it --rm backend python manage.py update_asteroid_table
```

> A criação da tabela de asteorids demora alguns minutos.

> A criação da tabela de asteroid depende de 2 arquivos baixados de serviços externos, eventualmente esses arquivos podem estar indisponiveis. caso o comando falhe utilize o workaround abaixo.

---

**Workaround:**

Para corrigir isso baixe os arquivos de sample do ambiente de produção ou testing e execute o comando com a opcao --local.

```bash
curl https://tno-dev.linea.org.br/data/database_subset/ssoBFT-latest.ecsv.bz2 -o data/asteroid_table/ssoBFT-latest.ecsv.bz2 \
&& curl https://tno-dev.linea.org.br/data/database_subset/mpcorb_extended.json.gz -o data/asteroid_table/mpcorb_extended.json.gz \
&& docker compose run -it --rm backend python manage.py update_asteroid_table --local
```

---

Run Backend

```bash
docker compose up -d backend
```

<!-- TOC --><a name="setup-frontend"></a>

## Setup Frontend

Frontend uses a Node image. before up this container run yarn for install dependencies.

```bash
docker compose run frontend yarn
```

```bash
docker compose build mkdocs
```

<!-- TOC --><a name="setup-pipeline-predict-occultation"></a>

## Setup Pipeline Predict Occultation

```bash
docker compose build predict_occultation
```

<!-- TOC --><a name="setup-pipeline-skybot-discovery"></a>

## Setup Pipeline Skybot Discovery

**Importante!** Esta etapa não é necessária para a execução do pipeline de predição. somente para Skybot Discovery e Orbit Trace. Se não for utilizar estes pipelines em dev, pode pular esta seção.

O pipeline Skybot Discovery é responsavel por identificar os asteroids que tiveram observacao no DES. para isso é necessário ter a tabela com todas as exposições e ccds do DES estas tabels são bem grandes. um dump delas está disponivel para download no ambiente do linea.

<!-- TOC --><a name="load-des-release-data"></a>

### Load DES release data

Load table exposure and ccds from fixtures files.

Download files and extract then

```bash
wget -P database_subset https://tno-dev.linea.org.br/data/database_subset/exposures.csv.zip && wget -P database_subset https://tno-dev.linea.org.br/data/database_subset/ccds.csv.zip
```

Unzip files

```bash
unzip database_subset/exposures.csv.zip -d database_subset && unzip database_subset/ccds.csv.zip -d database_subset
```

Importar os csv para o banco de dados
Com o Container Database rodando, verificar se o diretorio com os csv está montado como volume no container.
Recomendo desligar o container do backend e deixar só o database rodando.
executar os comando do psql para importar as tabelas. nos exemplos o diretorio com os CSVs esta montado em /data.

**IMPORTANTE!** A tabela de CCDs é muito grande e demora bastante para ser importada (~40min).

Importing DES Exposures

```bash
docker-compose exec database psql -U postgres -d postgres -c "\\copy des_exposure from '/data/exposures.csv' DELIMITER '|' CSV HEADER"
```

Importing DES CCDs

```bash
docker-compose exec database psql -U postgres -d postgres -c "\\copy des_ccd from '/data/ccds.csv' DELIMITER '|' CSV HEADER"
```

Remove Dump files

```bash
rm database_subset/exposures.* database_subset/ccds.*
```

<!-- TOC --><a name="start-and-stop-services"></a>

## Start and Stop Services

Run all services in background

```bash
docker-compose up -d
```

Stop all services

```bash
docker-compose stop
```

<!-- TOC --><a name="test-in-brownser"></a>

## Test in brownser

Home: <http://localhost/>

Dashboard: <http://localhost/dashboard/>

Django Admin: <http://localhost/admin/>

Django Rest: <http://localhost/api/>

Celery Flower: <http://localhost/flower/>

Rabbitmq: <http://localhost/rabbitmq/>

<!-- TOC --><a name="public_page_documentation"></a>

## Public Page user documentation

A documentação de usuario utiliza um mkdocs localizado no diretório `frontend/user_docs`.
Para editar a documentação basta adicionar ou alterar os arquivos .md dentro do diretório raiz do mkdocs `frontend/user_docs/docs`.

Para visualizar as mudanças basta acessar localhost:8000 para ter acesso ao serviço do mkdocs com live-reload.

> No momento o acesso pela url localhost/docs/ está com bug no live-reload o que causa um loop infinito podendo travar o navegador. por enquanto só acessar a documentação pela porta 8000.

O build do mkdocs está junto com o build do frontend/Dockerfile. é feito o build e copiado a pasta para o ngnix.

<!-- TOC --><a name="useful-commands"></a>

## Useful commands

<!-- TOC --><a name="open-bash-in-backend-container"></a>

### Open bash in backend container

with backend service running

```bash
docker-compose exec backend bash
```

<!-- TOC --><a name="run-django-managepy"></a>

### Run Django Manage.py

with all services running open a new terminal and run this command.

```bash
docker-compose exec backend python manage.py --help
```

<!-- TOC --><a name="acesso-ao-banco-de-dados-do-linea-usando-ssh-tunel"></a>

### Acesso ao banco de dados do LINEA usando SSH Tunel

```bash
ssh -f <linea_user>@login.linea.org.br -L <local_port>:desdb4.linea.org.br:5432 -N
```

<!-- TOC --><a name="build-manual-das-imagens-e-push-para-docker-hub"></a>

### Build manual das imagens e push para docker hub

Docker Hub: <https://hub.docker.com/repository/docker/linea/tno/>

No docker hub é apenas um repositório `linea/tno` e as imagens estão divididas em duas tags uma para o backend (**:backend\_[version]**) e outra para frontend (**:frontend\_[version]**).

A identificação unica de cada tag pode ser o numero de versão exemplo: `linea/tno:backend_v0.1` ou o hash do commit para versões de desenvolvimento: `linea/tno:backend_8816330` para obter o hash do commit usar o comando `$(git describe --always)`.

**Importante:** Sempre fazer o build das duas imagens utilizando a mesma versão ou mesmo hash de commit, mesmo que uma das imagens não tenha sido alterada.

```bash
# Backend
cd tno/backend
docker build -t linea/tno:backend_$(git describe --always) .
docker push linea/tno:backend_$(git describe --always)

# Frontend
cd tno/frontend
docker build -t linea/tno:frontend_$(git describe --always) .
docker push linea/tno:frontend_$(git describe --always)

# Pipelines
cd tno/predict_occultation
docker build -t linea/tno:predict_occ_$(git describe --always) .
docker push linea/tno:predict_occ_$(git describe --always)
```

<!-- TOC --><a name="run-ci-github_actions-localy"></a>

### Run CI Github Actions Locally

O devcontainer do repositório já está configurado com as dependencias (github cli, act, docker) necessárias para executar os github actions localmente.
é necessário criar um arquivo .secrets com as variaveis de acesso ao Dockerhub e o token de login do github.

Primeiro faça a autenticação no github cli usando o comando

```bash
gh auth login
```

Após realizar o login com sucesso, execute o comando

```bash
gh auth token
```

Copie o Token gerado.

Crie um arquivo .secrets com as seguintes variaveis:

```bash
GITHUB_TOKEN=<Token gerado pelo gh auth token>
DOCKERHUB_USERNAME=<Usuario do dokerhub>
DOCKERHUB_TOKEN=<Senha do dockerhub>
```

Utilize os seguintes comandos para testar os pipelines:

```bash
# Command structure:
act [<event>] [options]

# List all actions for all events:
act -l

# Executa o job build_backend simulando um pull_request
act pull_request --secret-file .secrets  -j build_backend

# Executa o job build_backend simulando um push
act pull --secret-file .secrets  -j build_backend

# Executa o job pre-commit como se estivesse rodando no github.
act pull -j pre-commit
```
