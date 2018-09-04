# Catalog API

DESCRIÇÂO A API

Parametros

### Catalog
Descrição

### Radial Query
Descrição 

| name | type | required | description |
-------|------|----------|-------------|
catalog| string| yes | Internal catalog name, lowercase and without spaces. to have access to the catalog list use the API catalog. |
ra | float | yes | RA in degrees of center position |
dec | float | yes | Dec in degrees of center position |
radius | float | no | Radius in degrees, if not set the default will be 0.001 |
columns | string | no | list of columns separated by commas, if not defined all columns will be returned. |
limit | integer | no | number of result lines, by default all results are returned |
mime_type | string | no | Result format use, csv or json. when omitted the default is json |

Exemplo em linha de comando
```
curl -i \
    -u <username>:<password> \
    -H 'Accept:application/json' \
    -G \
    http://localhost:7001/catalog/radial_query/ \
    -d catalog=stripe82 \
    -d ra=317.490884 \
    -d dec=-1.762072 \
    -d radius=0.01 \
    -d limit=10 \
    -d columns=ra,dec 
    -d mime_type=json
``` 

Exemplo via brownser **Necessário estar logado**
```
http://localhost:7001/catalog/radial_query/?catalog=stripe82&ra=317.490884&dec=-1.762072&radius=0.01&limit=1&columns=ra,dec
```

Resultado deste exemplo com formato em Json
```
{"success":true,"results":[{"ra":317.492794,"dec":-1.764518},{"ra":317.489643,"dec":-1.762129},{"ra":317.48935,"dec":-1.760044},{"ra":317.490934,"dec":-1.762553},{"ra":317.490884,"dec":-1.762072},{"ra":317.490916,"dec":-1.760281},{"ra":317.490936,"dec":-1.759468},{"ra":317.492251,"dec":-1.760094},{"ra":317.491961,"dec":-1.754819},{"ra":317.497475,"dec":-1.76731}],"count":10}
```



