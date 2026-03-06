# Lista de commits sugeridos (astropy-iers-cache-novopraia)

Ordem sugerida para aplicar as alterações em commits lógicos e revisáveis.

---

## 1. fix(predict_occultation): fallback do logger para /tmp em PermissionError

**Arquivos:** `predict_occultation/src/run_pred_occ.py`

**Descrição:** Em `get_logger()`, ao falhar a abertura do arquivo de log no diretório do job (PermissionError quando o daemon roda como vscode e o job foi criado como root), usar fallback para `/tmp/<filename>` e registrar aviso no stdout. Evita que o ingest_worker falhe indefinidamente e deixe o job preso em Consolidating.

```bash
git add predict_occultation/src/run_pred_occ.py
git commit -m "fix(predict_occultation): fallback do logger para /tmp em PermissionError"
```

---

## 2. fix(predict_occultation): executar comando do entrypoint sem runuser

**Arquivos:** `predict_occultation/entrypoint.sh`

**Descrição:** Remover o bloco que, quando uid=0, executa o comando com `runuser -u vscode`. Passa a usar `exec "$@"` sempre, alinhado ao comportamento da main. Assim, submit_worker, ingest_worker e complete_worker rodam com o mesmo usuário que criou os diretórios do job, eliminando PermissionError ao escrever no job (ex.: ao rodar `docker compose exec ... ./rerun.sh 10`).

```bash
git add predict_occultation/entrypoint.sh
git commit -m "fix(predict_occultation): executar comando do entrypoint sem runuser"
```

---

## 3. fix(predict_occultation): env.sh – PARSL_ENV e PYTHONPATH com valor padrão

**Arquivos:** `predict_occultation/src/env.sh`

**Descrição:** Usar `${PARSL_ENV:-not set}` e `${PYTHONPATH:-}` para evitar variáveis vazias ou não definidas em mensagens e no export.

```bash
git add predict_occultation/src/env.sh
git commit -m "fix(predict_occultation): env.sh – PARSL_ENV e PYTHONPATH com valor padrão"
```

---

## 4. refactor(predict_occultation): PRAIA – saída Gaia DR3 e ajustes no fix_table

**Arquivos:**
- `predict_occultation/praia_occ_src/PRAIA_occ_star_search_12.f`
- `predict_occultation/src/pipeline/search_candidates.py`

**Descrição:** Atualizar o Fortran PRAIA (formato de saída, unidade 89, C/A, cabeçalho) e o `fix_table()` em `search_candidates.py`: texto "Gaia DR1" → "Gaia DR3" e remoção do fix das colunas a partir da linha 41 (posições 169/173).

**Nota:** Decidir se o binário compilado `PRAIA_occ_star_search_12` e o backup `PRAIA_occ_star_search_12.f.old` entram no repositório. Se não, adicione ao `.gitignore` (ex.: `predict_occultation/praia_occ_src/PRAIA_occ_star_search_12`, `*.f.old`) e não os inclua neste commit.

```bash
git add predict_occultation/praia_occ_src/PRAIA_occ_star_search_12.f
git add predict_occultation/src/pipeline/search_candidates.py
# Opcional: git add predict_occultation/praia_occ_src/PRAIA_occ_star_search_12
# Opcional: git add predict_occultation/praia_occ_src/PRAIA_occ_star_search_12.f.old
git commit -m "refactor(predict_occultation): PRAIA – saída Gaia DR3 e ajustes no fix_table"
```

---

## 5. docs(predict_occultation): documentação de investigação e diff main vs branch

**Arquivos:**
- `predict_occultation/docs/DIFF_MAIN_VS_ASTROPY_IERS_CACHE.md`
- `predict_occultation/docs/INVESTIGATION_RERUN_AND_INGESTION_2025-03-06.md`

**Descrição:** Incluir documentação que explica a diferença main vs astropy-iers-cache (runuser e permissões) e o relatório de investigação do fluxo rerun/ingestão e travamento em Consolidating.

```bash
git add predict_occultation/docs/DIFF_MAIN_VS_ASTROPY_IERS_CACHE.md
git add predict_occultation/docs/INVESTIGATION_RERUN_AND_INGESTION_2025-03-06.md
git commit -m "docs(predict_occultation): documentação de investigação e diff main vs branch"
```

---

## Resumo da ordem

| # | Tipo     | Resumo                                                                 |
|---|----------|------------------------------------------------------------------------|
| 1 | fix      | get_logger com fallback para /tmp em PermissionError                   |
| 2 | fix      | entrypoint sem runuser                                                |
| 3 | fix      | env.sh – PARSL_ENV e PYTHONPATH com valor padrão                      |
| 4 | refactor | PRAIA Gaia DR3 + fix_table                                            |
| 5 | docs     | Documentação investigação e diff main vs branch                        |

Para aplicar tudo a partir de um working tree já modificado (com arquivos staged): desfaça o stage (`git reset HEAD`), depois aplique cada commit conforme os blocos acima, na ordem 1 → 5.
