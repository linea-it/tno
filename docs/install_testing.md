# Install TNO in Testing enviroment

### Create Docker Compose file 

### Create and edit a .env 
Configure
- database credentials. 
- paths
- Theads Min and max
- Log Level


### Start 
```docker-compose up```

### Create superuser in Django 


### Import Database

```psql -h desdb4 -U tnouseradmindev tnodbdev -c "\copy tno_pointing from '/archive/tno/testing/tno_pointings.csv' DELIMITER ';' CSV HEADER"```

```psql -h desdb4 -U tnouseradmindev tnodbdev -c "\copy tno_ccdimage from '/archive/tno/testing/tno_ccdimage.csv' DELIMITER ';' CSV HEADER"```

```psql -h desdb4 -U tnouseradmindev tnodbdev -c "\copy tno_skybotoutput from '/archive/tno/testing/tno_skybotoutput.csv' DELIMITER ';' CSV HEADER"```

