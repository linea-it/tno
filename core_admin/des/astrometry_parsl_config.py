from parsl.config import Config
from parsl.channels import LocalChannel
from parsl.executors import HighThroughputExecutor
from parsl.providers import LocalProvider

htex_config = Config(
    executors=[
        HighThroughputExecutor(
            label="htex_local",
            cores_per_worker=1,
            max_workers=16,
            provider=LocalProvider(
                channel=LocalChannel(),
                # worker_init=f"source /home/glauber/linea/orbit_trace/env.sh",
            ),
        )
    ],
)
