
select * from tno_skybotoutput limit 10;

-- Total de Linhas na tabela Skybot
select count(*) as total_count from tno_skybotoutput;
--732041

-- Total de Linhas que não estão associadas a nenhum Pointing (Expnum, ccdnum, band)
select count(name) from tno_skybotoutput where pointing_id is null;
--213293

-- Total de Linhas que estão associadas com algum Pointing (Expnum, ccdnum, band)
select count(name) from tno_skybotoutput where pointing_id is not null;
--518748

-- Total de Objetos diferentes na tabela Skybot
select count(distinct(name)) as count_asteroids from tno_skybotoutput; 
--95346

-- Total CCDs Unicos (considerando expnum, ccdnum e band como unico)
select count(distinct(expnum, ccdnum, band)) from tno_pointing; 
--327487

-- Total CCDs Unicos com pelo menos um Asteroid.
select count(a.*)  as count_ccd_with_asteroids from (select expnum, ccdnum, band from tno_skybotoutput where ccdnum is not null group by expnum, ccdnum, band) as a
-- OU
select count(a.*)  as count_ccd_with_asteroids from (select count(distinct(expnum, ccdnum, band)) from tno_pointing) as a
--327487

-- Total de Asteroids diferentes que Estao dentro de algum CCD
select count(distinct(name)) from tno_skybotoutput where pointing_id is not null;

-- Total de Asteroids diferentes que não estao dentro de nenhum CCD
select count(distinct(name)) from tno_skybotoutput where pointing_id is null;
--63758

-- Total de CCDs downloaded
select count(distinct(expnum, ccdnum, band)) as ccds_downloaded from tno_pointing where downloaded is true; 
--8137

-- Total de CCDs not Downloaded
select count(distinct(expnum, ccdnum, band)) as ccds_not_downloaded from tno_pointing where downloaded is not true;
--319350

-- Distinct Dynclass
select distinct(dynclass) from tno_skybotoutput 

-- Asteroids Grouped by dynclass
select dynclass, count(distinct(name)) from tno_skybotoutput where dynclass in (select distinct(dynclass) from tno_skybotoutput) group by dynclass 


--Asteroids por Classes
-- Asteroids Grouped by Class KBO
select count(*) from tno_skybotoutput where dynclass like 'KBO%';

-- Asteroids Grouped by Class Centaurs
select count(*) from tno_skybotoutput where dynclass = 'Centaur';

-- Asteroids Grouped by Class Centaurs
select count(*) from tno_skybotoutput where dynclass = 'Trojan';




-- Total Pointings
select count(*) from tno_pointing;
--327487

-- Total Pointings Downloaded
select count(*) from tno_pointing where downloaded is true;

-- Total Pointings not Downloaded
select count(*) from tno_pointing where downloaded is not true;

-- Pointings by band
select count(*) from tno_pointing where band = 'g';

-- Pointing mais recente
select * from tno_pointing order by date_obs desc limit 1;

-- Pointing mais antigo
select * from tno_pointing order by date_obs asc limit 1;

-- Unique exposures
select count(distinct(expnum)) from tno_pointing;

