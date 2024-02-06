#!/usr/bin/python2.7
# -*- coding: utf-8 -*-
import os
import subprocess


def generate_dates_file(start_date, final_date, step, filename):
    print(f"Generate dates file: start:[{start_date}] final: [{final_date}]")
    
    app_path = os.environ.get("APP_PATH").rstrip('/')
    data_dir = os.environ.get("DIR_DATA").rstrip('/')
    output = os.path.join(data_dir, filename)

    with open(output, 'w') as fp:

        # Py2
        # parameters = [start_date, final_date, step]
        # strParameters = '\n'.join(map(str, parameters))
        # p = subprocess.Popen('geradata', stdin=subprocess.PIPE, stdout=fp)
        # p.communicate(strParameters)

        # Py3
        parameters = [start_date, final_date, step]
        strParameters = '\n'.join(map(str, parameters))
        p = subprocess.Popen('geradata', stdin=subprocess.PIPE, stdout=fp, shell=True)
        p.communicate(str.encode(strParameters))


    os.chmod(output, 0o664)

    if os.path.exists(output):

        # Cria um link simbolico no diretório app
        os.symlink(output, os.path.join(app_path, filename))

        return output
    else:
        raise (Exception("Date file not generated. [%s]" % output))
