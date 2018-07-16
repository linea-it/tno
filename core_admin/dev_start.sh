
docker run -it --rm --name tno-core-admin \
    --publish 7001:7001 \
    --volume $PWD/:/app \
    --volume $PWD/../log/:/log \
    --volume $PWD/../archive/:/archive \
    --volume $PWD/../archive/proccess/:/proccess \
    --volume $PWD/../archive/ccd_images/:/ccd_images \
    --env-file $PWD/../.env \
    --network tno_backend tno-core-admin

