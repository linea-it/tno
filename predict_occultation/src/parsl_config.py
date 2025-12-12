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

        # Env.sh que sera executado antes de iniciar as tasks no cluster
        cluster_env_sh = pipeline_pred_occ.joinpath("cluster.sh")

        # Script DIR dentro do diretorio do job
        script_dir = pipeline_root.joinpath("script_dir")
        script_dir.mkdir(parents=True, exist_ok=True)

        # Cluster scaling parameters (from .env)
        max_nodes = int(os.getenv("MAX_NODES", 20))
        max_workers_per_node = int(os.getenv("MAX_WORKERS_PER_NODE", 28))

        executors = {
            "linea": HighThroughputExecutor(
                label="linea",
                worker_logdir_root=str(script_dir),
                max_workers=max_workers_per_node,  # Limit concurrent workers per node to reduce I/O contention
                provider=SlurmProvider(
                    partition="cpu_long",
                    nodes_per_block=1,  # number of nodes
                    cmd_timeout=240,  # duration for which the provider will wait for a command to be invoked on a remote system
                    launcher=SrunLauncher(debug=True, overrides=""),
                    init_blocks=1,  # Overridden by run_pred_occ.py dynamically
                    min_blocks=1,
                    max_blocks=max_nodes,  # From MAX_NODES env var
                    parallelism=1,
                    walltime="240:00:00",
                    worker_init=f"source {cluster_env_sh}\n",
                    channel=SSHChannel(
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
                            "DB_CATALOG_URI": db_uri,
                            "DB_ADMIN_URI": admin_db_uri,
                            # Monitoring flags - set in .env to enable
                            "BENCHMARK_ENABLED": os.getenv("BENCHMARK_ENABLED", ""),
                            "RESOURCE_MONITOR": os.getenv("RESOURCE_MONITOR", ""),
                        },
                    ),
                ),
            )
        }

    if parsl_env == "local":
        # Build worker_init with monitoring env vars
        local_worker_init = "source /app/src/env.sh\n"
        if os.getenv("BENCHMARK_ENABLED"):
            local_worker_init += (
                f"export BENCHMARK_ENABLED={os.getenv('BENCHMARK_ENABLED')}\n"
            )
        if os.getenv("RESOURCE_MONITOR"):
            local_worker_init += (
                f"export RESOURCE_MONITOR={os.getenv('RESOURCE_MONITOR')}\n"
            )

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
                    worker_init=local_worker_init,
                ),
            ),
        }

    return Config(executors=[executors[key]], strategy=None)
