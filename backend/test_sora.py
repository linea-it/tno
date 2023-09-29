# Exemplo de execução do SORA com valores reais.
from sora.prediction.occmap import plot_occ_map as occmap
occmap("Chiron", 0, "00 47 31.2926+06 50 46.320", "2023-02-27T08:36:40Z", 0.215, 159.27, 29.66, 19.6, 19.1, 131.0, dpi=50, nameimg='teste_cache', path="/tmp", fmt='jpg')