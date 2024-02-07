## Astrometry Target NIMA

Exemplo de um arquivo de saida da etapa Astrometry (PRAIA) que é usado como input pelo NIMA

| Coluna      | Exemplo                   | Descrição |
|-------------|---------------------------|-----------|
| RA          | 01 42 42.1823             | Observed right ascension (ICRF) - Unit: Hour - Format: hour:minute:second.fraction_of_second  |
| Dec         | -03 23 33.772             | Observed declination (ICRF) - Unit: Degree - Format: degree:arcminute:arcsecond.fraction_of_arcsecond |
| Mag         | 18.199                    | Magnitude |
| JD          | 2456544.86192355          | Julian Date (UTC) of RA and Dec |
| Site        | W84                       | IAU code of site (see https://www.minorplanetcenter.net/iau/lists/ObsCodesF.html) |
| Catalog Code | U                         | Catalogue Codes of site (see https://minorplanetcenter.net/iau/info/CatalogueCodes.html ) |
| Object Name | Eris                      | Identificacao do objeto |


O Arquivo não tem Cabeçalho e é separado por espaços.
Atenção para o RA e Dec são compostos por hora, minuto e segundo 3 colunas para cada.

```
RA, Dec, Mag, JD, Site, Catalog, Object Name
```
Exemplo de arquivo.
```
01 42 42.1823  -03 23 33.772   18.199  2456544.86192355  W84  U   Eris
01 41 05.3417  -03 32 55.989   18.050  2456591.64532108  W84  U   Eris
01 40 28.7683  -03 20 33.222   18.407  2456989.66892850  W84  U   Eris
01 41 31.5901  -03 17 36.844   18.370  2456958.76818426  W84  U   Eris
01 39 43.7089  -03 16 59.518   19.293  2457037.54484156  W84  U   Eris
01 40 30.4240  -03 04 49.746   19.143  2457374.58179276  W84  U   Eris
01 40 20.8865  -03 04 03.188   18.906  2457384.64413267  W84  U   Eris
01 40 18.1940  -03 03 37.587   19.170  2457388.58227044  W84  U   Eris
01 42 28.9808  -03 12 50.957   17.886  2456932.83547953  W84  U   Eris
01 40 30.3671  -03 04 49.595   18.876  2457374.63008386  W84  U   Eris
01 41 18.4019  -03 18 27.837   19.254  2456964.74818192  W84  U   Eris
01 40 20.8863  -03 04 03.188   19.155  2457384.64551696  W84  U   Eris
01 39 43.7179  -03 16 59.238   19.278  2457037.55241885  W84  U   Eris
01 42 28.9733  -03 12 50.964   18.959  2456932.83683481  W84  U   Eris
01 42 28.9807  -03 12 50.927   18.348  2456932.83411601  W84  U   Eris
01 40 18.1933  -03 03 37.563   19.148  2457388.58364559  W84  U   Eris
01 40 18.1950  -03 03 37.588   18.924  2457388.58089812  W84  U   Eris
01 40 02.3433  -03 20 26.920   18.952  2457007.61510356  W84  U   Eris
01 42 36.9940  -03 24 13.280   18.038  2456547.89416702  W84  U   Eris
01 41 55.9343  -03 28 42.906   18.023  2456568.79969900  W84  U   Eris
01 41 54.0076  -03 28 53.994   17.897  2456569.70029616  W84  U   Eris
```
