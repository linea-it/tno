import os
from pathlib import Path

from parsl.channels import SSHChannel
from parsl.config import Config
from parsl.executors import HighThroughputExecutor
from parsl.launchers import SrunLauncher
from parsl.providers import LocalProvider, SlurmProvider


def _env_int_min_zero(name, default):
    """Lê int não-negativo (mínimo 0) para max_blocks e cores_per_node (executores linea).
    Valor 0 desabilita o executor correspondente."""
    try:
        v = int(os.getenv(name, str(default)).strip() or str(default))
    except (ValueError, TypeError):
        v = default
    return max(0, v)


def get_config(key, jobpath):
    """
    Creates an instance of the Parsl configuration

    Args:
        key (str): The key of the configuration to be returned.
            Options are: 'local' or 'linea'.

    Returns:
        config: Parsl config instance.
    """

    parsl_env = os.getenv("PARSL_ENV", "local")

    if parsl_env == "linea":
        # Check Linea PATH envs
        pipeline_root = Path(os.getenv("REMOTE_PIPELINE_ROOT"))
        condapath = Path(os.getenv("REMOTE_CONDA_PATH"))
        pipeline_pred_occ = Path(os.getenv("PIPELINE_PREDIC_OCC"))
        pipeline_path = Path(os.getenv("PIPELINE_PATH"))
        # Diretório de Outputs
        predict_outputs = Path(os.getenv("PREDICT_OUTPUTS"))
        predict_outputs.mkdir(parents=True, exist_ok=True)
        # Diretório de Inputs
        predict_inputs = Path(os.getenv("PREDICT_INPUTS"))
        # Linea SSH user keys
        sshkey = os.getenv("SSHKEY")
        # Linea DB prod_gavo DB uri. Catalog DB.
        db_uri = os.getenv("DB_CATALOG_URI")
        # Linea DB portal admin
        admin_db_uri = os.getenv("DB_ADMIN_URI")

        # Meta 1.2: Diretório de cache compartilhado no Lustre
        cache_dir = pipeline_root / "data" / "cache"
        astropy_cache_dir = cache_dir / "astropy"

        # CRITICAL: Verify cache exists before configuring Parsl
        # Cache must be warmed in entrypoint.sh before any jobs are submitted
        if not astropy_cache_dir.exists():
            raise RuntimeError(
                f"IERS cache directory does not exist: {astropy_cache_dir}\n"
                "Cache warming must be executed in entrypoint.sh before Parsl is configured.\n"
                "Workers on cluster have no internet access and require pre-warmed cache."
            )

        # Verify IERS cache file exists (typically > 1MB)
        # CRITICAL: This check prevents Parsl from being configured if cache is missing
        download_dir = astropy_cache_dir / "download"
        if download_dir.exists():
            # Look for large files (>1MB) - IERS files are typically large
            cache_files = list(download_dir.rglob("*"))
            large_files = [
                f for f in cache_files if f.is_file() and f.stat().st_size > 1000000
            ]
            if not large_files:
                raise RuntimeError(
                    f"IERS cache file not found in {download_dir}\n"
                    "Cache warming must be executed in entrypoint.sh before Parsl is configured.\n"
                    "Workers on cluster have no internet access and require pre-warmed cache."
                )
        else:
            raise RuntimeError(
                f"Cache download directory does not exist: {download_dir}\n"
                "Cache warming must be executed in entrypoint.sh before Parsl is configured.\n"
                "Workers on cluster have no internet access and require pre-warmed cache."
            )

        # Env.sh que sera executado antes de iniciar as tasks no cluster
        cluster_env_sh = pipeline_pred_occ.joinpath("cluster.sh")

        # Script DIR dentro do diretorio do job
        script_dir = pipeline_root.joinpath("script_dir")
        script_dir.mkdir(parents=True, exist_ok=True)

        # Cluster heterogêneo: até 16 nós apl[01-16], 12 nós apl[17-28] (ajustável por env)
        # max_blocks: default 1 se PARSL_LINEA_SMALL_MAX_BLOCKS / PARSL_LINEA_LARGE_MAX_BLOCKS omitidos
        # cores_per_node: PARSL_LINEA_SMALL_CORES_PER_NODE (28), PARSL_LINEA_LARGE_CORES_PER_NODE (52)
        # Use 0 para desabilitar um executor específico (útil quando a partição Slurm não cobre certos nós)
        linea_small_max_blocks = _env_int_min_zero("PARSL_LINEA_SMALL_MAX_BLOCKS", 1)
        linea_large_max_blocks = _env_int_min_zero("PARSL_LINEA_LARGE_MAX_BLOCKS", 1)
        linea_small_cores_per_node = _env_int_min_zero(
            "PARSL_LINEA_SMALL_CORES_PER_NODE", 28
        )
        linea_large_cores_per_node = _env_int_min_zero(
            "PARSL_LINEA_LARGE_CORES_PER_NODE", 52
        )
        linea_small_max_workers = linea_small_max_blocks * linea_small_cores_per_node
        linea_large_max_workers = linea_large_max_blocks * linea_large_cores_per_node
        # Slurm --partition (SlurmProvider); default cpu se omitido ou vazio
        slurm_partition = os.getenv("PARSL_SLURM_PARTITION", "cpu").strip() or "cpu"
        # Slurm --account (SlurmProvider); default hpc-public se omitido ou vazio
        slurm_account = (
            os.getenv("PARSL_SLURM_ACCOUNT", "hpc-public").strip() or "hpc-public"
        )
        # Slurm --time / walltime (SlurmProvider); default 12:00:00 se omitido ou vazio
        slurm_walltime = (
            os.getenv("PARSL_SLURM_WALLTIME", "12:00:00").strip() or "12:00:00"
        )
        channel = SSHChannel(
            hostname="loginapl01",
            username="app.tno",
            key_filename=sshkey,
            script_dir=str(script_dir),
            envs={
                "PARSL_ENV": "linea",
                "CONDAPATH": str(condapath),
                "PIPELINE_PREDIC_OCC": str(pipeline_pred_occ),
                "PIPELINE_PATH": str(pipeline_path),
                "PYTHONPATH": ":".join(
                    [
                        str(pipeline_root),
                        str(pipeline_pred_occ),
                        str(pipeline_path),
                    ]
                ),
                "PREDICT_OUTPUTS": str(predict_outputs),
                "PREDICT_INPUTS": str(predict_inputs),
                "CACHE_DIR": str(cache_dir),
                "XDG_CACHE_HOME": str(cache_dir),
                "ASTROPY_CACHE_DIR": str(cache_dir / "astropy"),
                "DB_CATALOG_URI": db_uri,
                "DB_ADMIN_URI": admin_db_uri,
            },
        )
        provider_common = {
            "partition": slurm_partition,
            "account": slurm_account,
            "nodes_per_block": 1,
            "cmd_timeout": 240,
            "launcher": SrunLauncher(debug=True, overrides=""),
            "parallelism": 1,
            "walltime": slurm_walltime,
            "worker_init": f"source {cluster_env_sh}\n",
            "channel": channel,
        }
        # Parsl: max_workers = max_blocks * cores_per_node (1 nó por bloco)
        # Executor só é criado se max_blocks > 0 E cores_per_node > 0
        # Isso permite desabilitar um executor definindo seus valores como 0 no .env
        linea_executors = []
        if linea_small_max_blocks > 0 and linea_small_cores_per_node > 0:
            htex_small = HighThroughputExecutor(
                label="linea_small",
                worker_logdir_root=str(script_dir),
                max_workers=linea_small_max_workers,
                provider=SlurmProvider(
                    **provider_common,
                    scheduler_options="#SBATCH --nodelist=apl[01-16]\n",
                    cores_per_node=linea_small_cores_per_node,
                    init_blocks=1,
                    min_blocks=1,
                    max_blocks=linea_small_max_blocks,
                ),
            )
            linea_executors.append(htex_small)
        if linea_large_max_blocks > 0 and linea_large_cores_per_node > 0:
            htex_large = HighThroughputExecutor(
                label="linea_large",
                worker_logdir_root=str(script_dir),
                max_workers=linea_large_max_workers,
                provider=SlurmProvider(
                    **provider_common,
                    scheduler_options="#SBATCH --nodelist=apl[17-28]\n",
                    cores_per_node=linea_large_cores_per_node,
                    init_blocks=0,
                    min_blocks=0,
                    max_blocks=linea_large_max_blocks,
                ),
            )
            linea_executors.append(htex_large)
        if not linea_executors:
            raise RuntimeError(
                "No LineA executors configured. "
                "At least one of PARSL_LINEA_SMALL_MAX_BLOCKS or PARSL_LINEA_LARGE_MAX_BLOCKS "
                "must be > 0 with corresponding CORES_PER_NODE > 0."
            )
        executors = {
            "linea": linea_executors,
        }

    if parsl_env == "local":
        # Para ambiente 'local' - cache dentro do container
        cache_dir = Path("/app/cache")
        # NÃO criar diretório aqui - já deve existir do warming

        executors = {
            "local": HighThroughputExecutor(
                label="local",
                worker_debug=False,
                max_workers=4,
                provider=LocalProvider(
                    min_blocks=1,
                    init_blocks=1,
                    max_blocks=1,
                    parallelism=1,
                    worker_init=f"source /app/src/env.sh\n",
                ),
            ),
        }

    # strategy='simple': scaling dinâmico entre init_blocks e max_blocks conforme fila de tarefas
    executor_list = (
        executors[key] if isinstance(executors[key], list) else [executors[key]]
    )
    return Config(executors=executor_list, strategy="simple")
