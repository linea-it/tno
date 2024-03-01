# Deploy TNO Portal Production

Criar pasta raiz para o portal e subdiretórios

```bash
mkdir tno_prod && cd tno_prod
mkdir -p  logs data data/tmp data/predict_occultations data/rabbitmq data/astropy_cache data/public data/public/database_subset /data/public/maps data/skybot_output
chmod -R g+w logs data data/tmp data/predict_occultations data/rabbitmq data/astropy_cache data/public data/public/database_subset /data/public/maps data/skybot_output

```

# TODO: Chmod na pasta tno_prod deve ser depois das pastas criadas

# TODO: Os mapas devem ser criados na pasta data/public

# TODO: sshkey a variavel é dispensavel pode ter uma unica variavel especificando o caminho original, e dentro do container montar sempre no mesmo local.

Generate SECRET_KEY

```bash
docker-compose run -it backend python -c "import secrets; print(secrets.token_urlsafe())"
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

Load Initial Data (LeapSecond, BspPlanetary, Stelar Catalog)

```bash
docker-compose exec backend python manage.py loaddata initial_data.yaml
```

Load Initial Asteroids Data

```bash
docker-compose exec backend python manage.py update_asteroid_table
```
