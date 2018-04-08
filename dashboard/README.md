
# TNO Dashboard

### Build Docker
```
docker build . -t tno-dashboard:latest
```

### Run Docker
```
docker run -it --rm --name tno-dashboard --publish 7000:3000 --volume $PWD/:/app --env-file $PWD/.env tno-dashboard

```

