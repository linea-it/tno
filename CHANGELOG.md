## 4.1.0 (2024-11-28)

### Feat

- Add celery task and configuration to run and send subcriptions

### Fix

- **backend/tno/serializers.py**: fix get map url error handling
- general field behaviour in event form filters
- **backend/newsletter/newsletter_send_mail.py**: fix site url
- **frontend/src/components/Newsletter/GeoFilter/index.js**: fix form behaviour
- **backend/newsletter/process_event_filter.py**: fix execution on filtering processing and querying
- **frontend/src/components/AsteroidSelect/AsteroidNameSelect.js**: fix bug in asteroid autocomplete
- a parameter label was fixed globaly
- ajusta campos vazios como nulos no envio da requisicao
- **frontend/src/pages/PublicPortal/Newsletter/EventFilterForm.js**: fix bug magnitude selection
- migrate subscription database
- multiple fixes on event filter form
- **frontend/src/pages/PublicPortal/Footer/index.js**: fix material ui warnings
- **prediction_job_by_class**: base_dynclass sub_class logic bug fix

### Refactor

- **backend/coreAdmin/celery.py**: Update subscription scheduling in celery beat
- **backend/newsletter/newsletter_send_mail.py**: Update subject in subscription email
- **backend/coreAdmin/settings.py**: Add support for passwordless email token template
- Modify text on landing page
- Update and refactor text in subscription email template
- **backend/templates/validation_token_email_template.html**: Add token validation template
- Add new columns and context for templates
- Templates refactored to add more data
- **backend/newsletter/process_event_filter.py**: Separação dos logs
- **backend/newsletter/events_send_mail.py-backend/newsletter/newsletter_send_mail.py**: Inclusão dos campos de data da rodada no context que é passado para o template html
- **backend/newsletter/templates/results.html**: Correção das variaveis no template html
- Refactor the email sending for subscription pipeline
- Fixes the foreing key
- **backend/newsletter/management/commands/execute_subscription_filter.py**: adaptation to new execution on filter processing
- **backend/newsletter/process_event_filter.py**: filtering and processing
- field format changed and frequency added
- **backend/newsletter/process_event_filter.py**: Limpeza de código
- **backend/newsletter/process_event_filter.py**: Inclusão de verificação do diretorio para o arquivo csv, cria o diretorio se nao existir
- **backend/newsletter/newsletter_send_mail.py**: Limpeza de código, inclusão de comentário, correção do titulo do email enviado
- **backend/newsletter/management/commands/execute_subscription_filter.py**: Mudança no nome das variaveis que executam as funções
- subscription database columns type updates
- **backend/newsletter/events_send_mail.py-backend/newsletter/process_event_filter.py**: Alteração nas mensagens de logs
- **backend/newsletter/process_event_filter.py**: Limpeza de código e inclusao de comentarios
- **backend/newsletter/management/commands/execute_subscription_filter.py**: Limpeza de código e inclusao de comentarios
- **backend/newsletter/events_send_mail.py**: Limpeza de código e inclusao de infos e comentarios
- **backend/newsletter/management/commands/execute_subscription_filter.py**: Inclusao do parametro data inicial e final na chamada da função que dispara o envio dos emails
- **backend/newsletter/newsletter_send_mail.py**: Inclusao do parametro de data inicial e final no context passado para os emails
- **backend/newsletter/events_send_mail.py**: Alteração nos parametros da função que dispara o envio dos emails. Delimitador da quantida de eventos exibida no email
- **backend/newsletter/process_event_filter.py**: Inclusao do parametro data na função que dispara o  envio dos emails
- **backend/newsletter/templates/results.html**: Ajustes na formatação da tabela
- **backend/newsletter/templates/results.html**: Ajuste na formatação da tabela e das variaveis exibidas no email
- **backend/newsletter/process_event_filter.py**: Correção na chamada da função de crear o csv e correção na função que salva o status da criação do arquivo no banco
- **backend/newsletter/management/commands/execute_subscription_filter.py**: Adição de comentarios
- **backend/newsletter/process_event_filter.py**: Inclusao da gravação de status do processamento dos filtros solicitados. Inclusão dos demais campos da tabela para escrita no csv
- **backend/newsletter/events_send_mail.py**: Inclusão da gravação de status do processo de envio dos emails
- **backend/newsletter/events_send_mail.py**: Inclusão da gravação de status do processo de submição
- **backend/newsletter/process_event_filter.py**: Inclusão do campo title na gravação de status do processo de submição
- **backend/newsletter/events_send_mail.py**: Substituição dos prints por log.info
- **backend/newsletter/process_event_filter.py**: Inclusão do filtro de eventos por nomes. Ravisão do filtro por radius. Alteração no trecho de código que apenda os eventos encontrados e monta o link para o arquivo csv. Revisão da verificação por periodo. Limpeza de código
- **backend/newsletter/views/submission.py**: Remoção do endpoint criado para gerenciamento da tabela submission, o acesso será feito diretamente ao model
- **backend/newsletter/process_event_filter.py**: Alteração em nomes de variaveis, inclusão da função para salvar status do processo no banco
- **backend/newsletter/migrations/0024_remove_submission_sent_date.py-backend/newsletter/migrations/0025_submission_sent_date.py-backend/newsletter/migrations/0026_remove_submission_subscription_id.py**: Reformatação do arquivo pelo sistema
- **backend/newsletter/models/submission.py-backend/newsletter/migrations/0023_auto_20241105_1400.py-backend/newsletter/migrations/0024_remove_submission_sent_date.py-backend/newsletter/migrations/0025_submission_sent_date.py-backend/newsletter/migrations/0026_remove_submission_subscription_id.py**: Alteração nos campos da tabela submission que não aceitavam valores null
- **backend/newsletter/process_event_filter.py-backend/newsletter/management/commands/execute_subscription_filter.py**: Inclusão de paramentros data e frequencia para rodar run_filter; limpeza de codigo e adição de comentarios
- **backend/newsletter/views/submission.py**: Criação do action para listagem dos pedidos de eventos processados
- **backend/coreAdmin/urls.py**: Criação do endpoint para submission
- **backend/newsletter/process_event_filter.py-backend/newsletter/management/commands/execute_subscription_filter.py-backend/newsletter/events_send_mail.py**: Separando a função que envia os email com os eventos para outro arquivo
- **backend/newsletter/process_event_filter.py-backend/newsletter/templates/results.html**: Montagem do link do evento no template html e no arquivo csv
- **backend/newsletter/management/commands/execute_subscription_filter.py**: Inclusao do argumento de escolha da função a ser disparada: run_filter, que roda os filtros ou send_mail, que envia os emails
- **backend/newsletter/process_event_filter.py**: Formatação do nome do arquivo csv gerado com os resultados. Inclusão da função que le os aruivos csv gerados. Imclusão da fu nção que le o conteudo dos arquivos csv e passa para a função que envia o email. Inclusão da verificação se o arquivo não foi gerado, enviar email com results_not_found
- **backend/newsletter/newsletter_send_mail.py**: Inclusao do context para o corpo do email na função que envia o email com os resultados. Inclusão da função que envia email quando nao há resultados encontrados
- **backend/newsletter/templates/results.html**: Inclusao das variaveis no template html do email com resultados
- **backend/newsletter/templates/results.html**: Inclusao das variaveis com os dados do csv no template html dos email com resultados
- **backend/newsletter/process_event_filter.py**: Incluida a função que dispara o envio dos emails com os eventos encontrados
- **backend/newsletter/management/commands/execute_subscription_filter.py**: Exclusão da função que dispara o envio dos emails, a função foi incluida no process_event_filter
- **backend/newsletter/templates/activate_subscription.html-backend/newsletter/templates/activation_confirm.html-backend/newsletter/templates/base.tpl-backend/newsletter/templates/email_base.tpl-backend/newsletter/templates/footer.html-backend/newsletter/templates/results.html-backend/newsletter/templates/results_not_found.html-backend/newsletter/templates/unsubscription_confirm.html-backend/newsletter/templates/welcome.html**: Alteração dos html templates comuns para o formato template django
- **backend/newsletter/management/commands/execute_subscription_filter.py**: Inclusão da execução da função que envia o email para o usuario com os resutados encontrados
- **backend/newsletter/newsletter_send_mail.py**: Inclusão da função que envia o email, com os resultados encontrados, para o usuario
- **backend/newsletter/views/submission.py**: Inclusao da função que salva os dados da submissao dos emails com resultados encontrados
- **backend/newsletter/management/commands/execute_subscription_filter.py-backend/newsletter/process_event_filter.py**: Alteração no periodo
- **frontend/src/services/api/Newsletter.js**: Inclusão dos filtros na função de atualizar o formulario
- **backend/newsletter/migrations/0022_eventfilter_closest_approach_uncertainty_in_km.py**: Correção do erro de tabela dupicada. Embora nao haja nada duplicado de fato. Foi utilizado o comando "docker compose exec backend python manage.py migrate newsletter 0022_eventfilter_closest_approach_uncertainty_in_km --fake"
- **backend/newsletter/migrations/0022_eventfilter_closest_approach_uncertainty_in_km.py**: Realização de makemigrations para o campo de incertezas
- **backend/newsletter/process_event_filter.py-frontend/src/components/Newsletter/AsteroidNameSelect.js-frontend/src/components/Newsletter/AsteroidSelect.js-frontend/src/services/api/Newsletter.js**: Alteração na chamada do filtro por object name
- **backend/newsletter/process_event_filter.py**: Alteração na função que roda as filtros selecionando o periodo
- **backend/newsletter/process_event_filter.py**: Formatação das colunas escritas no arquivo csv
- **backend/newsletter/process_event_filter.py**: Implementação da função que gera o arquivo csv com os resultados dos filtros
- **backend/newsletter/management/commands/execute_subscription_filter.py**: Correção da mensagem de help
- **frontend/src/components/Newsletter/FilterTypeSelect.js**: Remoção de arquivo não utilizado
- **backend/newsletter/process_event_filter.py**: Inclusao do filtro por data e loop para rodada porp periodo semanal ou mensal
- **backend/newsletter/migrations/0021_auto_20241014_2021.py**: Remoção de tabela fake duplicada
- **frontend/src/components/Newsletter/AsteroidNameSelect.js-frontend/src/components/Newsletter/AsteroidSelect.js-frontend/src/pages/PublicPortal/Newsletter/EventFilterForm.js-frontend/src/services/api/Newsletter.js**: Alteração no filtro por asteroid, ele busca o nome mas o value de object name está sendo passado como string vazia
- **backend/newsletter/admin.py**: Inclusao do campo description
- **frontend/src/services/api/Newsletter.js**: Inclusão dos demais filtros no service api
- **frontend/src/pages/PublicPortal/Newsletter/EventFilterForm.js**: Mundança do componente de magnitude limit e drop para um mesmo stack
- **backend/newsletter/migrations/0021_auto_20241014_2021.py**: Inclusao do campo de incertezas no banco e remoção dos campos de magnitude e magnitude_drop min
- **backend/newsletter/admin.py-backend/newsletter/migrations/0021_auto_20241014_2021.py-backend/newsletter/models/event_filter.py**: Inclusão do campo de incertezas no banco e  admin
- **frontend/src/components/ClosestApproachUncertaintyField/index.js-frontend/src/pages/PublicPortal/Newsletter/EventFilterForm.js**: Inclusão do componente de filtro por incertezas no formulario
- **frontend/src/components/AsteroidSelect/AsteroidSelect.js-frontend/src/components/AsteroidSelect/FilterTypeSelect.js-frontend/src/components/Newsletter/FilterTypeSelect.js-frontend/src/pages/PublicPortal/Newsletter/EventFilterForm.js-frontend/src/services/api/Newsletter.js**: Revisão do bug no filtro por asteroids e nomes
- **backend/newsletter/admin.py**: Inclusao do campo filter_value
- **backend/newsletter/process_event_filter.py**: Implementação dos filtros por local_solar_time, event_duration, diametro, magnitude, latitude e longitude
- **backend/newsletter/process_event_filter.py**: Inclusão do filtro por data
- **backend/newsletter/process_event_filter.py**: Inclusaõ dos demais filtros
- **backend/newsletter/process_event_filter.py**: Criacao da função que realiza os filtros de acordo com as opções salvas pelo usuario
- **backend/newsletter/management/commands/execute_subscription_filter.py**: Criação do comando para rodar manualmente as buscas das preferencias do filtro

## 4.0.3 (2024-09-04)

### Fix

- **occviz**: fix cases where curved paths generated false positive location passage (#1080)

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
