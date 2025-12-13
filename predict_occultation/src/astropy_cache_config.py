"""
Configure Astropy cache directory before any astropy imports.

This module must be imported before any astropy-related imports to ensure
the cache directory is configured correctly.
"""

import os
from pathlib import Path

# Check if XDG_CACHE_HOME is already set (e.g., by env_pipeline.sh on cluster workers)
# If set, respect it and ensure the astropy subdirectory exists
if os.getenv("XDG_CACHE_HOME"):
    cache_base_dir = Path(os.getenv("XDG_CACHE_HOME"))
    # Astropy expects XDG_CACHE_HOME/astropy to exist
    astropy_cache_dir = cache_base_dir / "astropy"
    # Ensure the astropy subdirectory exists (required for Astropy to use XDG_CACHE_HOME)
    astropy_cache_dir.mkdir(parents=True, exist_ok=True)
else:
    # Set cache directory before any astropy imports to configure cache location
    # This ensures the cache is on shared filesystem (lustre) for cluster execution
    shared_cache_base = os.getenv("PREDICT_INPUTS")
    if shared_cache_base:
        # Set cache to a subdirectory of PREDICT_INPUTS parent which is on shared filesystem
        cache_base_dir = Path(shared_cache_base).parent / ".astropy_cache"
        # Astropy expects XDG_CACHE_HOME/astropy to exist
        astropy_cache_dir = cache_base_dir / "astropy"

        # Set XDG_CACHE_HOME to the base directory
        os.environ["XDG_CACHE_HOME"] = str(cache_base_dir)

        # Ensure the astropy subdirectory exists (required for Astropy to use XDG_CACHE_HOME)
        astropy_cache_dir.mkdir(parents=True, exist_ok=True)
