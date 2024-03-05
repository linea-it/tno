# Deploy Testing enviroment

Considerando

- Maquina srvnode06
- Usuario app.tno (31670:15010)

Clone the repository to temporari folder, copy enviroment folder and files.

´´´bash
gh repo clone linea-it/tno tno_temp \
&& cp -r tno_temp/compose/testing tno_testing \
&& cp tno_temp/predict_occultation/environment.py3.yml tno_testing \
&& mkdir -p tno_testing tno_testing/logs tno_testing/data tno_testing/data/rabbitmq \
&& chmod -R g+w tno_testing \
&& cd tno_testing \
&& cp .env-template .env \
&& cp docker-compose-template.yml docker-compose.yml \
&& cp local_settings-template.py local_settings.py
´´´

Install Miniconda in PWD/tno_testing/miniconda and create enviroment named py3 with environment.py3.yml

(Processo não descrito pq o ambiente srvnode06 está com problema na instalação do miniconda.)
