import os
import time
from functools import wraps
from typing import Optional  # <--- ADICIONADO: Importação para compatibilidade

import pandas as pd
import psutil


class Profiler:
    """
    Uma classe para medir o tempo de execução, uso de memória e métricas da CPU
    (uso, temperatura e frequência) de funções e blocos de código em Python.
    """

    def __init__(self):
        """Inicializa o profiler."""
        self._process = psutil.Process(os.getpid())
        self.records = []
        # Inicializa a medição de uso da CPU para obter valores mais precisos
        psutil.cpu_percent(interval=None)

    def _get_memory_usage_mb(self) -> float:
        """Retorna o uso de memória RSS do processo atual em Megabytes."""
        return self._process.memory_info().rss / (1024 * 1024)

    # CORRIGIDO: Alterado 'float | None' para 'Optional[float]'
    def _get_cpu_temperature_c(self) -> Optional[float]:
        """
        Retorna a temperatura da CPU em Celsius.
        Retorna None se a informação não estiver disponível.
        Nota: Pode não funcionar em todos os sistemas operacionais ou necessitar de privilégios.
        """
        try:
            # psutil.sensors_temperatures() retorna um dicionário, ex: {'coretemp': [...]}
            if hasattr(psutil, "sensors_temperatures"):
                temps = psutil.sensors_temperatures()
                if temps:
                    # Pega a primeira entrada de temperatura disponível (geralmente a principal)
                    for name, entries in temps.items():
                        for entry in entries:
                            return entry.current
        except Exception:
            # Falha silenciosamente se não for possível obter a temperatura
            pass
        return None

    # CORRIGIDO: Alterado 'float | None' para 'Optional[float]'
    def _get_cpu_frequency_mhz(self) -> Optional[float]:
        """
        Retorna a frequência atual da CPU em Megahertz.
        Retorna None se a informação não estiver disponível.
        """
        try:
            if hasattr(psutil, "cpu_freq"):
                freq = psutil.cpu_freq()
                if freq:
                    return freq.current
        except Exception:
            # Falha silenciosamente se não for possível obter a frequência
            pass
        return None

    def profile_func(self, func):
        """Decorador para medir tempo, memória e métricas de CPU de uma função."""

        @wraps(func)
        def wrapper(*args, **kwargs):
            # Preparação
            mem_before = self._get_memory_usage_mb()
            psutil.cpu_percent(interval=None)  # Zera a contagem para o intervalo
            start_time = time.perf_counter()

            # Execução
            result = func(*args, **kwargs)

            # Coleta de métricas após a execução
            end_time = time.perf_counter()
            mem_after = self._get_memory_usage_mb()
            cpu_usage = psutil.cpu_percent(interval=None)
            temp_after = self._get_cpu_temperature_c()
            freq_after = self._get_cpu_frequency_mhz()

            self.records.append(
                {
                    "Operação": f"FUNC: {func.__name__}",
                    "Duração (s)": end_time - start_time,
                    "Uso de CPU (%)": cpu_usage,
                    "Variação de Memória (MB)": mem_after - mem_before,
                    "Memória Final (MB)": mem_after,
                    "Temp. Final (°C)": temp_after,
                    "Freq. Final (MHz)": freq_after,
                }
            )
            return result

        return wrapper

    def __call__(self, name: str):
        """Permite usar o profiler como um gerenciador de contexto."""
        return self.ProfileContext(self, name)

    def report(self):
        """Imprime um relatório tabular perfeitamente alinhado com todas as medições."""
        if not self.records:
            print("Nenhum dado de profiling foi coletado.")
            return

        df_report = pd.DataFrame(self.records)

        # Funções de formatação que lidam com valores Nulos (N/A)
        formatters = {
            "Duração (s)": lambda x: f"{x: >15.4f}",
            "Uso de CPU (%)": lambda x: (
                f"{x: >18.2f}" if pd.notna(x) else "N/A".rjust(18)
            ),
            "Variação de Memória (MB)": lambda x: f"{x: >28.4f}",
            "Memória Final (MB)": lambda x: f"{x: >22.2f}",
            "Temp. Final (°C)": lambda x: (
                f"{x: >20.1f}" if pd.notna(x) else "N/A".rjust(20)
            ),
            "Freq. Final (MHz)": lambda x: (
                f"{x: >22.0f}" if pd.notna(x) else "N/A".rjust(22)
            ),
        }

        max_op_width = df_report["Operação"].str.len().max()
        if pd.isna(max_op_width):
            max_op_width = len("Operação")

        header = "Relatório de Performance (Tempo, CPU e Memória)"
        total_width = 160

        with pd.option_context("display.max_colwidth", int(max_op_width) + 2):
            print("\n" + "=" * total_width)
            print(header.center(total_width))
            print("=" * total_width)
            print(
                df_report.to_string(index=False, justify="left", formatters=formatters)
            )
            print("=" * total_width + "\n")

    def sub_report(self):
        """Imprime um sub-relatório tabular simples com todas as medições."""
        if not self.records:
            print("Nenhum dado de profiling foi coletado.")
            return
        df_report = pd.DataFrame(self.records)
        with pd.option_context("display.max_colwidth", None, "display.width", 200):
            print("-" * 150)
            print("Sub-relatório de Performance")
            # Arredonda as colunas para melhor visualização
            for col in [
                "Duração (s)",
                "Variação de Memória (MB)",
                "Memória Final (MB)",
            ]:
                if col in df_report.columns:
                    df_report[col] = df_report[col].round(4)
            print(df_report.to_string(index=False, justify="left"))
            print("-" * 150 + "\n")

    class ProfileContext:
        """Classe auxiliar para o gerenciador de contexto."""

        def __init__(self, profiler_instance, name: str):
            self.profiler = profiler_instance
            self.name = name

        def __enter__(self):
            self.mem_before = self.profiler._get_memory_usage_mb()
            psutil.cpu_percent(interval=None)  # Zera a contagem para o intervalo
            self.start_time = time.perf_counter()
            return self

        def __exit__(self, type, value, traceback):
            # Coleta de métricas após a execução
            self.end_time = time.perf_counter()
            self.mem_after = self.profiler._get_memory_usage_mb()
            cpu_usage = psutil.cpu_percent(interval=None)
            temp_after = self.profiler._get_cpu_temperature_c()
            freq_after = self.profiler._get_cpu_frequency_mhz()

            self.profiler.records.append(
                {
                    "Operação": f"BLOCO: {self.name}",
                    "Duração (s)": self.end_time - self.start_time,
                    "Uso de CPU (%)": cpu_usage,
                    "Variação de Memória (MB)": self.mem_after - self.mem_before,
                    "Memória Final (MB)": self.mem_after,
                    "Temp. Final (°C)": temp_after,
                    "Freq. Final (MHz)": freq_after,
                }
            )
