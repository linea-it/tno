


Download 

Create Folders (Ignore this step if want use other locations)

mkdir tno/database_subset tno/archive tno/log && cd tno

```bash
wget -O docker-compose.yml https://raw.githubusercontent.com/linea-it/tno/main/docker-compose-development-template.yml \
&& wget -O local_settings.py https://raw.githubusercontent.com/linea-it/tno/main/local_settings_template.py \
&& wget -O nginx-proxy.conf https://raw.githubusercontent.com/linea-it/tno/main/nginx-proxy-development.conf
```
<!-- TODO Adicionar o arquivo de configuração do Jupyter Notebook -->

Edit local_settings.py


Ligar o database e esperar até que a mensagem "database system is ready to accept connections" apareça. depois pode desligar e ligar o backend.

```bash
docker-compose up database
```

```bash
tno-dev-database-1  | PostgreSQL init process complete; ready for start up.
tno-dev-database-1  | LOG:  database system was shut down at 2023-01-31 21:17:20 UTC
tno-dev-database-1  | LOG:  MultiXact member wraparound protections are now enabled
tno-dev-database-1  | LOG:  autovacuum launcher started
tno-dev-database-1  | LOG:  database system is ready to accept connections

```

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



```
docker-compose up database
```

OBS: Se der erro de authenticação entrar no container do database e mudar a senha do usuario postgres. neste exemplo a senha é 'postgres'.
```
docker exec -it $(docker ps -q -f name=database) psql -h localhost -U postgres -c "ALTER USER postgres WITH PASSWORD 'postgres';"
```


### Create a superuser in Django
Stop database container and up core-admin

```
docker-compose up backend
```

run createsuperuser to create a admin user in Django.
with the docker running open a new terminal and run this command.
```
 docker exec -it $(docker ps -q -f name=backend) python manage.py createsuperuser
```

### Table preparation for Q3C 
run create_q3c_index for create indexes.
```
docker exec -it $(docker ps -q -f name=backend) python manage.py create_q3c_index
```

### Importar os csv para o banco de dados
Com o Container Database rodando, verificar se o diretorio com os csv está montado como volume no container. 
executar os comando do psql para importar as tabelas. nos exemplos o diretorio com os CSVs esta montado em /data.

#### Pointings
```
docker exec -it $(docker ps -q -f name=database) psql -h localhost -U postgres -c "\\copy tno_pointing from '/data/tno_pointings.csv' DELIMITER ';' CSV HEADER"
```

#### CCD Images
```
docker exec -it $(docker ps -q -f name=database) psql -h localhost -U postgres -c "\\copy tno_ccdimage from '/data/tno_ccdimage.csv' DELIMITER ';' CSV HEADER"
```

#### Skybot Output
```
docker exec -it $(docker ps -q -f name=database) psql -h localhost -U postgres -c "\\copy tno_skybotoutput from '/data/tno_skybotoutput.csv' DELIMITER ';' CSV HEADER"
```

### Run 
Stop all containers and run in background mode
```
docker-compose up -d
```

