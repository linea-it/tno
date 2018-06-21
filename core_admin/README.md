# tno_core_admin

### Build Docker
```
docker build . -t tno-core-admin:latest
```

Create a .env file with DATABASE_URI to access PostgresSql database.

```
cp env_template .env

```

Edit .env file with correct access to PostgresSql database

### Run Docker
Rodar o Container fora do docker-compose, é necessário ter o .env com os dados de conexão com o banco de dados. 
o parametro --network só é necessário quando usado em conjunto com o container do banco de dados, para saber o nome da rede usar o comando docker "network ls".
```
docker run -it --rm --name tno-core-admin --publish 7001:7001 --volume $PWD/:/app --env-file $PWD/../.env --network tno_backend tno-core-admin
```

### Create Superuser 
if in a develop and using develoment database run createsuperuser to create a admin user in Django.
with the docker running open a new terminal and run this command.
```
docker exec -it tno-core-admin python manage.py createsuperuser
```


### Test in brownser
```
http://localhost:7001/
```


## For develops only

### Create new Django app
with the docker running open a new terminal and run this command.
```
docker exec -it tno-core-admin python manage.py startapp <new_app>
```
Once created, being outside the container, change the permission to the directory of the new app.
```
sudo chown -R <your_local_user>:<your_local_user> <new_app>/
```


Export Table to csv:
```
\copy (SELECT pfw_attempt_id, desfile_id, to_date(nite, 'YYYYMMDD'), to_timestamp(date_obs,'YYYY-MM-DD"X"HH24:MI:SS.US'), expnum, ccdnum, band, exptime, cloud_apass, cloud_nomad, t_eff, crossra0, radeg, decdeg, racmin, racmax, deccmin, deccmax, ra_cent, dec_cent, rac1, rac2, rac3, rac4, decc1, decc2, decc3, decc4, ra_size, dec_size, path, filename, compression, FALSE FROM tno.pointings ORDER BY date_obs DESC ) TO '/home/glauber.costa/tbl_pointings.csv' WITH (FORMAT csv, DELIMITER ';')
```

Import Table csv Postgresql
```
 \copy tno.tno_pointing (pfw_attempt_id, desfile_id, nite, date_obs, expnum, ccdnum, band, exptime, cloud_apass, cloud_nomad, t_eff, crossra0, radeg, decdeg, racmin, racmax, deccmin, deccmax, ra_cent, dec_cent, rac1, rac2, rac3, rac4, decc1, decc2, decc3, decc4, ra_size, dec_size, path, filename, compression, downloaded) FROM '/home/glauber.costa/tbl_pointings.csv' WITH (FORMAT csv, DELIMITER ';')
```