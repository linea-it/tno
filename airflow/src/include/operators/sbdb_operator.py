import json
from datetime import datetime
from pathlib import Path

from airflow.models import BaseOperator
from airflow.utils.decorators import apply_defaults
from include.hooks.sbdb_hook import SbdbHook


class SbdbOperator(BaseOperator):

    template_fields = ["query", "output_path"]

    @apply_defaults
    def __init__(self, query, output_path, *args, **kwargs):
        self.query = query
        self.output_path = output_path
        super().__init__(*args, **kwargs)

    def create_parent_folder(self, file_path):
        (Path(file_path).parent).mkdir(parents=True, exist_ok=True)

    def execute(self, context):
        self.log.info("Executing Sbdb Operator")
        self.log.info(f"Query: {self.query}")

        query = self.query
        data = SbdbHook(query).run()
        self.log.info(data)

        spkid = data["object"]["spkid"]
        self.log.info(f"SPKID: {spkid}")

        file_path = Path(self.output_path).joinpath(f"{spkid}.json")

        self.create_parent_folder(file_path)

        with open(file_path, "w") as output_file:
            data = SbdbHook(query).run()
            json.dump(data, output_file, ensure_ascii=False)
            output_file.write("\n")

        self.log.info(f"File Path: {file_path}")


if __name__ == "__main__":

    import json
    from datetime import datetime

    from airflow.models import DAG, BaseOperator, TaskInstance

    query = "Chiron"
    DATALAKE = Path("/opt/airflow/datalake")
    with DAG(dag_id="SbdbTest", start_date=datetime.now()) as dag:
        to = SbdbOperator(
            extract_path=DATALAKE.joinpath(
                "sbdb",
                "extract",
            ),
            query=query,
            task_id="test_sbdb_run",
        )
        ti = TaskInstance(task=to)
        to.execute(ti.task_id)
