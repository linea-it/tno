# Relatório de Investigação: run.py / rerun e ingestão de resultados

**Data:** 2026-03-06
**Objetivo:** Entender por que o fluxo após alterações no Fortran PRAIA não completa com sucesso, incluindo ingestão no banco, e identificar pontos onde o processamento trava em 'Consolidating' ou em 'success' sem ingestão completa.
**Escopo:** Investigação apenas; sem alteração de código.

---

## 1. Resumo executivo

- **run.py por asteroide** (invocado via `run.sh` dentro de cada task Parsl): **conclui com sucesso**. O pipeline PRAIA, path coeff e consolidação de ocultações rodam e a task é atualizada para status **6 (Ingesting)**.
- **O que não completa** é a **fase de ingestão e finalização do job**: o **ingest_worker** falha ao criar o arquivo de log no diretório do job por **PermissionError**, então as tasks permanecem em status 6, o **complete_worker** nunca considera o job “pronto para completar” e o job fica indefinidamente em **Consolidating** sem ingestão no banco.
- **rerun.sh** executa apenas **run_job** (submit_tasks). Não chama **ingest_predictions** nem **complete_job**; em ambiente normal isso depende dos workers do daemon. Com o erro de permissão, mesmo o daemon não consegue concluir a ingestão.

**Causa raiz identificada:** criação do arquivo `ingest_predictions.log` no diretório do job por `ingest_predictions()` via `get_logger()`. O diretório do job foi criado como **root** (ex.: ao rodar `docker compose exec ... ./rerun.sh 10`), enquanto o **daemon** roda como usuário **vscode** (uid 1000). Sem permissão de escrita no diretório, o ingest_worker falha sempre que tenta processar esse job.

---

## 2. Fluxo executado no teste

Passos realizados conforme solicitado:

1. `docker compose exec predict_occultation bash`
2. `cd src`
3. `./rerun.sh 10`

**Resultado do rerun:** o script terminou em ~24 s com as mensagens “Job Processing Completed - Waiting for consolidation.” e “Job Processing Done.”
Ou seja: **submit_tasks** retornou; o job foi deixado em **Consolidating** e as tasks em **6 (Ingesting)**. Nenhum erro foi exibido no stdout do rerun.

---

## 3. Arquitetura de fluxo e status

### 3.1 Componentes

| Componente | Função |
|-----------|--------|
| **run.py** (raiz) | Entrypoint por objeto: recebe nome, datas, path; chama `pipeline.predict_occ.main()`. |
| **run.sh** | Por asteroide: cria `DIR_DATA` temporário, chama `run.py`, remove `DIR_DATA`. |
| **run_pred_occ.run_job(jobid)** | Cria path do job, escreve `job.json`, chama **submit_tasks(jobid)**. |
| **submit_tasks(jobid)** | Busca asteroides, submete uma task Parsl (run.sh + run.py) por asteroide, espera todas terminarem, marca job como **Consolidating**, em **finally** chama **update_job(job)** e retorna. **Não** chama ingest nem complete. |
| **ingest_worker** (daemon) | A cada ~30 s: **get_job_running()** (status 2 ou 8); se houver job, chama **ingest_predictions(jobid)**. |
| **ingest_predictions(jobid)** | Para todas as tasks do job com status **6**: carrega Asteroid, chama **ingest_predictions** no objeto, **consiladate()**, atualiza task no DB (status 1/2). Depende de **get_logger(current_path, "ingest_predictions.log")** → cria arquivo no diretório do job. |
| **complete_worker** (daemon) | A cada ~30 s: **get_job_to_complete()** (job status 8 e **nenhuma** task em 4 ou 6); se houver, chama **complete_job(jobid)**. |
| **complete_job(jobid)** | Consolida resultados em CSV, atualiza job (status **Completed**, contagens, tempos), opcionalmente remove diretório de asteroides. |

### 3.2 Status do job (tno_predictionjob)

