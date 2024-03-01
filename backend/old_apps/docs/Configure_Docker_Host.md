## Configure Docker Remote API

Configurar o Docker cliente da maquina host para aceitar comando no ip e porta configurado.

Para o host local pode configurar só a porta, mais para ambientes de produção e testing tem que configurar para
aceitar apenas da rede do docker.

Baseado no How to:
enable the remote API for dockerd: https://success.docker.com/article/how-do-i-enable-the-remote-api-for-dockerd

Testado no Ubuntu

1. Create a file at /etc/systemd/system/docker.service.d/startup_options.conf with the below contents:

OBS: The file SHOULD live at /etc/systemd/system/docker.service.d/ otherwise it won't work

```
[Service]
ExecStart=
ExecStart=/usr/bin/dockerd -H unix:///var/run/docker.sock -H tcp://0.0.0.0:2376
```

2. Reload the unit files:

```
sudo systemctl daemon-reload
```

3. Restart the docker daemon with new startup options:

```
sudo systemctl restart docker.service
```

Para conectar nessa API testei usando a biblioteca python docker
https://github.com/docker/docker-py
https://docker-py.readthedocs.io/en/stable/

Exemplo:

entrei em um container python qualquer e
instalei a biblioteca docker.

tem que descobrir qual o ip da maquina host, dentro do container.
nesse caso era: 172.19.0.1

para descobrir use este comando com o container ligado
```
docker inspect -f '{{range .NetworkSettings.Networks}}{{.Gateway}}{{end}}' <container_name_or_id>
```

```
pip install docker
```
executei do terminal python
```
import docker
client = docker.DockerClient(base_url='tcp://172.19.0.1:2376')
client.containers.run('alpine', 'echo hello world')
```

dessa forma eu consegui fazer um container criar outro no Host e executar.
