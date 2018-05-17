


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

```
docker-compose up
```

OBS: Se der erro de authenticação entrar no container do database e mudar a senha do usuario postgres. 
```
docker exec -it tnotest_database_1 psql -h localhost -U postgres
```
```
ALTER USER postgres WITH PASSWORD 'postgres';
```

### Create a superuser in Django