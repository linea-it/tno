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