- 1 = Idle
- 2 = Running
- 3 = Completed
- 4 = Failed
- 5 = Aborted
- 6 = Warning
- 7 = Aborting
- 8 = Consolidating

### 3.3 Status da task (tno_predictionjobresult)

- 3 = Queued
- 4 = Running
- 6 = Ingesting (aguardando ingest + consolidação)
- 1 = Success
- 2 = Failed

### 3.4 Sequência esperada

1. submit_tasks: job → **Running (2)**; tasks → **Queued (3)** → (Parsl) **Running (4)**.
2. Por task: `predict_occ.main` no finally atualiza task para **6 (Ingesting)**.
3. submit_tasks: quando todas as tasks Parsl terminam, job → **Consolidating (8)**; **update_job** no finally persiste no DB.
4. ingest_worker: para job em 2 ou 8, chama **ingest_predictions**; para cada task em 6, ingere no DB e atualiza task para **1** ou **2**.
5. complete_worker: quando job está em 8 e não há tasks em 4 ou 6, chama **complete_job**; job → **Completed (3)**.

---

## 4. Onde o fluxo trava e por quê

### 4.1 Travamento em “Consolidating” sem ingestão

- **Condição:** Job em status **8 (Consolidating)**, tasks em **6 (Ingesting)**.
- **Causa observada:** **ingest_predictions** falha ao abrir `ingest_predictions.log` no diretório do job:
  - `get_logger(current_path, "ingest_predictions.log", ...)` → `logging.FileHandler(logfile)`.
  - Diretório do job pertencente a **root** (ex.: criado por `docker compose exec`), daemon rodando como **vscode**.
  - **PermissionError: [Errno 13] Permission denied: '.../10/ingest_predictions.log'**.
- **Efeito:** ingest_worker falha a cada ciclo; tasks continuam em 6; **get_job_to_complete()** exige “nenhuma task em 4 ou 6”, então **complete_job** nunca é chamado. O job permanece em Consolidating sem ingestão no banco.

### 4.2 “Success” sem ingestão completa

- Se em algum cenário o job for exibido ou tratado como “success” (ex.: apenas por ter saído de Running e ido para Consolidating), mas **ingest_predictions** nunca rodar com sucesso (por permissão ou outro erro), as predições **não** são ingeridas no banco e as tasks não passam de 6 para 1/2. Ou seja: sucesso aparente sem conclusão real da ingestão.

### 4.3 rerun.sh não faz ingest nem complete

- **rerun.sh** apenas chama **rerun_job(jobid)** → **run_job(jobid)** → **submit_tasks(jobid)**.
- **submit_tasks** no **finally** não chama **consolidate_job_results** nem **complete_job** (estão comentados).
- Para um “run completo” até Completed com ingestão, é necessário que, após o rerun, **ingest_worker** e **complete_worker** rodem com sucesso (no daemon). Com o PermissionError no ingest, isso não ocorre para o job 10 no ambiente testado.

---

## 5. Evidências do teste (job 10)

- **Diretório do job:** `/app/outputs/predict_occultations/10/` — dono **root:root**.
- **ingest_worker.log:** múltiplas ocorrências de:
  - `[Ingest Worker] Job running: [10]`
  - `Ingest Predictions for job: 10`
  - `PermissionError: [Errno 13] Permission denied: '/app/outputs/predict_occultations/10/ingest_predictions.log'`
- **complete_worker.log:** apenas “Running” a cada ciclo; nunca “Job to complete: [10]”, pois sempre existe task em status 6.
- **Pipeline por asteroide (Hidalgo):** Hidalgo.out mostra PRAIA OCC, path coeff, “Consolidating Occultations”, “Processing finished, updating task status to 6-ingesting”, “Task status updated”, “Predict Occultation Done”. Arquivos gerados (ex.: `g4_occ_data_JOHNSTON_2018_table`, `occultation_table.csv`) presentes no diretório do asteroide.

---

## 6. Alterações no Fortran PRAIA

