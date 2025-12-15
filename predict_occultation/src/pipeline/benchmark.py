# -*- coding: utf-8 -*-
"""
Benchmarking and Resource Monitoring Module

This module collects performance metrics after PRAIA and path_coeff execution:
- Catalog query timing
- Detailed path_coeff section timings
- System resource usage (CPU, memory, I/O)
- Task metadata

NOTE: This module is designed to be easily removable.
To remove: Delete this file and remove the import/call from predict_occ.py
"""

import json
import os
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional

try:
    import psutil
except ImportError:
    psutil = None


def get_system_metrics() -> Dict:
    """
    Collect current system resource usage metrics.

    Returns:
        Dictionary with CPU, memory, and I/O metrics
    """
    metrics = {
        "timestamp": datetime.now().isoformat(),
        "cpu_percent": 0.0,
        "cpu_count": 0,
        "memory_percent": 0.0,
        "memory_used_mb": 0.0,
        "memory_available_mb": 0.0,
        "disk_io_read_mb": 0.0,
        "disk_io_write_mb": 0.0,
        "disk_io_read_count": 0,
        "disk_io_write_count": 0,
    }

    if psutil is None:
        metrics["error"] = "psutil not available"
        return metrics

    try:
        # CPU metrics
        metrics["cpu_percent"] = psutil.cpu_percent(interval=1)
        metrics["cpu_count"] = psutil.cpu_count()

        # Memory metrics
        memory = psutil.virtual_memory()
        metrics["memory_percent"] = memory.percent
        metrics["memory_used_mb"] = memory.used / (1024 * 1024)
        metrics["memory_available_mb"] = memory.available / (1024 * 1024)

        # Disk I/O metrics
        disk_io = psutil.disk_io_counters()
        if disk_io:
            metrics["disk_io_read_mb"] = disk_io.read_bytes / (1024 * 1024)
            metrics["disk_io_write_mb"] = disk_io.write_bytes / (1024 * 1024)
            metrics["disk_io_read_count"] = disk_io.read_count
            metrics["disk_io_write_count"] = disk_io.write_count

    except Exception as e:
        metrics["error"] = str(e)

    return metrics


def collect_benchmark_data(
    data_dir: str,
    asteroid_name: str,
    task_id: Optional[int] = None,
    praia_start: Optional[datetime] = None,
    praia_finish: Optional[datetime] = None,
    praia_exec_time: Optional[float] = None,
    occultation_count: Optional[int] = None,
    path_coeff_start: Optional[datetime] = None,
    path_coeff_finish: Optional[datetime] = None,
    path_coeff_exec_time: Optional[float] = None,
    catalog_query_timing: Optional[Dict] = None,
    path_coeff_detailed_timings: Optional[Dict] = None,
) -> Dict:
    """
    Collect all benchmark data after PRAIA and path_coeff execution.

    Args:
        data_dir: Directory where praia_occ.log is located
        asteroid_name: Name of the asteroid being processed
        task_id: Task ID from database
        praia_start: PRAIA execution start time
        praia_finish: PRAIA execution finish time
        praia_exec_time: PRAIA execution time in seconds
        occultation_count: Number of occultations found
        path_coeff_start: Path coefficient calculation start time
        path_coeff_finish: Path coefficient calculation finish time
        path_coeff_exec_time: Path coefficient calculation time in seconds

    Returns:
        Dictionary with all benchmark data
    """
    benchmark_data = {
        "asteroid_name": asteroid_name,
        "task_id": task_id,
        "timestamp": datetime.now().isoformat(),
        "praia_start": praia_start.isoformat() if praia_start else None,
        "praia_finish": praia_finish.isoformat() if praia_finish else None,
        "praia_exec_time": praia_exec_time,
        "occultation_count": occultation_count,
        "path_coeff_start": path_coeff_start.isoformat() if path_coeff_start else None,
        "path_coeff_finish": (
            path_coeff_finish.isoformat() if path_coeff_finish else None
        ),
        "path_coeff_exec_time": path_coeff_exec_time,
    }

    # Add catalog query timing if available
    if catalog_query_timing:
        benchmark_data["catalog_query_timing"] = catalog_query_timing

    # Add detailed path_coeff timings if available
    if path_coeff_detailed_timings:
        benchmark_data["path_coeff_detailed_timings"] = path_coeff_detailed_timings

    # Collect system metrics
    system_metrics = get_system_metrics()
    benchmark_data["system_metrics"] = system_metrics

    return benchmark_data


def save_benchmark_results(benchmark_data: Dict, output_path: Path) -> None:
    """
    Save benchmark results to a JSON file.

    Args:
        benchmark_data: Dictionary with benchmark data
        output_path: Path where to save the JSON file
    """
    try:
        # Append to existing file if it exists, otherwise create new
        if output_path.exists():
            with open(output_path, "r", encoding="utf-8") as f:
                existing_data = json.load(f)
            if not isinstance(existing_data, list):
                existing_data = [existing_data]
            existing_data.append(benchmark_data)
            benchmark_data = existing_data
        else:
            benchmark_data = [benchmark_data]

        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(benchmark_data, f, indent=2, ensure_ascii=False)

    except Exception as e:
        # Don't fail if saving fails
        print(f"Warning: Failed to save benchmark data: {e}")


def run_benchmark(
    data_dir: str,
    asteroid_name: str,
    task_id: Optional[int] = None,
    praia_start: Optional[datetime] = None,
    praia_finish: Optional[datetime] = None,
    praia_exec_time: Optional[float] = None,
    occultation_count: Optional[int] = None,
    path_coeff_start: Optional[datetime] = None,
    path_coeff_finish: Optional[datetime] = None,
    path_coeff_exec_time: Optional[float] = None,
    catalog_query_timing: Optional[Dict] = None,
    path_coeff_detailed_timings: Optional[Dict] = None,
) -> None:
    """
    Main function to run benchmarking after PRAIA and path_coeff execution.

    This function collects all benchmark data and saves it to a file.
    Designed to be called after PRAIA and path_coeff complete.

    Args:
        data_dir: Directory where praia_occ.log is located
        asteroid_name: Name of the asteroid being processed
        task_id: Task ID from database
        praia_start: PRAIA execution start time
        praia_finish: PRAIA execution finish time
        praia_exec_time: PRAIA execution time in seconds
        occultation_count: Number of occultations found
        path_coeff_start: Path coefficient calculation start time
        path_coeff_finish: Path coefficient calculation finish time
        path_coeff_exec_time: Path coefficient calculation time in seconds
    """
    try:
        # Collect benchmark data
        benchmark_data = collect_benchmark_data(
            data_dir=data_dir,
            asteroid_name=asteroid_name,
            task_id=task_id,
            praia_start=praia_start,
            praia_finish=praia_finish,
            praia_exec_time=praia_exec_time,
            occultation_count=occultation_count,
            path_coeff_start=path_coeff_start,
            path_coeff_finish=path_coeff_finish,
            path_coeff_exec_time=path_coeff_exec_time,
            catalog_query_timing=catalog_query_timing,
            path_coeff_detailed_timings=path_coeff_detailed_timings,
        )

        # Save to file in the data directory
        output_path = Path(data_dir) / "benchmark_results.json"
        save_benchmark_results(benchmark_data, output_path)

    except Exception as e:
        # Don't fail the pipeline if benchmarking fails
        print(f"Warning: Benchmarking failed: {e}")
