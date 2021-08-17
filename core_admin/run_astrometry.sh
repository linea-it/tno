#!/bin/bash
args=("$@")

# Primeiro parametro JobId
# Segundo parametro JobPath
# umask 0002 && python /orbit_trace/orbit_trace.py ${args[0]} ${args[1]}
umask 0002 
python /orbit_trace/orbit_trace.py ${args[0]} ${args[1]}
