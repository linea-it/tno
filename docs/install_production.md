


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

### Configure ngnix
Create link to ngnix config
```
cd nginx
ln -s development_template.conf nginx-proxy.conf
cd ..
```

### Build and Run Containers 

Create link to docker-compose.yml
```
ln -s docker-compose-production-template.yml docker-compose.yml
```

```
docker-compose build
```

### Prepare Database

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

