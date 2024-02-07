https://sora.readthedocs.io/
https://sora.readthedocs.io/en/latest/releases.html#sora-v0-3-2023-jan-31



sora-astro
sudo apt install git python3.7-dev python3-pip libfreetype6 libfreetype6-dev libproj-dev proj-data proj-bin libgeos-dev pkg-config
python3.7 -m pip install --upgrade pip
python3.7 -m pip install --upgrade Pillow
python3.7 -m pip install matplotlib
#sudo apt install libproj-dev proj-data proj-bin libgeos-dev
export CFLAGS="-DACCEPT_USE_OF_DEPRECATED_PROJ_API_H=1"
#pip3 install cartopy==0.17 ou mais novo
python3.7 -m pip install cartopy==0.18

git clone https://github.com/riogroup/SORA.git
cd SORA
pip install .

pip3 install --upgrade --force-reinstall setuptools
pip uninstall shapely
pip install shapely==1.6

pip uninstall shapely
pip install --no-binary :all: shapely




teste velho
b = sora.Body(name='Chariklo')
p = sora.prediction.prediction(time_beg='2013-05-08 00:00',time_end='2013-07-21 00:00', body=b, step=10, divs=12, radius=600, verbose=False)

teste novo
from sora.prediction.occmap import plot_occ_map as occmap
occmap(name, radius, coord, time, ca, pa, vel, dist, mag=mag, longi=longi, dpi=50,  nameimg='image_filename', path='path/to/save/file/', fmt='jpg')


name -> Nome do objeto conforme aparece na coluna Object da tabela: name (number), formato str
radius -> Raio do objeto, valor da coluna diameter da tabela dividido por dois e 0 se não existir, formato float
coord -> String formada pelos campos 'ra_star_candidate dec_star_candidate' da tabela de predição
time -> Campo date_time da tabela, porém passado no formato iso e em UTC, no format string
ca -> Campo closest_approach na tabela de predição, no formato float
pa -> Campo position_angle na tabela de predição, no formato float
vel -> Campo velocity na tabela de predição, no formato float
dist -> Campo delta na tabela de predição, no formato float
mag -> Campo g na tabela de predição, no formato float
longi -> Campo long na tabela de predição, no formato float

O campo diameter está para ser adicionado na tabela com a finalização da pagina de detalhes, até lá o raio pode ser passado com valor 0.


criar imagem
docker build -f dockerfile-dev -t sora-dev .

rodar imagem
docker run --name SoraDevLinux --rm -it -v"%cd%:/code" -w/code sora-dev sh

no diretorio src
docker run --name SoraDevLinux --rm -it -v"%cd%:/opt/server" -w/opt/server/ -p"8000:8000" sora-dev sh

docker run --name SoraDevLinux --rm -it -v"%cd%:/code" -v"%cd%\archive\sora\input:/media/input" -v"%cd%\archive\sora\output:/media/output" -v"%cd%\archive\sora\output:/media/cache" -w/code sora-
dev sh

post http://localhost:8000/map
{
  "body":"2020 HK93",
  "date":"2023-11-17",
  "time":"15:23:10"
}
ou
{
    "name": "2020 HK93",
    "radius": 0,
    "coord": "00 07 10.3744 +10 09 05.374",
    "time": "2023-11-17T12:23:10.080",
    "ca": 0.201,
    "pa": 127.97,
    "vel": -11.99,
    "dist": 6.93,
    "mag": 20.6,
    "longi": 120
}


para gerar a imagem
D:\11Tech - Projetos\Linea\TO\SORA\conteiners>docker-compose build

para enviar
docker push linea/tno:sora_0.3




publicar no ducker hub

1. criar imagem
   docker build -f dockerfile-dev -t sora-dev .

2. fazer o login
   docker login

3. colocar tag
   docker tag image_id docker_id/nome_do_repositorio:TAG
obs: para saber o image_id de um docker images
   docker tag image_id   mozaru/carto-sora:latest
   docker tag 265bfe59c9b6 mozaru/carto-sora:latest

4. enviar
    docker push mozaru/carto-sora:latest

https://github.com/linea-it/tno
