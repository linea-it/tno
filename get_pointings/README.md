# tno_get_pointings


### Build Docker
```
sudo docker build -t tno-getpointings .
```

### Run Docker
```
docker run -it --rm --name tno-getpointings --publish 8000:8000 --volume $PWD/:/app tno-getpointings
```


### Test in brownser
```
http://localhost:8000/
```
