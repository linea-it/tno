# from airflow.providers.http.hooks.http import HttpHook
from airflow.hooks.http_hook import HttpHook
import requests
from datetime import datetime, timedelta
import json


class SbdbHook(HttpHook):

    def __init__(self, query: str, conn_id: str = None):
        """_summary_

        Args:
            query (str): object search string: designation in various forms (including MPC packed form) or case-insensitive name; any provisional designation associated with the object may be used; examples: atira, 2003 CP20, 2003cp20, K03C20P, 163693;
            conn_id (str, optional): _description_. Defaults to None.
        """
        self.conn_id = conn_id or "sbdb_default"
        self.sstr = query

        super().__init__(http_conn_id=self.conn_id)

    def create_url(self):

        url_raw = f"{self.base_url}/sbdb.api?sstr={self.sstr}"

        return url_raw

    def connect_to_endpoint(self, url, session):
        request = requests.Request("GET", url)
        prep = session.prepare_request(request)
        self.log.info(f"URL: {url}")
        return self.run_and_check(session, prep, {})

    def run(self):
        session = self.get_conn()
        url_raw = self.create_url()
        response = self.connect_to_endpoint(url_raw, session)
        return response.json()


if __name__ == "__main__":

    query = "Chiron"

    data = SbdbHook(query).run()
    print(json.dumps(data, indent=4, sort_keys=True))
