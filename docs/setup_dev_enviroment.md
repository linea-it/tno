<!-- TOC start (generated with https://github.com/derlin/bitdowntoc) -->

- [Setup Development Environment](#setup-development-environment)
   * [Setup Backend](#setup-backend)
   * [Setup Frontend](#setup-frontend)
   * [Setup Pipeline Predict Occultation](#setup-pipeline-predict-occultation)
   * [Setup Pipeline Skybot Discovery ](#setup-pipeline-skybot-discovery)
      + [Load DES release data](#load-des-release-data)
   * [Start and Stop Services](#start-and-stop-services)
   * [Test in brownser](#test-in-brownser)
   * [Useful commands](#useful-commands)
      + [Open bash in backend container](#open-bash-in-backend-container)
      + [Run Django Manage.py](#run-django-managepy)
      + [Acesso ao banco de dados do LINEA usando SSH Tunel](#acesso-ao-banco-de-dados-do-linea-usando-ssh-tunel)
      + [Build manual das imagens e push para docker hub](#build-manual-das-imagens-e-push-para-docker-hub)
      + [Run CI Github Actions Locally](#run-ci-github_actions-localy)
      + [Export Tables to csv](#export-tables-to-csv)
      + [Import Table csv Postgresql](#import-table-csv-postgresql)

<!-- TOC end -->

<!-- TOC --><a name="setup-development-environment"></a>
# Setup Development Environment

Clone this repository

```bash
git clone https://github.com/linea-it/tno.git tno
```

Create directorys

```bash
mkdir tno/database_subset tno/archive tno/log && cd tno
```

<!-- TOC --><a name="setup-backend"></a>
## Setup Backend

Inside project folder tno:

Copy docker-compose.yml

```bash
cp docker-compose-development-template.yml docker-compose.yml
```

Copy local_settings.py edit local variables if necessary.

```bash
cp local_settings_template.py local_settings.py
```

Run Database container (Na primeira vez é necessário ligar o database primeiro para que seja criado o db)

```bash
docker-compose up -d database
```

Build backend container

```bash
docker-compose build backend
```

Run Backend

```bash
docker-compose up backend
```

Create a superuser in Django
run createsuperuser to create a admin user in Django.
with the docker running open a new terminal and run this command.

```bash
docker-compose exec backend python manage.py createsuperuser
```

Table preparation for Q3C
run create_q3c_index for create indexes.

```bash
docker-compose exec backend python manage.py create_q3c_index
```

Load Initial Data (LeapSecond, BspPlanetary, Stelar Catalog)

```bash
docker-compose exec backend python manage.py loaddata initial_data.yaml
```

Load Initial Asteroids Data

```bash
docker-compose exec backend python manage.py update_asteroid_table
```


<!-- TOC --><a name="setup-frontend"></a>
## Setup Frontend

Frontend uses a Node image. before up this container run yarn for install dependencies.

```bash
docker-compose run frontend yarn
```

<!-- TOC --><a name="setup-pipeline-predict-occultation"></a>
## Setup Pipeline Predict Occultation

O pipeline de predição precisa de acesso a dois banco de dados diferentes, utilize as variaveis:

`DB_URI_ADMIN` para permitir o acesso ao banco de dados administrativo do portal. 

`DB_URI` para permitir o acesso ao banco de dados de catalog, necessário ter acesso a tabela gaia.dr2. 

No docker-compose.yml identifique o serviço "pipelines"
e altere as variaveis de ambiente:

Para que o container pipelines tenha acesso aos DBs ele está configurado com a rede do tipo "host". utilize nos hostname os valores `localhost` ou caso nao funcione use `host.docker.internal` 

Para acessar o banco admistrativo, certifique-se que o serviço database está com a porta exposta para o Host. 
```yml
  database:
    image: linea/postgresql_q3c:latest
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=postgres
    ports:
      - 5432:5432
```

Neste exemplo a variavel DB_URI_ADMIN recebe o seguinte valor: 

```bash
DB_URI_ADMIN=postgresql+psycopg2://postgres:postgres@localhost:5432/postgres
```

Já o acesso ao banco de catalogos é mais complicado. 
É necessário criar um tunel ssh com o banco de dados do LIneA. 
```bash
ssh -f <linea_user>@login.linea.org.br -L <local_port>:desdb4.linea.org.br:5432 -N
```
Neste comando substitua `<linea_user>` pelo seu usuario de acesso a srvlogin e `<local_port>` por uma porta disponivel na sua maquina por ex: `3307`. 

É necessário sempre executar esse comando antes de ligar o ambiente.

Exemplo da varival DB_URI no meu ambiente utilizando a porta 3307 no localhost que foi criada com o ssh tunel.

```bash
DB_URI=postgresql+psycopg2://untrustedprod:untrusted@host.docker.internal:3307/prod_gavo
```

A configuração do serviço pipeline deve ficar como algo do tipo:

```yml
  pipelines:
    ...
    network_mode: "host"
    ...
    environment:
      # Usando host.docker.internal
      - DB_URI=postgresql+psycopg2://untrustedprod:untrusted@host.docker.internal:3307/prod_gavo
      - DB_URI_ADMIN=postgresql+psycopg2://postgres:postgres@host.docker.internal:5432/postgres
      ...
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

No docker hub é apenas um repositório `linea/tno` e as imagens estão divididas em duas tags uma para o backend (**:backend_[version]**) e outra para frontend (**:frontend_[version]**). 

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
cd tno/pipelines
docker build -t linea/tno:pipelines_$(git describe --always) .
docker push linea/tno:pipelines_$(git describe --always)
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
```

<!-- TOC --><a name="export-tables-to-csv"></a>
### Export Tables to csv

```bash
\copy (SELECT pfw_attempt_id, desfile_id, to_date(nite, 'YYYYMMDD'), to_timestamp(date_obs,'YYYY-MM-DD"X"HH24:MI:SS.US'), expnum, ccdnum, band, exptime, cloud_apass, cloud_nomad, t_eff, crossra0, radeg, decdeg, racmin, racmax, deccmin, deccmax, ra_cent, dec_cent, rac1, rac2, rac3, rac4, decc1, decc2, decc3, decc4, ra_size, dec_size, path, filename, compression, FALSE FROM tno.pointings ORDER BY date_obs DESC ) TO '/home/glauber.costa/tbl_pointings.csv' WITH (FORMAT csv, DELIMITER ';')
```

<!-- TOC --><a name="import-table-csv-postgresql"></a>
### Import Table csv Postgresql

```bash
 \copy tno.tno_pointing (pfw_attempt_id, desfile_id, nite, date_obs, expnum, ccdnum, band, exptime, cloud_apass, cloud_nomad, t_eff, crossra0, radeg, decdeg, racmin, racmax, deccmin, deccmax, ra_cent, dec_cent, rac1, rac2, rac3, rac4, decc1, decc2, decc3, decc4, ra_size, dec_size, path, filename, compression, downloaded) FROM '/home/glauber.costa/tbl_pointings.csv' WITH (FORMAT csv, DELIMITER ';')
```
