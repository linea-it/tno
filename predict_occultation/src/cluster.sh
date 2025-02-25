#!/bin/bash

source $CONDAPATH/activate
conda activate py3

ulimit -s 100000
ulimit -u 100000
umask 0002
