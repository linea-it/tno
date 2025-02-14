import re
import time

import pandas as pd
import psycopg2

# Configurações do banco de dados
DB_CONFIG = {
    "dbname": "postgres",
    "user": "postgres",
    "password": "postgres",
    "host": "database",
    "port": "5432",
}


def measure_query_performance(query, params=None, iterations=5):
    """
    Measures the performance of a query in PostgreSQL.
    :param query: SQL query to be executed.
    :param params: Query parameters (if any).
    :param iterations: Number of times the query will be executed.
    :return: Average execution time in seconds and average number of rows returned.
    """
    times = []
    row_counts = []

    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()

        for _ in range(iterations):
            start_time = time.time()
            cursor.execute(query, params if params else ())
            rows = cursor.fetchall()  # Ensures results are loaded
            elapsed_time = time.time() - start_time
            times.append(elapsed_time)
            row_counts.append(len(rows))

        cursor.close()
        conn.close()

    except Exception as e:
        print(f"Error executing query: {e}")
        return None, None

    avg_time = sum(times) / len(times)
    avg_rows = sum(row_counts) / len(row_counts) if row_counts else 0
    print(
        f"Average execution time: {avg_time:.5f} seconds, Rows returned: {avg_rows:.0f}"
    )
    return avg_time, avg_rows


def execute_explain_analyze(query, params=None):
    """
    Executes EXPLAIN ANALYZE for a query and extracts planning and execution time.
    :param query: SQL query to be analyzed.
    :param params: Query parameters (if any).
    :return: EXPLAIN ANALYZE output, planning time, and execution time.
    """
    explain_output = ""
    planning_time = None
    execution_time = None

    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute(f"EXPLAIN ANALYZE {query}", params if params else ())
        explain_result = cursor.fetchall()
        explain_output = "\n".join([row[0] for row in explain_result])

        # Extract planning and execution times using regex
        planning_match = re.search(
            r"Planning time: ([\d\.]+) ms", explain_output, re.IGNORECASE
        )
        execution_match = re.search(
            r"Execution time: ([\d\.]+) ms", explain_output, re.IGNORECASE
        )

        if planning_match:
            planning_time = float(planning_match.group(1))
        if execution_match:
            execution_time = float(execution_match.group(1))

        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Error executing EXPLAIN ANALYZE: {e}")

    return explain_output, planning_time, execution_time


def execute_query_sequence(
    queries, filename="query_performance_results.csv", iterations=5
):
    """
    Executes a sequence of queries and stores average execution times, row counts,
    planning time, execution time, and EXPLAIN ANALYZE output in a DataFrame.
    :param queries: List of dictionaries containing {'id': identifier, 'query': SQL}
    """
    results = []

    for query_info in queries:
        print(f"Executing query: {query_info['id']} - {query_info['query']}")
        avg_time, avg_rows = measure_query_performance(
            query_info["query"], query_info["params"], iterations
        )
        explain_output, planning_time, execution_time = execute_explain_analyze(
            query_info["query"]
        )
        results.append(
            {
                "id": query_info["id"],
                "query": query_info["query"],
                "avg_time": avg_time,
                "avg_rows": avg_rows,
                "planning_time_ms": planning_time,
                "execution_time_ms": execution_time,
                "explain_analyze": explain_output,
            }
        )

    df = pd.DataFrame(results)
    df.to_csv(filename, index=False)
    print("Results saved in query_performance_results.csv")
    print(df)
    return df


