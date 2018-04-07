# tno_filter_objects

### Build Docker
```
sudo docker build -t tno-filter-objects .
```

Create a .env file with DATABASE_URI to access PostgresSql database.

```
cp env_template .env

```

Edit .env file with correct access to PostgresSql database


### Run Docker
```
docker run -it --rm --name tno-filter-objects --publish 7003:7003 --volume $PWD/:/app --env-file $PWD/.env tno-filter-objects
```


### Test in brownser
```
http://localhost:7003/
```


# Links uteis
Skybot example query: http://vo.imcce.fr/webservices/skybot/?conesearch
Exemplo Filter Objects: https://app-des.shinyapps.io/APP_DES_FREQ/
