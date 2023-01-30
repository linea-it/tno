# tno
Transneptunian Occultation Network Portal

Pipelines: <https://github.com/linea-it/tno_pipelines>

Instalação de ambiente de produção/validação: <https://github.com/linea-it/tno/blob/main/docs/install_production.md>

## Development start
Clone this repository

```bash
git clone https://github.com/linea-it/tno.git tno
```

Create directorys

```bash
mkdir tno/database_subset tno/archive tno/log && cd tno
```

### Setup Backend:
Inside project folder tno:

Copy docker-compose.yml

```bash
cp docker-compose-development-template.yml docker-compose.yml
```

Copy local_settings.py edit local variables if necessary.

```bash
cp local_settings_template.py local_settings.py
```

Run Database container (Na primeira vez é necessário ligar o database primeiro para que seja criado o db)

```bash
docker-compose up -d database
```

Build backend container

```bash
docker-compose build backend
```

Run Backend

```bash
docker-compose up backend
```

Create a superuser in Django
run createsuperuser to create a admin user in Django.
with the docker running open a new terminal and run this command.

```bash
docker-compose exec backend python manage.py createsuperuser
```

Table preparation for Q3C
run create_q3c_index for create indexes.

```bash
docker-compose exec backend python manage.py create_q3c_index
```

#### Load DES release data

Load table exposure and ccds from fixtures files.

Download files and import them

```bash
wget -P database_subset http://dev.linea.org.br/\~glauber.costa/exposures.yml.gz && wget -P database_subset http://dev.linea.org.br/\~glauber.costa/ccds.yml.xz
```

```bash
wget -P database_subset https://tno-dev.linea.org.br/data/database_subset/exposures.csv.zip && wget -P database_subset https://tno-dev.linea.org.br/data/database_subset/ccds.csv.zip
```

Unzip files

```bash
unzip database_subset/exposures.csv.zip -d database_subset && unzip database_subset/ccds.csv.zip -d database_subset
```

Importar os csv para o banco de dados
Com o Container Database rodando, verificar se o diretorio com os csv está montado como volume no container.
Recomendo desligar o container do backend e deixar só o database rodando.
executar os comando do psql para importar as tabelas. nos exemplos o diretorio com os CSVs esta montado em /data.

IMPORTANTE: A tabelas de CCDs é muito grande e demora bastante para ser importada (~40min).

DES Exposures

```bash
docker-compose exec database psql -U postgres -d postgres -c "\\copy des_exposure from '/data/exposures.csv' DELIMITER '|' CSV HEADER"
```

DES CCDs

```bash
docker-compose exec database psql -U postgres -d postgres -c "\\copy des_ccd from '/data/ccds.csv' DELIMITER '|' CSV HEADER"
```

### Setup Frontend

Frontend uses a Node image. before up this container run yarn for install dependencies.

```bash
docker-compose run frontend yarn
```

### Run

Stop all containers and run in background mode

```bash
docker-compose up -d
```

### Test in brownser



### For Running Science pipelines some registers are necessary
Access admin interface in http://localhost/admin

- Home › Predict › Leap seconds › Add leap second - Create a LeapSecond record (**Temporary**)

    ```bash
    name: naif0012
    display name: naif0012   
    url: https://naif.jpl.nasa.gov/pub/naif/generic_kernels/lsk/naif0012.tls
    file: Download file fron this url and upload in this field
    ```

- Home › Predict › Bsp planetarys › Add bsp planetary - Create a BSP Planetary record (**Temporary**)
  
  ```bash
  name: de435
  display name: de435
  url: https://naif.jpl.nasa.gov/pub/naif/generic_kernels/spk/planets/de435.bsp
  file: Download file fron this url and upload in this field
  ```

- Home › Tno › Catalogs › Add catalog - Register Gaia Reference Catalog (**Temporary**)

  ```bash
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

