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
```
docker run -it --rm --name tno-core-admin --publish 7001:7001 --volume $PWD/:/app --env-file $PWD/.env tno-core-admin
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


Copy Table to csv:
```
\copy (SELECT id, pfw_attempt_id, desfile_id, to_date(nite, 'YYYYMMDD'), date_obs, expnum, ccdnum, band, exptime, cloud_apass, cloud_nomad, t_eff, crossra0, radeg, decdeg, racmin, racmax, deccmin, deccmax, ra_cent, dec_cent, rac1, rac2, rac3, rac4, decc1, decc2, decc3, decc4, ra_size, dec_size, path, filename, compression, False FROM tno.pointings order by date_obs ASC limit 1000) TO /tmp/test.csv With CSV DELIMITER ';'
COPY 1000
```