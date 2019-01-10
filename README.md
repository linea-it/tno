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

Create link to ngnix config
```
cd nginx
ln -s development_template.conf nginx-proxy.conf
```

Create link to docker-compose.yml
```
cd ..
ln -s docker-compose-development-template.yml docker-compose.yml
```

Build Containers
```
docker-compose build
```

Run Backend
```
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
