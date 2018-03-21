# tno
Transneptunian Occultation Network Portal


# Development start
Clone this repository
```
git clone https://github.com/linea-it/tno.git tno
```
Run Clone repositories script, this script clone all repositories associated to TNO. 
```
./clone_repositories.sh
```

Copy env_template to .env setup variables and run
```
cp env_template .env
```

```
docker-compose  -f docker-compose.development.yml up
```

### Test in brownser
```
http://localhost:7000/
```
Dashboard: 7000  
Get Pointings: 7001  
Solar System: 7002  
Filter Objects: 7003  
