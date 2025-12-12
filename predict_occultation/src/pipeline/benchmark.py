"""
BENCHMARK MODULE - Easy Removal Instructions:
==============================================
To completely remove benchmarking:
1. Delete this file: predict_occultation/src/pipeline/benchmark.py
2. In occ_path_coeff.py, search for "# BENCHMARK" and remove all marked blocks
3. Run: grep -rn "BENCHMARK" predict_occultation/src/pipeline/ to find all references

To disable without removal:
- Pass enabled=False to Benchmark constructor (default: disabled)
- Or set debug=False in job configuration
- When disabled, all benchmark operations are no-ops (zero overhead)
"""

import json
import os
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Optional


class Benchmark:
    """
    Performance benchmarking utility for occ_path_coeff.py.

    When enabled=False, all operations are no-ops.
    Enable by passing enabled=True or by setting job debug=True.
    """

    def __init__(
        self,
        name: Optional[str] = None,
        path: Optional[str] = None,
        enabled: bool = False,
    ):
        # Enable via parameter (from job debug flag) or environment variable (fallback)
        self.enabled = enabled or os.getenv("BENCHMARK_ENABLED", "").lower() in (
            "1",
            "true",
            "yes",
        )
        self.name = name or "unknown"
        self.path = Path(path) if path else None
        self.sections: Dict[str, Dict] = {}
        self.current_section: Optional[str] = None
        self.start_time: Optional[datetime] = None
        self.total_start = datetime.now(tz=timezone.utc)
        self.row_counts: Dict[str, int] = {}
        self.timeouts: Dict[str, int] = {}
        self.errors: Dict[str, int] = {}

    @contextmanager
    def section(self, section_name: str, row_count: Optional[int] = None):
        """
        Context manager for timing a code section.

        Usage:
            with bm.section("my_operation", row_count=100):
                # code to benchmark
        """
        if not self.enabled:
            yield
            return

        start = datetime.now(tz=timezone.utc)
        self.current_section = section_name

        try:
            yield
        except Exception as e:
            # Track errors
            if section_name not in self.errors:
                self.errors[section_name] = 0
            self.errors[section_name] += 1
            raise
        finally:
            end = datetime.now(tz=timezone.utc)
            elapsed = (end - start).total_seconds()

            self.sections[section_name] = {
                "time_sec": elapsed,
                "rows": row_count,
                "timeouts": self.timeouts.get(section_name, 0),
                "errors": self.errors.get(section_name, 0),
            }

            if row_count and row_count > 0:
                self.sections[section_name]["avg_time_per_row_sec"] = (
                    elapsed / row_count
                )

            self.current_section = None

    def record_timeout(self, section_name: Optional[str] = None):
        """Record a timeout for the current or specified section."""
        if not self.enabled:
            return

        section = section_name or self.current_section
        if section:
            if section not in self.timeouts:
                self.timeouts[section] = 0
            self.timeouts[section] += 1

    def record_error(self, section_name: Optional[str] = None):
        """Record an error for the current or specified section."""
        if not self.enabled:
            return

        section = section_name or self.current_section
        if section:
            if section not in self.errors:
                self.errors[section] = 0
            self.errors[section] += 1

    def save(self, total_rows: Optional[int] = None):
        """
        Save benchmark results to JSON file.

        Args:
            total_rows: Total number of rows processed (for overall statistics)
        """
        if not self.enabled:
            return

        total_end = datetime.now(tz=timezone.utc)
        total_time = (total_end - self.total_start).total_seconds()

        results = {
            "asteroid_name": self.name,
            "total_rows": total_rows,
            "total_time_sec": total_time,
            "start_time": self.total_start.isoformat(),
            "end_time": total_end.isoformat(),
            "sections": self.sections,
        }

        # Save per-asteroid file
        if self.path:
            output_file = self.path / "benchmark_path_coeff.json"
            try:
                with open(output_file, "w") as f:
                    json.dump(results, f, indent=2)
            except Exception as e:
                # Don't fail the main process if benchmark save fails
                print(f"WARNING: Failed to save benchmark: {e}")

        return results
