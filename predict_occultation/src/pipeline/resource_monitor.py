# resource_monitor.py
# Resource monitoring for diagnosing cluster performance issues
#
# REMOVAL: Delete this file and remove imports/calls from occ_path_coeff.py
#
# Usage:
#   Set environment variable RESOURCE_MONITOR=1 to enable
#   Results are saved to resource_monitor.json in the asteroid's path

import json
import os
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

# Try to import psutil for detailed metrics
try:
    import psutil

    HAS_PSUTIL = True
except ImportError:
    HAS_PSUTIL = False


class ResourceMonitor:
    """
    Monitor system resources during processing to diagnose performance issues.

    Tracks:
    - CPU usage (per-process and system-wide)
    - Memory usage (RSS, available, swap)
    - I/O operations (read/write bytes and counts)
    - Open file handles
    - Timing for each section
    """

    def __init__(self, name: str, path: Path):
        """
        Initialize the resource monitor.

        Parameters
        ----------
        name : str
            Identifier for this monitoring session (e.g., asteroid name)
        path : Path
            Directory to save the monitoring results
        """
        self.enabled = os.environ.get("RESOURCE_MONITOR") == "1"
        self.name = name
        self.path = Path(path) if path else None
        self.samples = []
        self.sections = {}
        self.start_time = None
        self.process = None

        if self.enabled and HAS_PSUTIL:
            self.process = psutil.Process()
            self.start_time = datetime.now(tz=timezone.utc)
            self._sample("init")

    def _get_system_metrics(self) -> dict:
        """Get current system-wide metrics."""
        if not HAS_PSUTIL:
            return {}

        try:
            mem = psutil.virtual_memory()
            swap = psutil.swap_memory()
            cpu_percent = psutil.cpu_percent(interval=None)

            # Get load average (Unix only)
            try:
                load_avg = os.getloadavg()
            except (OSError, AttributeError):
                load_avg = (0, 0, 0)

            return {
                "cpu_percent_system": cpu_percent,
                "load_avg_1m": load_avg[0],
                "load_avg_5m": load_avg[1],
                "load_avg_15m": load_avg[2],
                "mem_available_gb": mem.available / (1024**3),
                "mem_used_percent": mem.percent,
                "swap_used_gb": swap.used / (1024**3),
                "swap_percent": swap.percent,
            }
        except Exception:
            return {}

    def _get_process_metrics(self) -> dict:
        """Get current process-specific metrics."""
        if not HAS_PSUTIL or not self.process:
            return {}

        try:
            # CPU and memory
            cpu_percent = self.process.cpu_percent()
            mem_info = self.process.memory_info()

            # I/O counters (may not be available on all systems)
            try:
                io = self.process.io_counters()
                io_metrics = {
                    "io_read_bytes_mb": io.read_bytes / (1024**2),
                    "io_write_bytes_mb": io.write_bytes / (1024**2),
                    "io_read_count": io.read_count,
                    "io_write_count": io.write_count,
                }
            except (psutil.AccessDenied, AttributeError):
                io_metrics = {}

            # Open files count
            try:
                open_files = len(self.process.open_files())
            except (psutil.AccessDenied, psutil.NoSuchProcess):
                open_files = -1

            # Thread count
            try:
                num_threads = self.process.num_threads()
            except (psutil.AccessDenied, psutil.NoSuchProcess):
                num_threads = -1

            return {
                "cpu_percent_process": cpu_percent,
                "mem_rss_mb": mem_info.rss / (1024**2),
                "mem_vms_mb": mem_info.vms / (1024**2),
                "open_files": open_files,
                "num_threads": num_threads,
                **io_metrics,
            }
        except Exception:
            return {}

    def _sample(self, label: str):
        """Take a resource sample with the given label."""
        if not self.enabled:
            return

        sample = {
            "timestamp": datetime.now(tz=timezone.utc).isoformat(),
            "elapsed_sec": (
                (datetime.now(tz=timezone.utc) - self.start_time).total_seconds()
                if self.start_time
                else 0
            ),
            "label": label,
            **self._get_system_metrics(),
            **self._get_process_metrics(),
        }
        self.samples.append(sample)

    def section_start(self, section_name: str):
        """
        Mark the start of a processing section.

        Parameters
        ----------
        section_name : str
            Name of the section being started
        """
        if not self.enabled:
            return

        self._sample(f"{section_name}_start")
        self.sections[section_name] = {
            "start_time": time.perf_counter(),
            "start_io": self._get_io_snapshot(),
        }

    def section_end(self, section_name: str, row_count: int = None):
        """
        Mark the end of a processing section.

        Parameters
        ----------
        section_name : str
            Name of the section being ended
        row_count : int, optional
            Number of rows processed in this section
        """
        if not self.enabled:
            return

        self._sample(f"{section_name}_end")

        if section_name in self.sections:
            section = self.sections[section_name]
            section["end_time"] = time.perf_counter()
            section["duration_sec"] = section["end_time"] - section["start_time"]
            section["row_count"] = row_count

            # Calculate I/O delta
            end_io = self._get_io_snapshot()
            if section.get("start_io") and end_io:
                section["io_read_mb"] = (
                    end_io.get("read_bytes", 0)
                    - section["start_io"].get("read_bytes", 0)
                ) / (1024**2)
                section["io_write_mb"] = (
                    end_io.get("write_bytes", 0)
                    - section["start_io"].get("write_bytes", 0)
                ) / (1024**2)
                section["io_read_ops"] = end_io.get("read_count", 0) - section[
                    "start_io"
                ].get("read_count", 0)
                section["io_write_ops"] = end_io.get("write_count", 0) - section[
                    "start_io"
                ].get("write_count", 0)

            # Clean up temp data
            section.pop("start_io", None)
            section.pop("start_time", None)
            section.pop("end_time", None)

    def _get_io_snapshot(self) -> Optional[dict]:
        """Get current I/O counters snapshot."""
        if not HAS_PSUTIL or not self.process:
            return None
        try:
            io = self.process.io_counters()
            return {
                "read_bytes": io.read_bytes,
                "write_bytes": io.write_bytes,
                "read_count": io.read_count,
                "write_count": io.write_count,
            }
        except (psutil.AccessDenied, AttributeError):
            return None

    def save(self):
        """Save monitoring results to JSON file."""
        if not self.enabled or not self.path:
            return

        end_time = datetime.now(tz=timezone.utc)
        total_duration = (
            (end_time - self.start_time).total_seconds() if self.start_time else 0
        )

        # Final sample
        self._sample("finish")

        # Calculate summary statistics
        summary = {
            "asteroid_name": self.name,
            "start_time": self.start_time.isoformat() if self.start_time else None,
            "end_time": end_time.isoformat(),
            "total_duration_sec": total_duration,
            "psutil_available": HAS_PSUTIL,
            "hostname": os.uname().nodename if hasattr(os, "uname") else "unknown",
            "pid": os.getpid(),
        }

        # Add peak metrics from samples
        if self.samples:
            cpu_samples = [
                s.get("cpu_percent_process", 0)
                for s in self.samples
                if s.get("cpu_percent_process")
            ]
            mem_samples = [
                s.get("mem_rss_mb", 0) for s in self.samples if s.get("mem_rss_mb")
            ]
            io_read = [
                s.get("io_read_bytes_mb", 0)
                for s in self.samples
                if s.get("io_read_bytes_mb")
            ]

            if cpu_samples:
                summary["peak_cpu_percent"] = max(cpu_samples)
                summary["avg_cpu_percent"] = sum(cpu_samples) / len(cpu_samples)
            if mem_samples:
                summary["peak_mem_rss_mb"] = max(mem_samples)
            if io_read:
                summary["total_io_read_mb"] = max(io_read)  # Cumulative, so max = total

        # Identify potential bottlenecks
        bottlenecks = []

        # Check for low CPU usage (I/O bound indicator)
        if summary.get("avg_cpu_percent", 100) < 10:
            bottlenecks.append("LOW_CPU_USAGE: Process is I/O bound or waiting")

        # Check for high swap usage
        swap_samples = [
            s.get("swap_percent", 0) for s in self.samples if "swap_percent" in s
        ]
        if swap_samples and max(swap_samples) > 20:
            bottlenecks.append(f"HIGH_SWAP_USAGE: {max(swap_samples):.1f}% swap used")

        # Check for memory pressure
        mem_avail = [
            s.get("mem_available_gb", 999)
            for s in self.samples
            if "mem_available_gb" in s
        ]
        if mem_avail and min(mem_avail) < 2:
            bottlenecks.append(
                f"LOW_AVAILABLE_MEMORY: {min(mem_avail):.1f}GB available"
            )

        # Check for high load average (more processes than CPUs)
        load_samples = [
            s.get("load_avg_1m", 0) for s in self.samples if "load_avg_1m" in s
        ]
        if load_samples and max(load_samples) > 50:  # Assuming typical cluster node
            bottlenecks.append(f"HIGH_LOAD_AVERAGE: {max(load_samples):.1f}")

        summary["potential_bottlenecks"] = bottlenecks

        # Output data
        output = {
            "summary": summary,
            "sections": self.sections,
            "samples": self.samples,
        }

        try:
            output_file = self.path / "resource_monitor.json"
            with open(output_file, "w") as f:
                json.dump(output, f, indent=2)
        except Exception as e:
            print(f"WARNING: Failed to save resource monitor: {e}")


class NoOpResourceMonitor:
    """No-op implementation when monitoring is disabled."""

    def __init__(self, *args, **kwargs):
        pass

    def section_start(self, *args, **kwargs):
        pass

    def section_end(self, *args, **kwargs):
        pass

    def save(self, *args, **kwargs):
        pass


def get_resource_monitor(name: str, path: Path) -> ResourceMonitor:
    """
    Factory function to get the appropriate monitor.

    Returns ResourceMonitor if RESOURCE_MONITOR=1, otherwise NoOpResourceMonitor.
    """
    if os.environ.get("RESOURCE_MONITOR") == "1":
        return ResourceMonitor(name, path)
    return NoOpResourceMonitor(name, path)
