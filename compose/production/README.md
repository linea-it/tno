# Deploy Production enviroment

Dependencias:

- Docker version 25.0.1
- git version 2.39.3
- Usuario pertencente ao grupo `ton(15010)`
- Acesso ao lustre
- Acesso ao banco de dados desdb4 - **prod_gavo**
- Acesso a um banco de dados especifico para o portal.
- Chave ssh criada no home do usuario.
- Acesso ao slurm para execução do pipeline de predição.

---

Estes passos foram usados no deploy do ambiente: <https://solarsystem.linea.org.br>

Considerando:

- Maquina srvnode06
- Usuario app.tno (31670:15010)
- Instalação feita no path: `/lustre/t1/scratch/users/app.tno/tno_prod`
- Chave ssh previamente criada em: `/lustre/t1/scratch/users/app.tno/.ssh/id_rsa`

---

## Criação das pastas e arquivos de configuração do ambiente

Clone do repositório para uma pasta temporaria `tno_temp`, Criação das pastas e arquivos de configuração, remoção dos arquivos usados na instalação.

<!-- markdownlint-disable-next-line -->

```bash
git clone https://github.com/linea-it/tno.git tno_temp \
&& cp -r tno_temp/compose/production tno_prod \
&& cp tno_temp/predict_occultation/environment.py3.yml tno_prod \
&& mkdir -p tno_prod tno_prod/logs tno_prod/data tno_prod/data/rabbitmq \
&& chmod -R g+w tno_prod \
&& cd tno_prod \
&& mv env-template .env \
&& mv docker-compose-template.yml docker-compose.yml \
&& mv local_settings-template.py local_settings.py \
&& mv nginx_proxy-template.conf nginx_proxy.conf \
&& cd .. && rm -rf tno_temp tno_prod/environment.py3.yml tno_prod/install_miniconda.sh && cd tno_prod
```

> Daqui em diante todos os comandos estão considerando que a pasta atual é tno_prod.

## Instalação do Miniconda

Este miniconda é usado pelo pipeline predict_occultation e é especifico para este ambiente.

**IMPORTANTE** No momento a instalação do miniconda está falhando quando executada direto da srvnode06. O workaround é executar os proximos comandos a partir da maquina srvnode04. mas usando o mesmo usuario app.tno e o mesmo diretório.
Pode ser necessário alterar o path onde o miniconda sera instalado. basta editar o script e fazer a alteração de acordo com o path.

```sh
miniconda_path="/lustre/t1/scratch/users/app.tno/<PROJ_DIR>/miniconda"
```

Dentro da pasta existe um script install_miniconda.sh esse script baixa e instala o miniconda no path configurado na variavel `miniconda_path`.
Execute os comandos a seguir para criar o enviroment py3

```bash
./install_miniconda.sh \
&& source miniconda/bin/activate \
&& conda env create -f environment.py3.yml \
&& conda deactivate
```

## Configuração das Variaveis de ambiente

Os arquivos de configuração .env e local_settings já estão preenchidos com valores compativeis com o ambiente de testing. Mas é necessário alterar/preencher as variaveis relacionadas a segurança e acessos.

```bash
vim .env
```

No momento deste documento as variaveis a serem editadas são:

- DJANGO_SECRET_KEY
- RABBITMQ_DEFAULT_PASS
- DB_ADMIN_URI
- DB_CATALOG_URI

Alterar o arquivo de configuração do Django de acordo com a necessidade.

```bash
vim local_settings.py
```

**IMPORTANTE!** Editar o arquivo docker-compose.yml e conferir os pontos de montagem principalmente
o serviço predict_occultation que precisa de uma chave ssh no home do usuario app.tno.

Para preencher a variavel de ambiente .env/DJANGO_SECRET_KEY é necessário executar um comando dentro do container de backend para gerar uma chave aleatória.

```bash
docker compose run -it --rm backend python -c "import secrets; print(secrets.token_urlsafe())"
```

Copie a saida do comando e prencha a variavel DJANGO_SECRET_KEY.

## Setup Backend

Crie um usuario administrativo para o Django.

```bash
docker compose run -it --rm backend python manage.py createsuperuser
```

Crie os indexes Q3C para as tabelas que utilizam index espacial.

```bash
docker compose run -it --rm backend python manage.py create_q3c_index
```

Load Initial Data (LeapSecond, BspPlanetary, Stelar Catalog)

```bash
docker compose run -it --rm backend python manage.py loaddata initial_data.yaml
```

Load Initial Asteroids Data

```bash
docker compose run -it --rm backend python manage.py update_asteroid_table
```

> A criação da tabela de asteorids demora alguns minutos.

---

**Workaround:**

A criação da tabela de asteroid depende de 2 arquivos baixados de serviços externos pode ser que ao executar o comando de algum erro caso esses arquivos estejam indisponiveis. Para corrigir isso utilize os arquivos de sample deixados no home do usuario app.tno e execute o comando com a opcao --local.

```bash
cp /lustre/t1/scratch/users/app.tno/data_sample/ssoBFT-latest.ecsv.bz2 data/asteroid_table/ \
&& cp /lustre/t1/scratch/users/app.tno/data_sample/mpcorb_extended.json.gz data/asteroid_table/ \
&& docker compose run -it --rm backend python manage.py update_asteroid_table --local
```

---

## Procedimento de Start e Stop do ambiente

Para ligar todo o ambiente:

```bash
docker compose up -d
```

Para desligar todo o ambiente:

```bash
docker compose stop
```

Reiniciar o ambiente

```bash
docker compose stop && docker compose up -d
```

## Procedimento de Update de versão

As imagens docker são geradas automaticamente pelo github actions e estão disponiveis no docker.io
https://hub.docker.com/repository/docker/linea/tno/tags?page=1&ordering=last_updated

Exemplo para atualizar as imagens da versão `f19ff50` para `4bcaebe`

Editar o arquivo .env e alterar a variavel com docker tag desejada.

Antes

```bash
# tno_prod/.env
TNO_IMAGE_TAG=f19ff50
...
```

Depois

```bash
# tno_prod/.env
TNO_IMAGE_TAG=4bcaebe
...
```

Após alterar a imagem basta fazer um pull das novas docker images e restartar os serviços.

```bash
docker compose pull && docker compose stop && docker compose up -d
```
