#!/bin/bash
set -o errexit
umask ug=rwx,o=r


# Baixa e instala o miniconda
# No diretório atual PWD/miniconda
miniconda_path="/lustre/t1/scratch/users/app.tno/tno_dev/miniconda"
conda_bin="$miniconda_path/bin/conda"
miniconda_sh="$miniconda_path/miniconda.sh"
if [ ! -f $conda_bin ];
then
    echo "Miniconda não está instalado"
    mkdir -p miniconda
    curl https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh -o $miniconda_sh
    chmod +x $miniconda_sh
    $miniconda_sh -b -u -p $miniconda_path
    rm -rf $miniconda_sh
    # $conda_bin init bash
    find $miniconda_path/ -follow -type f -name '*.a' -delete
    find $miniconda_path/ -follow -type f -name '*.js.map' -delete
    $conda_bin clean -afy
    chmod =2775 $miniconda_path/

else
    echo "Miniconda instalado"
fi
