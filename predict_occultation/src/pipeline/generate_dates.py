#!/usr/bin/python2.7
# -*- coding: utf-8 -*-
import os
import subprocess


def generate_dates_file(start_date, final_date, step, filename):

    app_path = os.environ.get("APP_PATH").rstrip("/")
    data_dir = os.environ.get("DIR_DATA").rstrip("/")
    output = os.path.join(data_dir, filename)

    if not os.path.exists(output):
        print(
            f"Generating dates file: start:[{start_date}] final: [{final_date} step: [{step}]]"
        )
        with open(output, "w") as fp:
            parameters = [start_date, final_date, step]
            strParameters = "\n".join(map(str, parameters))
            p = subprocess.Popen(
                "geradata", stdin=subprocess.PIPE, stdout=fp, shell=True
            )
            p.communicate(str.encode(strParameters))
    else:
        print("Using previously created date file.")

    os.chmod(output, 0o664)

    if os.path.exists(output):
        # Cria um link simbolico no diretório app
        output_link = os.path.join(app_path, filename)
        os.symlink(output, output_link)
        print(f"Created symbolic link to the dates file: [{output_link}]")
        return output
    else:
        raise (Exception("Date file not generated. [%s]" % output))
