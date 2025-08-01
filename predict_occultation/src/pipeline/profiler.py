import os
import time
from functools import wraps

import pandas as pd
import psutil


class Profiler:
    """
    Uma classe para medir o tempo de execução e o uso de memória de funções
    e blocos de código em Python.
    """

    def __init__(self):
        self._process = psutil.Process(os.getpid())
        self.records = []

    def _get_memory_usage_mb(self) -> float:
        """Retorna o uso de memória RSS do processo atual em Megabytes."""
        return self._process.memory_info().rss / (1024 * 1024)

    def profile_func(self, func):
        """Decorador para medir o tempo e a memória de uma função."""

        @wraps(func)
        def wrapper(*args, **kwargs):
            mem_before = self._get_memory_usage_mb()
            start_time = time.perf_counter()
            result = func(*args, **kwargs)
            end_time = time.perf_counter()
            mem_after = self._get_memory_usage_mb()
            self.records.append(
                {
                    "Operação": f"FUNC: {func.__name__}",
                    "Duração (s)": end_time - start_time,
                    "Variação de Memória (MB)": mem_after - mem_before,
                    "Memória Final (MB)": mem_after,
                }
            )
            return result

        return wrapper

    def __call__(self, name: str):
        """Permite usar o profiler como um gerenciador de contexto."""
        return self.ProfileContext(self, name)

    def report(self):
        """Imprime um relatório tabular perfeitamente alinhado com as medições."""
        if not self.records:
            print("Nenhum dado de profiling foi coletado.")
            return

        df_report = pd.DataFrame(self.records)
        formatters = {
            "Duração (s)": "{: >15.4f}".format,
            "Variação de Memória (MB)": "{: >28.4f}".format,
            "Memória Final (MB)": "{: >22.2f}".format,
        }
        max_op_width = df_report["Operação"].str.len().max()
        if pd.isna(max_op_width):
            max_op_width = len("Operação")

        with pd.option_context("display.max_colwidth", int(max_op_width) + 2):
            print("\n" + "=" * 110)
            print("Relatório de Performance (Tempo e Memória)")
            print("=" * 110)
            print(
                df_report.to_string(index=False, justify="left", formatters=formatters)
            )
            print("=" * 110 + "\n")

    class ProfileContext:
        """Classe auxiliar para o gerenciador de contexto."""

        def __init__(self, profiler_instance, name: str):
            self.profiler = profiler_instance
            self.name = name

        def __enter__(self):
            self.mem_before = self.profiler._get_memory_usage_mb()
            self.start_time = time.perf_counter()

        def __exit__(self, type, value, traceback):
            self.end_time = time.perf_counter()
            self.mem_after = self.profiler._get_memory_usage_mb()
            self.profiler.records.append(
                {
                    "Operação": f"BLOCO: {self.name}",
                    "Duração (s)": self.end_time - self.start_time,
                    "Variação de Memória (MB)": self.mem_after - self.mem_before,
                    "Memória Final (MB)": self.mem_after,
                }
            )
