


### Clone Repository
```
git clone https://github.com/linea-it/tno.git tno_testing
```

```
cd tno_testing/
```

### dabase data
Unzip the csv files with data to the database.
you have to do it before doing the build and up of the container, because the directory will be mounted in the postgres image.
```
unzip database_subset/tno_database.subset.zip
```

### Create a .env based in env_template
```
cp env_template .env

```

### Build and Run Containers 
```
docker-compose build
```

### Prepare Database

```
docker-compose up database
```

OBS: Se der erro de authenticação entrar no container do database e mudar a senha do usuario postgres. 
```
docker exec -it tnotest_database_1 psql -h localhost -U postgres
```
```
ALTER USER postgres WITH PASSWORD 'postgres';
```

### Create a superuser in Django
Stop database container and up core-admin

```
docker-compose up core-admin
```

run createsuperuser to create a admin user in Django.
with the docker running open a new terminal and run this command.
```
 docker exec -it tnotest_core-admin_1 python manage.py createsuperuser
```

### Importar os csv para o banco de dados
Com o Container Database rodando, verificar se o diretorio com os csv está montado como volume no container. 
executar os comando do psql para importar as tabelas. nos exemplos o diretorio com os CSVs esta montado em /data.

Usar o comando docker ps para saber o nome do container que esta rodando neste exemplo 'tno_database_1'
``` 
docker ps 
``` 

#### Pointings
```
docker exec -it tno_database_1 psql -h localhost -U postgres -c "\\copy tno_pointing from '/data/tno_pointings.csv' DELIMITER ';' CSV HEADER"
```

#### CCD Images
```
docker exec -it tno_database_1 psql -h localhost -U postgres -c "\\copy tno_ccdimage from '/data/tno_ccdimage.csv' DELIMITER ';' CSV HEADER"
```

#### Skybot Output
```
docker exec -it tno_database_1 psql -h localhost -U postgres -c "\\copy tno_skybotoutput from '/data/tno_skybotoutput.csv' DELIMITER ';' CSV HEADER"
```

### Run 
Stop all containers and run in background mode
```
docker-compose up -d
```

## Configure ngnix