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
docker run -it --rm --name tno-core-admin --publish 7001:3000 --volume $PWD/:/app --env-file $PWD/.env tno-core-admin
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
