#!/bin/bash
set -o errexit
umask ug=rwx,o=r


# Baixa e instala o miniconda
# No diretório atual PWD/miniconda
conda_bin="$PWD/miniconda/bin/conda"
if [ ! -f $conda_bin ];
then
    echo "Miniconda não está instalado"
    mkdir -p miniconda
    minicondash="$PWD/miniconda/miniconda.sh"
    wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh -O $minicondash
    chmod +x $minicondash
    $minicondash -b -u -p $PWD/miniconda
    rm -rf $minicondash
    $conda_bin init bash
    find $PWD/miniconda/ -follow -type f -name '*.a' -delete
    find $PWD/miniconda/ -follow -type f -name '*.js.map' -delete
    $conda_bin clean -afy
    chmod =2775 $PWD/miniconda/

else
    echo "Miniconda instalado"
fi
