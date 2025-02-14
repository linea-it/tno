import matplotlib.pyplot as plt
import pandas as pd


def compare_query_results(csv_before, csv_after):
    """
    Compares two CSV files containing query performance results.
    :param csv_before: Path to the first CSV (before table changes).
    :param csv_after: Path to the second CSV (after table changes).
    :return: DataFrame with execution time comparison.
    """
    df_before = pd.read_csv(csv_before)
    df_after = pd.read_csv(csv_after)

    comparison = df_before.merge(df_after, on="id", suffixes=("_before", "_after"))

    # Compare execution times
    comparison["time_difference"] = (
        comparison["avg_time_before"] - comparison["avg_time_after"]
    )
    comparison["time_percentage_change"] = (
        comparison["time_difference"] / comparison["avg_time_before"]
    ) * 100

    # Compare planning times
    comparison["planning_time_difference"] = (
        comparison["planning_time_ms_before"] - comparison["planning_time_ms_after"]
    )
    comparison["planning_time_percentage_change"] = (
        comparison["planning_time_difference"] / comparison["planning_time_ms_before"]
    ) * 100

    # Compare execution times from EXPLAIN ANALYZE
    comparison["execution_time_difference"] = (
        comparison["execution_time_ms_before"] - comparison["execution_time_ms_after"]
    )
    comparison["execution_time_percentage_change"] = (
        comparison["execution_time_difference"] / comparison["execution_time_ms_before"]
    ) * 100

    comparison["performance_change"] = comparison["time_difference"].apply(
        lambda x: "Improved" if x > 0 else "Worsened" if x < 0 else "Unchanged"
    )

    print("Performance Comparison:")
    print(
        comparison[
            [
                "id",
                "avg_time_before",
                "avg_time_after",
                "time_difference",
                "time_percentage_change",
                "planning_time_ms_before",
                "planning_time_ms_after",
                "planning_time_difference",
                "planning_time_percentage_change",
                "execution_time_ms_before",
                "execution_time_ms_after",
                "execution_time_difference",
                "execution_time_percentage_change",
                "performance_change",
            ]
        ]
    )

    comparison.to_csv("query_performance_comparison.csv", index=False)
    print("Comparison results saved to query_performance_comparison.csv")

    # Create comparison charts in a single window
    fig, axes = plt.subplots(3, 1, figsize=(12, 18))

    # Execution time comparison
    axes[0].bar(
        comparison["id"],
        comparison["time_percentage_change"],
        color=["green" if x > 0 else "red" for x in comparison["time_difference"]],
    )
    axes[0].axhline(0, color="black", linewidth=1, linestyle="dashed")
    axes[0].set_xlabel("Query ID")
    axes[0].set_ylabel("Execution Time Percentage Change (%)")
    axes[0].set_title("Query Execution Time Analysis")
    axes[0].tick_params(axis="x", rotation=45)

    # Planning time comparison
    axes[1].bar(
        comparison["id"],
        comparison["planning_time_percentage_change"],
        color=[
            "green" if x > 0 else "red" for x in comparison["planning_time_difference"]
        ],
    )
    axes[1].axhline(0, color="black", linewidth=1, linestyle="dashed")
    axes[1].set_xlabel("Query ID")
    axes[1].set_ylabel("Planning Time Percentage Change (%)")
    axes[1].set_title("Query Planning Time Analysis")
    axes[1].tick_params(axis="x", rotation=45)

    # Execution time from EXPLAIN ANALYZE comparison
    axes[2].bar(
        comparison["id"],
        comparison["execution_time_percentage_change"],
        color=[
            "green" if x > 0 else "red" for x in comparison["execution_time_difference"]
        ],
    )
    axes[2].axhline(0, color="black", linewidth=1, linestyle="dashed")
    axes[2].set_xlabel("Query ID")
    axes[2].set_ylabel("Execution Time (EXPLAIN ANALYZE) Percentage Change (%)")
    axes[2].set_title("Query Execution Time (EXPLAIN ANALYZE) Analysis")
    axes[2].tick_params(axis="x", rotation=45)

    plt.tight_layout()
    plt.savefig("query_performance_analysis.png")
    print("Chart saved as query_performance_analysis.png")
    plt.show()

    return comparison


# Example usage:
csv_before = "query_performance_results_before.csv"
csv_after = "query_performance_results_after.csv"
comparison_results = compare_query_results(csv_before, csv_after)


# import matplotlib.pyplot as plt
# import pandas as pd


# def compare_query_results(csv_before, csv_after):
#     """
#     Compares two CSV files containing query performance results.
#     :param csv_before: Path to the first CSV (before table changes).
#     :param csv_after: Path to the second CSV (after table changes).
#     :return: DataFrame with execution time comparison.
#     """
#     df_before = pd.read_csv(csv_before)
#     df_after = pd.read_csv(csv_after)

