
import logging


class PraiaPipeline():
    def __init__(self):
        self.logger = logging.getLogger("astrometry")

    def run(self, run_id, asteroid):
        self.logger.debug("Teste")
