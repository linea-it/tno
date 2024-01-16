# Setup Development Environment

Clone this repository

```bash
git clone https://github.com/linea-it/tno.git tno
```

Create directorys

```bash
mkdir tno/database_subset tno/archive tno/log && cd tno
```

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
docker-compose exec backend django-admin loaddata asteroid.json.gz
```


### Acesso ao banco de dados do LINEA usando SSH Tunel
TODO: Documentar como configurar o banco de catalogo para ler os dados do GAIA.
Executar o comando antes de ligar os container para criar um tunel para o banco de dados de catalogo. 
Editar e configurar os dados de acesso para a porta local.
```bash
ssh -f <linea_user>@login.linea.org.br -L <local_port>:desdb4.linea.org.br:5432 -N
```

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

IMPORTANTE: A tabelas de CCDs é muito grande e demora bastante para ser importada (~40min).

Importing DES Exposures

```bash
docker-compose exec database psql -U postgres -d postgres -c "\\copy des_exposure from '/data/exposures.csv' DELIMITER '|' CSV HEADER"
```

Importing DES CCDs

```bash
docker-compose exec database psql -U postgres -d postgres -c "\\copy des_ccd from '/data/ccds.csv' DELIMITER '|' CSV HEADER"
```

## Setup Frontend

Frontend uses a Node image. before up this container run yarn for install dependencies.

```bash
docker-compose run frontend yarn
```

## Run

Stop all containers and run in background mode

```bash
docker-compose up -d
```

## Test in brownser

Home: <http://localhost>

Django Admin: <http://localhost/admin>

Django Rest: <http://localhost/api>

## Tips For develops only

### Run Django Manage.py

with the containers running open a new terminal and run this command.

```bash
docker-compose exec backend python manage.py --help
```

### Build manual das imagens e push para docker hub

Docker Hub: <https://hub.docker.com/repository/docker/linea/tno/>

No docker hub é apenas um repositório `linea/tno` e as imagens estão divididas em duas tags uma para o backend (**:backend_[version]**) e outra para frontend (**:frontend_[version]**). 

A identificação unica de cada tag pode ser o numero de versão exemplo: `linea/tno:backend_v0.1` ou a hash do commit para versões de desenvolvimento: `linea/tno:backend_8816330` para obter o hash do commit usar o comando `$(git describe --always)`.

**Importante:** Sempre fazer o build das duas imagens utilizando a mesma versão ou mesmo hash de commit, mesmo que uma das imagens não tenha sido alterada.

```bash
# Backend
cd tno/backend
docker build -t linea/tno:backend_$(git describe --always) .
# Para o push copie o nome da imagem que aparece no final do build e faça o docker push 
docker push linea/tno:backend_<commit_hash>

# Frontend
cd tno/frontend
docker build -t linea/tno:frontend_$(git describe --always) .
# Para o push copie o nome da imagem que aparece no final do build e faça o docker push 
docker push linea/tno:frontend_<commit_hash>
```

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

### Export Tables to csv

```bash
\copy (SELECT pfw_attempt_id, desfile_id, to_date(nite, 'YYYYMMDD'), to_timestamp(date_obs,'YYYY-MM-DD"X"HH24:MI:SS.US'), expnum, ccdnum, band, exptime, cloud_apass, cloud_nomad, t_eff, crossra0, radeg, decdeg, racmin, racmax, deccmin, deccmax, ra_cent, dec_cent, rac1, rac2, rac3, rac4, decc1, decc2, decc3, decc4, ra_size, dec_size, path, filename, compression, FALSE FROM tno.pointings ORDER BY date_obs DESC ) TO '/home/glauber.costa/tbl_pointings.csv' WITH (FORMAT csv, DELIMITER ';')
```

### Import Table csv Postgresql

```bash
 \copy tno.tno_pointing (pfw_attempt_id, desfile_id, nite, date_obs, expnum, ccdnum, band, exptime, cloud_apass, cloud_nomad, t_eff, crossra0, radeg, decdeg, racmin, racmax, deccmin, deccmax, ra_cent, dec_cent, rac1, rac2, rac3, rac4, decc1, decc2, decc3, decc4, ra_size, dec_size, path, filename, compression, downloaded) FROM '/home/glauber.costa/tbl_pointings.csv' WITH (FORMAT csv, DELIMITER ';')
```
