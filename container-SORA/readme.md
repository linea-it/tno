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



teste
b = sora.Body(name='Chariklo')
p = sora.prediction.prediction(time_beg='2013-05-08 00:00',time_end='2013-07-21 00:00', body=b, step=10, divs=12, radius=600, verbose=False)



pip3 install --upgrade --force-reinstall setuptools
pip uninstall shapely
pip install shapely==1.6

pip uninstall shapely
pip install --no-binary :all: shapely




SORA linux

#Criar ambiente de dev
dockerfile

criar dockerfile "ubuntugui"
FROM ubuntu:latest
RUN apt update && DEBIAN_FRONTEND=noninteractive apt install -y lubuntu-desktop lightdm
RUN rm /run/reboot-required*
RUN echo "/usr/sbin/lightdm" > /etc/X11/default-display-manager
RUN echo "\
[LightDM]\n\
[Seat:*]\n\
type=xremote\n\
xserver-hostname=host.docker.internal\n\
xserver-display-number=0\n\
autologin-user=root\n\
autologin-user-timeout=0\n\
autologin-session=Lubuntu\n\
" > /etc/lightdm/lightdm.conf.d/lightdm.conf
ENV DISPLAY=host.docker.internal:0.0


criar dockerfile "bsgui"
FROM ubuntugui
RUN DEBIAN_FRONTEND=noninteractive apt install -y libxss1

criar dockerfile "bsgui-dev"
FROM bsgui
RUN DEBIAN_FRONTEND=noninteractive apt install -y python3.7 python3.7-dev language-pack-en
RUN python3.7 -m pip install --force-reinstall -v setuptools==61.2 &&
    python3.7 -m pip install screeninfo cefpython3 tk cx_freeze tzlocal psutil distro PyCryptodome

#Criar portable com o cxfreeze
docker run --name BSDevLinux --rm -it -v"%cd%:/code" -w/code bsgui-dev bash
cxfreeze -c main.py --target-name=BrowserSafe --target-dir=dist --packages=json,tk,cefpython3,screeninfo,urllib,tkinter,tzlocal,psutil,distro,Crypto


#Testar portable
docker run --name BSDevLinux --rm -it -v"%cd%/dist:/opt/bin/BrowserSafe" -w/opt/bin/BrowserSafe bsgui ./BrowserSafe
cxfreeze -c main.py --target-dir dist --packages=json,tk,cefpython3,screeninfo,urllib,tkinter,tzlocal,psutil,distro,Crypto


linux xmodmap -  apt install x11-xserver-utils

disable lctrl
xmodmap -e "keycode 37 = "  
disable rctrl
xmodmap -e "keycode 109 = "  

xev para ver o mapeamento
alt-esq -> state 0x8, keycode 64 (keysym 0xffe9, Alt_L), same_screen YES,
alt-dir -> state 0x80, keycode 113 (keysym 0xfe03, ISO_Level3_Shift), same_screen YES







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
   