#     comparison = df_before.merge(df_after, on="id", suffixes=("_before", "_after"))

#     # Compare execution times
#     comparison["time_difference"] = (
#         comparison["avg_time_before"] - comparison["avg_time_after"]
#     )
#     comparison["time_percentage_change"] = (
#         comparison["time_difference"] / comparison["avg_time_before"]
#     ) * 100

#     # Compare planning times
#     comparison["planning_time_difference"] = (
#         comparison["planning_time_ms_before"] - comparison["planning_time_ms_after"]
#     )
#     comparison["planning_time_percentage_change"] = (
#         comparison["planning_time_difference"] / comparison["planning_time_ms_before"]
#     ) * 100

#     # Compare execution times from EXPLAIN ANALYZE
#     comparison["execution_time_difference"] = (
#         comparison["execution_time_ms_before"] - comparison["execution_time_ms_after"]
#     )
#     comparison["execution_time_percentage_change"] = (
#         comparison["execution_time_difference"] / comparison["execution_time_ms_before"]
#     ) * 100

#     comparison["performance_change"] = comparison["time_difference"].apply(
#         lambda x: "Improved" if x > 0 else "Worsened" if x < 0 else "Unchanged"
#     )

#     print("Performance Comparison:")
#     print(
#         comparison[
#             [
#                 "id",
#                 "avg_time_before",
#                 "avg_time_after",
#                 "time_difference",
#                 "time_percentage_change",
#                 "planning_time_ms_before",
#                 "planning_time_ms_after",
#                 "planning_time_difference",
#                 "planning_time_percentage_change",
#                 "execution_time_ms_before",
#                 "execution_time_ms_after",
#                 "execution_time_difference",
#                 "execution_time_percentage_change",
#                 "performance_change",
#             ]
#         ]
#     )

#     comparison.to_csv("query_performance_comparison.csv", index=False)
#     print("Comparison results saved to query_performance_comparison.csv")

#     # Create comparison chart for execution time
#     plt.figure(figsize=(10, 6))
#     plt.bar(
#         comparison["id"],
#         comparison["time_percentage_change"],
#         color=["green" if x > 0 else "red" for x in comparison["time_difference"]],
#     )
#     plt.axhline(0, color="black", linewidth=1, linestyle="dashed")
#     plt.xlabel("Query ID")
#     plt.ylabel("Execution Time Percentage Change (%)")
#     plt.title("Query Execution Time Analysis")
#     plt.xticks(rotation=45, ha="right")
#     plt.tight_layout()
#     plt.savefig("query_execution_time_analysis.png")
#     print("Chart saved as query_execution_time_analysis.png")
#     plt.show()

#     # Create comparison chart for planning time
#     plt.figure(figsize=(10, 6))
#     plt.bar(
#         comparison["id"],
#         comparison["planning_time_percentage_change"],
#         color=[
#             "green" if x > 0 else "red" for x in comparison["planning_time_difference"]
#         ],
#     )
#     plt.axhline(0, color="black", linewidth=1, linestyle="dashed")
#     plt.xlabel("Query ID")
#     plt.ylabel("Planning Time Percentage Change (%)")
#     plt.title("Query Planning Time Analysis")
#     plt.xticks(rotation=45, ha="right")
#     plt.tight_layout()
#     plt.savefig("query_planning_time_analysis.png")
#     print("Chart saved as query_planning_time_analysis.png")
#     plt.show()

#     # Create comparison chart for execution time from EXPLAIN ANALYZE
#     plt.figure(figsize=(10, 6))
#     plt.bar(
#         comparison["id"],
#         comparison["execution_time_percentage_change"],
#         color=[
#             "green" if x > 0 else "red" for x in comparison["execution_time_difference"]
#         ],
#     )
#     plt.axhline(0, color="black", linewidth=1, linestyle="dashed")
#     plt.xlabel("Query ID")
#     plt.ylabel("Execution Time (EXPLAIN ANALYZE) Percentage Change (%)")
#     plt.title("Query Execution Time (EXPLAIN ANALYZE) Analysis")
#     plt.xticks(rotation=45, ha="right")
#     plt.tight_layout()
#     plt.savefig("query_explain_execution_time_analysis.png")
#     print("Chart saved as query_explain_execution_time_analysis.png")
#     plt.show()

#     return comparison


# # Example usage:
# csv_before = "query_performance_results_before.csv"
# csv_after = "query_performance_results_after.csv"
# comparison_results = compare_query_results(csv_before, csv_after)
