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


### Create q3c Indexes

### Enter initial data
in admin interface:

- Home › Praia › Configurations › Add configuration  - Create a default configuration for Astrometry Pipeline. (**Temporary**)
  ```
  user: Current user
  name: Default
  ```

- Home › Predict › Leap seconds › Add leap second - Create a LeapSecond record (**Temporary**)

    ```
    name: naif0012
    display name: naif0012   
    url: https://naif.jpl.nasa.gov/pub/naif/generic_kernels/lsk/naif0012.tls
    file: Download file fron this url and upload in this field
    ```

- Home › Predict › Bsp planetarys › Add bsp planetary - Create a BSP Planetary record (**Temporary**)
  
  ```
  name: de435
  display name: de435
  url: https://naif.jpl.nasa.gov/pub/naif/generic_kernels/spk/planets/de435.bsp
  file: Download file fron this url and upload in this field
  ```

### Update Johnston Known Tnos
Access api ```http://<HOST>/api/known_tnos_johnston/update_list ``` wait response with counts. like this:
More info in http://<HOST>/api/known_tnos_johnston/
```
{
    "success": true,
    "count": 3810,
    "created": 3810,
    "updated": 0
}
```
