from parsl.config import Config
from parsl.channels import LocalChannel
from parsl.executors import HighThroughputExecutor
from parsl.monitoring.monitoring import MonitoringHub
from parsl.providers import LocalProvider, CondorProvider
from parsl.channels import SSHChannel
from parsl.addresses import address_by_hostname, address_by_query

# TNO Database Settings
DB_NAME = 'tno_v2'
DB_USER = 'postgres'
DB_PASS = 'postgres'
DB_HOST = 'database'
DB_PORT = '5432'

# Email utilizado para baixar os BSP do JPL
JPL_EMAIL = 'glauber.vila.verde@gmail.com'

# Diretório Raiz onde estão os arquivos de catalog
DES_CATALOGS_BASEPATH = '/archive/des/public/catalogs'

# PARSL Config
htex_config = Config(
    executors=[
        HighThroughputExecutor(
            label="htex_local",
            cores_per_worker=1,
            max_workers=16,
            provider=LocalProvider(
                channel=LocalChannel(),
                worker_init=f"source /home/appuser/orbit_trace/env.sh",
            ),
        )
    ],
)

# condor_300_config = Config(
#     executors=[
#         HighThroughputExecutor(
#             label='htcondor',
#             address=address_by_query(),
#             max_workers=300,
#             cores_per_worker=1.2,
#             provider=CondorProvider(
#                 init_blocks=2,
#                 min_blocks=2,
#                 max_blocks=4,
#                 parallelism=1,
#                 scheduler_options='+RequiresWholeMachine = True',
#                 worker_init="source /archive/tmp/singulani/tno/orbit_trace/env.sh",
#                 cmd_timeout=120,
#                 channel=SSHChannel(
#                   hostname="loginicx",
#                   username="singulani",
#                   password="chelonia305595",
#                   script_dir="/archive/tmp/singulani/tno"
#                 )
#             )
#         )
#     ],
#     # monitoring=MonitoringHub(
#     #     hub_address=address_by_hostname(),
#     #     hub_port=55055,
#     #     monitoring_debug=True,
#     #     logging_endpoint=f"sqlite:////archive/tmp/singulani/tno/tno.db",
#     #     resource_monitoring_interval=10,
#     # ),
#     strategy=None,
#     run_dir='/archive/tmp/singulani/tno/'
# )

# condor_8_config = Config(
#     executors=[
#         HighThroughputExecutor(
#             label='htcondor',
#             address=address_by_query(),
#             max_workers=8,
#             cores_per_worker=1.2,
#             provider=CondorProvider(
#                 init_blocks=2,
#                 min_blocks=2,
#                 max_blocks=4,
#                 parallelism=1,
#                 scheduler_options='+RequiresWholeMachine = True',
#                 worker_init="source /archive/tmp/singulani/tno/orbit_trace/env.sh",
#                 cmd_timeout=120,
#                 channel=SSHChannel(
#                   hostname="loginicx",
#                   username="singulani",
#                   password="chelonia305595",
#                   script_dir="/archive/tmp/singulani/tno"
#                 )
#             )
#         )
#     ],
#     # monitoring=MonitoringHub(
#     #     hub_address=address_by_hostname(),
#     #     hub_port=55055,
#     #     monitoring_debug=True,
#     #     logging_endpoint=f"sqlite:////archive/tmp/singulani/tno/tno.db",
#     #     resource_monitoring_interval=10,
#     # ),
#     strategy=None,
#     run_dir='/archive/tmp/singulani/tno/'
# )