# Example usage:
queries = [
    # Queries de controle (sempre terao os parametros fixos)
    # ----------------------------------
    {
        "id": "count_records",
        "query": "select count(*) from tno_occultation",
        "params": (),
    },
    {
        "id": "count_by_dynclass",
        "query": "select count(*) from tno_occultation to2 where to2.base_dynclass = 'Trojan'",
        "params": (),
    },
    {
        "id": "by_date_range",
        "query": "select * from tno_occultation to2 where to2.date_time between '2025-02-13 00:00:00' and '2025-02-13 23:59:59'",
        "params": (),
    },
    {
        "id": "home_default",
        "query": "select * from tno_occultation to2 where (to2.date_time between '2025-02-14 00:54:03 + 00:00' and '2025-02-21 00:54:03 + 00:00' and to2.g_star <= 15.0 and to2.closest_approach_uncertainty_km <= 500.0 and ((to2.loc_t >= '18:00:00' and to2.loc_t <= '23:59:59') or (to2.loc_t >= '00:00:00' and to2.loc_t <= '06:00:00')) and to2.occ_path_is_nightside) order by to2.date_time asc",
        "params": (),
    },
    {
        "id": "home_default_paginated",
        "query": "select * from tno_occultation to2 where (to2.date_time between '2025-02-14 00:54:03 + 00:00' and '2025-02-21 00:54:03 + 00:00' and to2.g_star <= 15.0 and to2.closest_approach_uncertainty_km <= 500.0 and ((to2.loc_t >= '18:00:00' and to2.loc_t <= '23:59:59') or (to2.loc_t >= '00:00:00' and to2.loc_t <= '06:00:00')) and to2.occ_path_is_nightside) order by to2.date_time asc limit 25 offset 75",
        "params": (),
    },
    {
        "id": "home_all_filters",
        "query": "select * from tno_occultation to2 where (to2.date_time between '2025-02-14 00:54:03 + 00:00' and '2025-02-21 00:54:03 + 00:00' and UPPER(to2.base_dynclass::text) = UPPER('Trojan') and to2.g_star <= 15.0 and to2.magnitude_drop >= 3.0 and to2.diameter between 50.0 and 100.0 and to2.event_duration >= 1.0 and to2.closest_approach_uncertainty_km <= 500.0 and ((to2.loc_t >= '18:00:00' and to2.loc_t <= '23:59:59') or (to2.loc_t >= '00:00:00' and to2.loc_t <= '06:00:00')) and to2.occ_path_is_nightside) order by to2.date_time asc",
        "params": (),
    },
    # Queries por Periodos
    # ----------------------------------
    {
        "id": "by_date_range_1h",
        "query": "select * from tno_occultation to2 where to2.date_time between '2025-02-13 22:00:00' and '2025-02-13 23:00:00'",
        "params": (),
    },
    {
        "id": "by_date_range_1d",
        "query": "select * from tno_occultation to2 where to2.date_time between '2025-02-13 00:00:00' and '2025-02-13 23:59:59'",
        "params": (),
    },
    {
        "id": "by_date_range_1w",
        "query": "select * from tno_occultation to2 where to2.date_time between '2025-02-13 00:00:00' and '2025-02-20 23:59:59'",
        "params": (),
    },
    {
        "id": "by_date_range_1m",
        "query": "select * from tno_occultation to2 where to2.date_time between '2025-01-01 00:00:00' and '2025-01-31 23:59:59'",
        "params": (),
    },
]

df_results = execute_query_sequence(
    queries, filename="query_performance_results_after.csv", iterations=20
)


# Para obter uma estatística razoável sobre a performance das queries em uma tabela com 1.7 milhões de linhas, um bom valor para iterations dependerá de alguns fatores:

# Variação na Performance: Se a variação entre execuções for alta, mais repetições ajudam a obter uma média confiável.
# Tempo de Execução: Se as queries forem rápidas (<1s), um número maior de execuções (20-50) é viável. Se forem lentas (>5s), um valor menor (5-10) pode ser suficiente.
# Carga no Banco de Dados: Muitas execuções podem sobrecarregar o banco. Se for um ambiente de produção, escolha um número mais conservador.
# Recomendação:
# Para queries rápidas (<1s): 30-50 execuções
# Para queries medianas (1s - 5s): 10-20 execuções
# Para queries lentas (>5s): 5-10 execuções
# Se quiser um equilíbrio entre precisão e tempo de execução, 15 a 20 execuções é um bom ponto de partida. Você pode ajustar conforme os resultados.
