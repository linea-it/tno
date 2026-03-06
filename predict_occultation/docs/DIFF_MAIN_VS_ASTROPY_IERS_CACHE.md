# Diferença main vs astropy-iers-cache: por que o problema de permissão não ocorre na main

## Resumo

Na **main**, o container do `predict_occultation` **não** faz downgrade de usuário: o comando do daemon roda com o mesmo usuário que inicia o container (em geral **root**, pois o `docker-compose.yml` usa `user: "0:0"`). Por isso, submit_worker, ingest_worker e complete_worker rodam como **root** e criam/escrevem nos diretórios do job como root — **não há conflito de permissão**.

Na branch **astropy-iers-cache**, o **entrypoint** passou a usar `runuser -u vscode` quando o processo inicia como root. O daemon (submit/ingest/complete) passa então a rodar como **vscode**. Se um job for criado por um processo **root** (por exemplo `docker compose exec` + `./rerun.sh`), os arquivos ficam como **root** e o ingest_worker/complete_worker (**vscode**) não conseguem escrever → **PermissionError** e jobs presos em Consolidating.

---

## Diferença crítica: entrypoint.sh

### Na main (sem runuser)

```bash
echo "Enviroment ${PARSL_ENV} is ready!"

exec "$@"
```

- O comando passado ao entrypoint (`daemon.sh`) é executado **com o mesmo usuário** do processo (root).
- Quem cria o diretório do job (submit_worker) e quem escreve no job (ingest_worker, complete_worker) são todos **root** → sem conflito.

### Na astropy-iers-cache (com runuser)

Introduzido no commit **84fe1ef0** (`feat(predict_occultation): require CACHE_DIR and run IERS cache warming with verification`):

```bash
echo "Enviroment ${PARSL_ENV} is ready!"

if [ "$(id -u)" = "0" ]; then
    exec runuser -u vscode -- "$@"
else
    exec "$@"
fi
```

- Se o container iniciar como root (uid 0), o daemon é executado como **vscode**.
- Objetivo provável: cache e diretórios de app pertencerem ao usuário vscode (ex.: uid 1000) para desenvolvimento e para que o cache criado no entrypoint (chown 1000:1000) seja gravável pelo daemon.
- Efeito colateral: qualquer execução que crie dados do job como **root** (por exemplo `docker compose exec ... bash -c "./rerun.sh 10"`) deixa arquivos/diretórios do job com dono root; o ingest_worker e o complete_worker (vscode) passam a falhar com PermissionError ao escrever nesses paths.

---

## Commits na astropy-iers-cache que alteram predict_occultation (vs main)

Lista dos commits que tocam `predict_occultation/` e que não estão na main:

```
f1d6c6a6 feat(predict_occultation): set Astropy cache env vars before importing Astropy...
84fe1ef0 feat(predict_occultation): require CACHE_DIR and run IERS cache warming with verification  ← runuser introduzido aqui
e417312d Revert "Add detailed benchmarking with per-section timing measurements"
1c541a82 Fix cache directory permission errors causing container exit
9a786bfa Fix Docker Compose permission errors and file removal during reruns
3ac5f655 Fix Parsl node allocation and add Cartopy cache warming
...
a0f5945d feat: Add cache warming script for Astropy IERS data
```

---

## Como reproduzir a diferença

1. **Main**
   - Build e run com a main.
   - `docker compose exec predict_occultation bash -c "cd /app/src && ./rerun.sh 10"`
   - Tudo roda como root; ingest e complete conseguem escrever no diretório do job → job completa.

2. **astropy-iers-cache**
   - Build e run com a branch astropy-iers-cache.
   - Mesmo comando: o **rerun** roda no `exec` como **root** e cria o job como root.
   - O **daemon** (ingest/complete) roda como **vscode** → PermissionError em arquivos do job (ex.: `Hidalgo.json`, `job_consolidated.csv`) → job fica em Consolidating.

---

## Diff mínimo (trecho relevante do entrypoint)

```diff
--- a/predict_occultation/entrypoint.sh (main)
+++ b/predict_occultation/entrypoint.sh (astropy-iers-cache)
@@ -147,4 +155,8 @@ fi

 echo "Enviroment ${PARSL_ENV} is ready!"

-exec "$@"
+if [ "$(id -u)" = "0" ]; then
+    exec runuser -u vscode -- "$@"
+else
+    exec "$@"
+fi
```

Esse bloco no final do `entrypoint.sh` é a diferença que faz o problema de permissão **não** ocorrer na main e **ocorrer** na astropy-iers-cache quando jobs são criados como root (por exemplo via `docker compose exec` + rerun).
