import os
from pathlib import Path

from parsl.channels import SSHChannel
from parsl.config import Config
from parsl.executors import HighThroughputExecutor
from parsl.launchers import SrunLauncher
from parsl.providers import LocalProvider, SlurmProvider


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

        # Cluster heterogêneo: 16 nós apl[01-16] (28 cores/nó), 12 nós apl[17-28] (52 cores/nó)
        # init_blocks/max_blocks sobrescritos em run_pred_occ.py (small=1 no início, large=0)
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
            "partition": "cpu_long",
            "nodes_per_block": 1,
            "cmd_timeout": 240,
            "launcher": SrunLauncher(debug=True, overrides=""),
            "parallelism": 1,
            "walltime": "240:00:00",
            "worker_init": f"source {cluster_env_sh}\n",
            "channel": channel,
        }
        # Parsl 2023.9.25: max_workers é total por executor (não por nó); 448=16*28, 624=12*52
        # cores_per_node: núcleos físicos por nó (apl01-16: 28, apl17-28: 52)
        htex_small = HighThroughputExecutor(
            label="linea_small",
            worker_logdir_root=str(script_dir),
            max_workers=448,
            provider=SlurmProvider(
                **provider_common,
                scheduler_options="#SBATCH --nodelist=apl[01-16]\n",
                cores_per_node=28,
                init_blocks=1,
                min_blocks=1,
                max_blocks=16,
            ),
        )
        htex_large = HighThroughputExecutor(
            label="linea_large",
            worker_logdir_root=str(script_dir),
            max_workers=624,
            provider=SlurmProvider(
                **provider_common,
                scheduler_options="#SBATCH --nodelist=apl[17-28]\n",
                cores_per_node=52,
                init_blocks=0,
                min_blocks=0,
                max_blocks=12,
            ),
        )
        executors = {
            "linea": [htex_small, htex_large],
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