- No repositório há mudanças em **PRAIA_occ_star_search_12.f** (e versão .old), incluindo novo arquivo de saída CSV (output 89), formato de C/A e cabeçalho.
- No teste, o pipeline que usa o arquivo **table** (g4_occ_data_JOHNSTON_2018_table), **fix_table** e **ascii_to_csv** (skiprows=41) **rodou até o fim** para Hidalgo e gerou CSV e tabela de ocultação. Ou seja, **nesta execução** o “run.py não completar” **não** foi causado por mudança no formato de saída do PRAIA; o gargalo está na fase de ingestão (permissão no diretório do job).

---

## 7. Status e tratamento de erros (pontos para garantir conclusão e evitar travamentos)

- **Consolidating:** O job só sai do status 8 quando **complete_job** é executado. **complete_job** só é chamado pelo complete_worker quando não há tasks em 4 ou 6. Se **ingest_predictions** falhar sempre (ex.: permissão), o job fica preso em Consolidating.
- **Ingestão:** Qualquer falha em **ingest_predictions** (ex.: PermissionError no get_logger) não é tratada de forma a marcar o job/task como falha explícita; o worker apenas registra exceção e segue; as tasks permanecem em 6.
- **complete_worker:** Não há timeout ou critério alternativo para “forçar” conclusão de um job que está há muito tempo em Consolidating com tasks em 6; o desenho atual depende de ingest_worker concluir com sucesso.
- **rerun em um único processo:** Para que “./rerun.sh 10” represente um run completo até ingestão e Completed, seria necessário que o mesmo fluxo chamasse **ingest_predictions(10)** e **complete_job(10)** após **run_job(10)** (ou equivalente), ou que o ambiente garanta que o daemon consiga escrever no diretório do job (mesmo usuário ou permissões adequadas).

---

## 8. Conclusões

1. **run.py** (por asteroide) está completando; o problema não é o Fortran PRAIA nesta execução, e sim a **fase de ingestão e finalização do job**.
2. **Causa raiz do travamento:** **PermissionError** ao criar **ingest_predictions.log** no diretório do job (dono root vs daemon vscode).
3. **Efeito em cadeia:** ingest_worker falha → tasks ficam em 6 → complete_worker nunca chama complete_job → job permanece em Consolidating sem ingestão no banco.
4. **rerun.sh** por si só não executa ingest nem complete; em ambiente com daemon, a conclusão depende dos workers; com o erro de permissão, a conclusão não ocorre.
5. Para evitar “success” sem ingestão e travamentos em Consolidating, é importante:
   - Garantir permissões (ou identidade do processo) de forma que o ingest_worker consiga escrever no diretório do job (ou que o logger não dependa desse path).
   - Assegurar que falhas em **ingest_predictions** sejam refletidas em status (job/task) e/ou logs de forma que não fique indefinidamente “Consolidating” sem ação.
   - Se desejado, que um “rerun completo” (até Completed com ingestão) inclua explicitamente ingest e complete no mesmo fluxo ou que o ambiente (ownership/permissões) permita ao daemon concluir após o rerun.

---

## 9. Arquivos e trechos relevantes (referência)

- **run_pred_occ.py:** `get_job_running()` (status 2 ou 8), `get_job_to_complete()` (status 8 e sem tasks 4/6), `ingest_predictions()` (get_logger em `current_path`), `submit_tasks()` (finally com update_job, sem ingest/complete).
- **ingest_worker.py:** chama `get_job_running()` e `ingest_predictions(running_id)`.
- **complete_worker.py:** chama `get_job_to_complete()` e `complete_job(to_complete)`.
- **daemon.sh:** inicia submit_worker, ingest_worker e complete_worker em loops.
- **entrypoint.sh:** se uid=0, executa comando final com `runuser -u vscode`, então o daemon roda como vscode.
- **predict_occ.py:** no finally da task, atualiza task para status 6 (Ingesting).

Investigação encerrada sem alteração de código, conforme solicitado.
