#!/usr/bin/env python3
"""
Measure map generation timing for different DPI/resolution settings.
"""

import os
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

# Set CARTOPY_DATA_DIR
cache_dir = os.getenv("CACHE_DIR", "/app/cache")
os.environ["CARTOPY_DATA_DIR"] = f"{cache_dir}/cartopy"

# Setup Django
sys.path.insert(0, str(Path(__file__).parent))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "coreAdmin.settings")
import django

django.setup()

from django.conf import settings
from tno.prediction_map import sora_occultation_map

# Test data from job 19
test_data = {
    "name": "2007 DK",
    "diameter": 0.376,
    "ra_star_candidate": "01 55 58.1234",
    "dec_star_candidate": "+18 42 15.678",
    "date_time": datetime(2025, 12, 27, 11, 39, 43, tzinfo=timezone.utc),
    "closest_approach": 0.63,
    "position_angle": 186.04,
    "velocity": 7.62,
    "delta": 0.97,
    "g": 17.43,
    "long": 262.0,
    "error": 20.27,
}

# Test different DPI settings
dpi_settings = [
    (150, 2, "API default (150 DPI, resolution 2)"),
    (200, 2, "Standard (200 DPI, resolution 2)"),
    (300, 2, "High res (300 DPI, resolution 2)"),
    (150, 3, "API default DPI, high resolution (3)"),
    (200, 3, "Standard DPI, high resolution (3)"),
]

print("=" * 70)
print("Map Generation Timing Test")
print("=" * 70)

results = []

for dpi, resolution, description in dpi_settings:
    print(f"\nTesting: {description}")
    test_file = settings.SORA_MAP_DIR / f"test_timing_{dpi}_{resolution}.png"
    test_file.parent.mkdir(parents=True, exist_ok=True)

    # Clean up old test file
    if test_file.exists():
        test_file.unlink()

    try:
        start_time = time.time()
        sora_occultation_map(
            filepath=str(test_file), dpi=dpi, resolution=resolution, **test_data
        )
        elapsed = time.time() - start_time

        if test_file.exists():
            file_size = test_file.stat().st_size
            results.append(
                {
                    "dpi": dpi,
                    "resolution": resolution,
                    "description": description,
                    "time": elapsed,
                    "size_kb": file_size / 1024,
                }
            )
            print(f"  ✓ Generated in {elapsed:.2f}s ({file_size / 1024:.2f} KB)")
        else:
            print(f"  ✗ Failed - file not created")
    except Exception as e:
        print(f"  ✗ Error: {e}")

# Summary
print("\n" + "=" * 70)
print("Summary")
print("=" * 70)
print(f"{'Description':<40} {'Time (s)':<12} {'Size (KB)':<12}")
print("-" * 70)
for r in results:
    print(f"{r['description']:<40} {r['time']:<12.2f} {r['size_kb']:<12.2f}")

if results:
    avg_time = sum(r["time"] for r in results) / len(results)
    print(f"\nAverage generation time: {avg_time:.2f} seconds")
    print(
        f"Fastest: {min(r['time'] for r in results):.2f}s ({min(r, key=lambda x: x['time'])['description']})"
    )
    print(
        f"Slowest: {max(r['time'] for r in results):.2f}s ({max(r, key=lambda x: x['time'])['description']})"
    )
