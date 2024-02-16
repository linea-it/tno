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
        pipeline_root = os.getenv("REMOTE_PIPELINE_ROOT", None)
        if not pipeline_root:
            raise Exception(
                "It is necessary to configure the REMOTE_PIPELINE_ROOT variable when PARSL_ENV=linea"
            )

        pipeline_root = Path(pipeline_root)
        condapath = pipeline_root.joinpath("miniconda/bin")
        pipeline_pred_occ = pipeline_root.joinpath("predict_occultation")
        pipeline_path = pipeline_root.joinpath("predict_occultation/pipeline")

        # Diretório de Outputs
        predict_outputs = os.getenv("PREDICT_OUTPUTS", None)
        if not predict_outputs:
            raise Exception(
                "It is necessary to configure the PREDICT_OUTPUTS variable when PARSL_ENV=linea"
            )
        predict_outputs = Path(predict_outputs)
        predict_outputs.mkdir(parents=True, exist_ok=True)

        #  Linea SSH user keys
        # sshkey = os.getenv("SSHKEY", "~/.ssh/id_rsa")
        sshkey = os.getenv("SSHKEY", None)
        if not sshkey:
            raise Exception(
                "It is necessary to configure the SSHKEY variable when PARSL_ENV=linea"
            )

        # Linea DB prod_gavo DB uri. Catalog DB.
        db_uri = os.getenv("DB_URI", None)
        if not db_uri:
            raise Exception(
                "It is necessary to configure the DB_URI variable when PARSL_ENV=linea"
            )

        # Env.sh que sera executado antes de iniciar as tasks no cluster
        cluster_env_sh = pipeline_pred_occ.joinpath("cluster.sh")

        # Script DIR dentro do diretorio do job
        script_dir = pipeline_root.joinpath("script_dir")
        script_dir.mkdir(parents=True, exist_ok=True)

        executors = {
            "linea": HighThroughputExecutor(
                label="linea",
                worker_logdir_root=str(script_dir),
                provider=SlurmProvider(
                    partition="cpu",
                    nodes_per_block=2,  # number of nodes
                    cmd_timeout=240,  # duration for which the provider will wait for a command to be invoked on a remote system
                    launcher=SrunLauncher(debug=True, overrides=""),
                    init_blocks=2,
                    min_blocks=3,
                    max_blocks=12,
                    parallelism=1,
                    walltime="15:00:00",
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
                            "DB_URI": db_uri,
                        },
                    ),
                ),
            )
        }

    if parsl_env == "local":
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

    return Config(executors=[executors[key]], strategy=None)
