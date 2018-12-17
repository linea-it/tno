


### Clone Repository
```
git clone https://github.com/linea-it/tno.git tno
```

```
cd tno/
```

### dabase data
Unzip the csv files with data to the database.
you have to do it before doing the build and up of the container, because the directory will be mounted in the postgres image.
```
cd database_subset
unzip tno_database.subset.zip
cd ..
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
docker exec -it $(docker ps -q -f name=database) psql -h localhost -U postgres
```
```
ALTER USER postgres WITH PASSWORD 'postgres';
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

## Configure ngnix