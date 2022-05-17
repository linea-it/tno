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
### database setup
Apos criar o database rodar o comando pra criar a extensão q3c.
```
CREATE EXTENSION q3c
```

### dabase data
Unzip the csv files with data to the database.
you have to do it before doing the build and up of the container, because the directory will be mounted in the postgres image.
```
cd database_subset
unzip tno_database.subset.zip
cd ..
```
Caso crie uma tabela para gaia, rodar os comandos para criar os indexes q3c
```
CREATE INDEX ON gaia.dr2 (q3c_ang2ipix(ra, dec));

CLUSTER dr2_q3c_ang2ipix_idx ON gaia.dr2;

ANALYZE gaia.dr2;
```


### Create a superuser in Django
run createsuperuser to create a admin user in Django.
with the docker running open a new terminal and run this command.
```
docker-compose exec backend python manage.py createsuperuser
```

### Table preparation for Q3C 
run create_q3c_index for create indexes.
```
docker-compose exec backend python manage.py create_q3c_index
```

### Importar os csv para o banco de dados
Com o Container Database rodando, verificar se o diretorio com os csv está montado como volume no container. 
executar os comando do psql para importar as tabelas. nos exemplos o diretorio com os CSVs esta montado em /data.

#### DES Exposures
```
docker-compose exec database psql -U postgres -d postgres -c "\\copy des_exposure from '/data/exposures.csv' DELIMITER '|' CSV HEADER"

#Old Command: docker exec -it $(docker ps -q -f name=database) psql -h localhost -U postgres -c "\\copy tno_pointing from '/data/tno_pointings.csv' DELIMITER ';' CSV HEADER"
```

#### DES CCDs
```
docker-compose exec database psql -U postgres -d postgres -c "\\copy des_ccd from '/data/ccds.csv' DELIMITER '|' CSV HEADER"

 #Old Command: docker exec -it $(docker ps -q -f name=database) psql -h localhost -U postgres -c "\\copy tno_ccdimage from '/data/tno_ccdimage.csv' DELIMITER ';' CSV HEADER"
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

### For Running Science pipelines some registers are necessary
Access admin interface in http://localhost/admin


- Home › Praia › Configurations › Add configuration  - Create a default configuration for Astrometry Pipeline. (**Temporary**)
  ```
  user: Current user
  name: Default
  ```

- Home › Predict › Leap seconds › Add leap second - Create a LeapSecond record (**Temporary**)

    ```
    name: naif0012
    display name: naif0012   
    url: https://naif.jpl.nasa.gov/pub/naif/generic_kernels/lsk/naif0012.tls
    file: Download file fron this url and upload in this field
    ```

- Home › Predict › Bsp planetarys › Add bsp planetary - Create a BSP Planetary record (**Temporary**)
  
  ```
  name: de435
  display name: de435
  url: https://naif.jpl.nasa.gov/pub/naif/generic_kernels/spk/planets/de435.bsp
  file: Download file fron this url and upload in this field
  ```

- Home › Tno › Catalogs › Add catalog - Register Gaia Reference Catalog (**Temporary**)
  ```
  name: gaia_dr2
  display name: GAIA DR2
  database: catalog
  schema: gaia
  tablename: gaia_dr2

  ```

### Update Johnston Known Tnos
Access api ```http://<HOST>/api/known_tnos_johnston/update_list ``` wait response with counts. like this:
More info in http://<HOST>/api/known_tnos_johnston/
```
{
    "success": true,
    "count": 3810,
    "created": 3810,
    "updated": 0
}
```


### Acesso ao HTCondor na rede docker
Executar este comando para criar uma rede chamada `macvlan_mode` em modo bridge

```
docker network create -d macvlan -o macvlan_mode=bridge --subnet=186.232.60.0/24 --gateway=186.232.60.10 -o parent=team0 --ip-range 186.232.60.142/32 macvlan_bridge
```
 
e depois adicionar ao docker_compose essa rede.

 ```
 networks:
  condor:
    name: macvlan_bridge
    external: true
```

 

### More details about the installation are available at this link.

https://github.com/linea-it/tno/blob/master/docs/install_production.md

