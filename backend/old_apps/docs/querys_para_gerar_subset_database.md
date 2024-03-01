# QUERYS E COMANDOS PARA GERAR UM SUBSET DE TESTES PARA O TNO

Usei como exemplo os objetos da classe KBO e Centaur

```
SELECT * FROM tno.tno_skybotoutput WHERE dynclass like '%KBO%' OR dynclass like '%Centaur%';
```

### Pointing
Agrupar pelo id do apontamento para evitar duplicidades, já que na tabela skybot output varios objetos podem estar ligados ao mesmo apontamento.
```
SELECT b.* FROM tno.tno_skybotoutput a INNER JOIN tno.tno_pointing b ON (a.pointing_id = b.id) WHERE a.dynclass like '%KBO%' OR dynclass like '%Centaur%' GROUP BY b.id;
```

```
SELECT a.* FROM tno.tno_ccdimage a INNER JOIN tno.tno_skybotoutput b ON (a.pointing_id = b.pointing_id) WHERE b.dynclass like '%KBO%' OR dynclass like '%Centaur%' GROUP BY a.id;
```

## Geração de dados para teste
### Skybot output
```
psql -h desdb4 -U gavo gavo -c "COPY (SELECT * FROM tno.tno_skybotoutput WHERE dynclass like '%KBO%' OR dynclass like '%Centaur%') TO stdout DELIMITER ';' CSV HEADER" > tno_skybotoutput.csv
```
### Pointings
```
psql -h desdb4 -U gavo gavo -c "COPY (SELECT b.* FROM tno.tno_skybotoutput a INNER JOIN tno.tno_pointing b ON (a.pointing_id = b.id) WHERE a.dynclass like '%KBO%' OR dynclass like '%Centaur%' GROUP BY b.id) TO stdout DELIMITER ';' CSV HEADER" > tno_pointings.csv
```
### CCD Images
```
psql -h desdb4 -U gavo gavo -c "COPY (SELECT a.* FROM tno.tno_ccdimage a INNER JOIN tno.tno_skybotoutput b ON (a.pointing_id = b.pointing_id) WHERE b.dynclass like '%KBO%' OR dynclass like '%Centaur%' GROUP BY a.id) TO stdout DELIMITER ';' CSV HEADER" > tno_ccdimage.csv
```

## Importar os csv para o banco de dados
Com o Container Database rodando, verificar se o diretorio com os csv está montado como volume no container.
executar os comando do psql para importar as tabelas. nos exemplos o diretorio com os CSVs esta montado em /data.

Usar o comando docker ps para saber o nome do container que esta rodando neste exemplo 'tno_database_1'
```
docker ps
```


### Pointings
```
docker exec -it tno_database_1 psql -h localhost -U postgres -c "\\copy tno_pointing from '/data/tno_pointings.csv' DELIMITER ';' CSV HEADER"
```

### CCD Images
```
docker exec -it tno_database_1 psql -h localhost -U postgres -c "\\copy tno_ccdimage from '/data/tno_ccdimage.csv' DELIMITER ';' CSV HEADER"
```

### Skybot Output
```
docker exec -it tno_database_1 psql -h localhost -U postgres -c "\\copy tno_skybotoutput from '/data/tno_skybotoutput.csv' DELIMITER ';' CSV HEADER"
```
