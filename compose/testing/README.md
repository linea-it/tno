# Deploy Testing enviroment

Considerando

- Maquina srvnode06
- Usuario app.tno (31670:15010)

## Criação das pastas e arquivos de configuração do ambiente

Clone the repository to temporari folder, copy enviroment folder and files.

´´´bash
gh repo clone linea-it/tno tno_temp \
&& cp -r tno_temp/compose/testing tno_testing \
&& cp tno_temp/predict_occultation/environment.py3.yml tno_testing \
&& mkdir -p tno_testing tno_testing/logs tno_testing/data tno_testing/data/rabbitmq \
&& chmod -R g+w tno_testing \
&& cd tno_testing \
&& mv .env-template .env \
&& mv docker-compose-template.yml docker-compose.yml \
&& mv local_settings-template.py local_settings.py \
&& mv nginx_proxy-template.conf nginx_proxy.conf \
´´´

## Instalação do Miniconda especifico para o ambiente

Este miniconda é usado pelo pipeline predict_occultation.

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

- RABBITMQ_DEFAULT_PASS
- DB_ADMIN_URI
- DB_CATALOG_URI
- DJANGO_SECRET_KEY

Alterar o arquivo de configuração do Django de acordo com a necessidade.

```bash
vim local_settings.py
```
