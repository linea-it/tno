## 4.0.3 (2024-09-03)

### Fix

- **commitzen**: fixed bump release action

## 4.0.2 (2024-09-03)

### Fix

- **commitzen**: test github action

## 4.0.1 (2024-09-03)

### Fix

- **commitzend**: fixed commitzen release action

## 4.0.0 (2024-09-03)

### Feat

- **Predict-maps**: the map identifier has been changed. now the id hash is used (#1075)
- **Prediction-Occultation**: added unique hash identifier for predictions events
- **Prediction-Event**: added new unique identifier hash_id
- **Enviroment-Alert**: added an alert when portal running in development
- **Commitzen**: Added Commitzen to devcontainer

### Fix

- **Auth**: hided login button when subscription is disabled (#1070)
- **Autobot**: autobot has been temporarily disabled (#1073)
- **tasks.py**: fixes soft_time_limit and time_limit values
- **Detail.js**: pre-commit rerun
- **Fix-asteroid-table-update**: extends soft time limit for celery
- **Run-Predict-Occ**: fixed error when selecting more than one object by name
- **tasks.py**: fixes SoftTimeLimitExceeded() at asteroid table update run

## v3.1.0 (2024-04-19) Integration with GAIA DR3 catalog

- Fixed #903 - Prediction detail now filter only for asteroid name and … by @glaubervila in https://github.com/linea-it/tno/pull/905
- Fixed #906 - Maps now are filtered by mag limit 16 and solar time bet… by @glaubervila in https://github.com/linea-it/tno/pull/907
- 906 improve query maps by @glaubervila in https://github.com/linea-it/tno/pull/908
- Fixed #889 - Geo Filter now is optional and check if is available by @glaubervila in https://github.com/linea-it/tno/pull/909
- Update README.md by @glaubervila in https://github.com/linea-it/tno/pull/912
- 666 doc api by @glaubervila in https://github.com/linea-it/tno/pull/914
- Fix docker compose by @glaubervila in https://github.com/linea-it/tno/pull/917
- Documentação API atualizada by @rcboufleur in https://github.com/linea-it/tno/pull/918
- Update index.html by @josiane-silwa in https://github.com/linea-it/tno/pull/922
- the wrong link was adjusted by @jandsonrj in https://github.com/linea-it/tno/pull/913
- Update README.md by @glaubervila in https://github.com/linea-it/tno/pull/911
- Fix geo filter by @glaubervila in https://github.com/linea-it/tno/pull/920
- Fix db config by @glaubervila in https://github.com/linea-it/tno/pull/924
- 925 text fixes in the frontend and documentation by @rcboufleur in https://github.com/linea-it/tno/pull/926
- Fix creation maps task by @rcboufleur in https://github.com/linea-it/tno/pull/927
- On the fly map generation fix by @rcboufleur in https://github.com/linea-it/tno/pull/928
- Closes #937 - adicao do botao help no filtro by @jandsonrj in https://github.com/linea-it/tno/pull/944
- Closes #935 - adicao do botao de informacao by @jandsonrj in https://github.com/linea-it/tno/pull/942
- Closes #936 - label de tipo de filtro padrao ao abrir o solar system by @jandsonrj in https://github.com/linea-it/tno/pull/943
- Fixed #948 query star event now use source_id when it is available by @glaubervila in https://github.com/linea-it/tno/pull/950
- 949 modificar a layer do aladin sky atlas by @rcboufleur in https://github.com/linea-it/tno/pull/956
- 952 fix tno table update by @rcboufleur in https://github.com/linea-it/tno/pull/955
- added a switch to enable and disable the show events filter by @jandsonrj in https://github.com/linea-it/tno/pull/958
- Implement google analytics by @jandsonrj in https://github.com/linea-it/tno/pull/959
- 957 Atualiza documentação com updates do frontende by @rcboufleur in https://github.com/linea-it/tno/pull/960
- Local solar time label fix by @rcboufleur in https://github.com/linea-it/tno/pull/961
- Fixed 951 - API 'radius' parameter bug by @glaubervila in https://github.com/linea-it/tno/pull/963
- Added Suport to GAIA DR3 by @glaubervila in https://github.com/linea-it/tno/pull/966
- Adds computation of the best projected search circle based on object … by @rcboufleur in https://github.com/linea-it/tno/pull/972
- 968 magnitude drop filter by @glaubervila in https://github.com/linea-it/tno/pull/975
- Optimizes star search radius in occultation by @rcboufleur in https://github.com/linea-it/tno/pull/978
- 967 include event duration uncertainty and new filter by @rcboufleur in https://github.com/linea-it/tno/pull/981
- Closed #977 - Added filter by object diameter by @glaubervila in https://github.com/linea-it/tno/pull/980
- Changed Diameter Filter Label by @glaubervila in https://github.com/linea-it/tno/pull/982
- Closed #979 detail page updated to gaia dr3 by @rcboufleur in https://github.com/linea-it/tno/pull/983
- Closed #984 - Added Event duration filter by @glaubervila in https://github.com/linea-it/tno/pull/985
- 986 update documentation by @rcboufleur in https://github.com/linea-it/tno/pull/988
- Add columns event_duration, diameter and magnitude drop to the predic… by @glaubervila in https://github.com/linea-it/tno/pull/989
- Closed #990 fix to geofilter after renaming api fields by @rcboufleur in https://github.com/linea-it/tno/pull/993
- Closed #991 update filter event documentation page by @rcboufleur in https://github.com/linea-it/tno/pull/994
- Fixed #995 - Now events are removed regardless of the execution result. by @glaubervila in https://github.com/linea-it/tno/pull/998

## v3.0.0 (2024-03-06)

## v2.1.2 (2024-01-16)

## v2.1.1 (2024-01-16)

## v2.1.0 (2024-01-16)

## v2.0 (2023-02-01)

## v1.3.0 (2020-03-23)

## v1.2.0 (2020-03-23)

## v1.1.2 (2020-02-20)
