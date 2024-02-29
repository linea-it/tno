#!/bin/bash

set -o errexit
set -o pipefail
set -o nounset

BASEDIR=`pwd`
echo "BASE PROJECT DIR: [$BASEDIR]"
echo "TESTE"
USERID=$UID
echo "USERID: $USERID"
# # GID=`getent group ton | cut -d: -f3`
# GID=1000
# echo "USER: ${BASEDIR}" UID: ${USERID} GID: ${GID}"
