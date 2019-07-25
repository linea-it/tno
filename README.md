# tno
Transneptunian Occultation Network Portal


# Development start
Clone this repository
```
git clone https://github.com/linea-it/tno.git tno
```

Copy env_template to .env setup variables and run
```
cd tno
cp env_template .env
```

Copy ngnix config
```
cd nginx
cp dashboard/nginx/development.conf ./nginx-proxy.conf
```

Copy docker-compose.yml
```
cd ..
cp docker-compose-development-template.yml docker-compose.yml
```

Build Containers
```
docker-compose build
```

Edit .env uncomment DOCKER_HOST variable.

Run Backend
```
docker-compose up
```

In another terminal configure Docker host port following this https://github.com/linea-it/tno/blob/master/docs/Configure_Docker_Host.md

get docker host ip and put in DOCKER_HOST variable in .env 

```
$ docker ps
CONTAINER ID        IMAGE                         COMMAND                  CREATED             STATUS              PORTS                          NAMES
30cdc94b0803        tno_frontend                  "nginx -g 'daemon of…"   30 seconds ago      Up 24 seconds       80/tcp, 0.0.0.0:80->8080/tcp   tno_frontend_1
d5bded38b62d        tno-backend                   "/bin/sh -c $APP_PAT…"   33 seconds ago      Up 30 seconds       0.0.0.0:7001->7001/tcp         tno_backend_1
6df8fc22db1d        linea/postgresql_q3c:latest   "docker-entrypoint.s…"   38 seconds ago      Up 34 seconds       5432/tcp                       tno_database_1

$ docker inspect -f '{{range .NetworkSettings.Networks}}{{.Gateway}}{{end}}' tno_backend_1
172.18.0.1

```

.env
```
...
# Docker Client
# Ip e porta do configurado para o client docker do host. 
# e possivel obter o ip utilizando o comando
# docker inspect <container_id>
# O IP do Host aparece no atributo "Network"->"Gateway": "172.19.0.1",
# A porta tem que ser a definida no arquivo: /etc/systemd/system/docker.service.d/startup_options.conf
DOCKER_HOST=tcp://172.18.0.1:2376

```
restart containers
```
docker-compose stop 
docker-compose up
```

Run Frontend
```
cd dashboard
yarn 
yarn run start
```

### Test in brownser
```
http://localhost:7000/
```



### More details about the installation are available at this link.

https://github.com/linea-it/tno/blob/master/docs/install_production.md
