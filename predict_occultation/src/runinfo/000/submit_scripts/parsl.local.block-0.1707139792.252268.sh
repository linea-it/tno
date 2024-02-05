source /app/src/env.sh

export JOBNAME=$parsl.local.block-0.1707139792.252268
set -e
export CORES=$(getconf _NPROCESSORS_ONLN)
[[ "1" == "1" ]] && echo "Found cores : $CORES"
WORKERCOUNT=1
FAILONANY=0
PIDS=""

CMD() {
process_worker_pool.py  --max_workers=4 -a 172.17.0.1,127.0.0.1,172.20.0.1,201.51.78.7,192.168.65.3,172.22.0.1,172.23.0.1,PCGlauber,192.168.65.6,172.21.0.1,172.19.0.1,172.18.0.1 -p 0 -c 1.0 -m None --poll 10 --task_port=54316 --result_port=54333 --logdir=/app/src/runinfo/000/local --block_id=0 --hb_period=30  --hb_threshold=120 --cpu-affinity none --available-accelerators  --start-method spawn
}
for COUNT in $(seq 1 1 $WORKERCOUNT); do
    [[ "1" == "1" ]] && echo "Launching worker: $COUNT"
    CMD $COUNT &
    PIDS="$PIDS $!"
done

ALLFAILED=1
ANYFAILED=0
for PID in $PIDS ; do
    wait $PID
    if [ "$?" != "0" ]; then
        ANYFAILED=1
    else
        ALLFAILED=0
    fi
done

[[ "1" == "1" ]] && echo "All workers done"
if [ "$FAILONANY" == "1" ]; then
    exit $ANYFAILED
else
    exit $ALLFAILED
fi
