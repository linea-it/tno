#!/usr/bin/python2.7
# -*- coding: utf-8 -*-

import argparse
import os
import shutil
import subprocess
import sys
import traceback
from datetime import datetime

import numpy as np
import spiceypy as spice

# Function to execute scripts, the parameters must be an numpy array
# with specific and ordered values
# for example the script sc_wget needs [number, name, par1, par2]
# where par1 is the parameter for creation of observations file
# and par2 is the parameter for creation of orbital elements file
# errors for this example: [name, number, par1, par2]
# [number, name, par2, par1], [number, par1, name, par2], etc.


def executeScript(script, parameters, log_file):

    strParameters = "\n".join(map(str, parameters))

    # open the script .sh with the necessary configurations
    p = subprocess.Popen(
        script, stdin=subprocess.PIPE, shell=True, stdout=log_file, stderr=log_file
    )

    # set the input parameters to the script
    p.communicate(strParameters)


# Function to search a substring (between two keywords) inside a string
def find_between(text, key1, key2):
    try:
        start = text.index(key1) + len(key1)
        end = text.index(key2, start)
        return text[start:end]
    except ValueError:
        return ""


# Function to get idspk from bsp JPL (only for JPL)
def findIDSPK(bspFile):
    # loading bsp file
    spice.furnsh(bspFile)

    # Number lines to extract comments of header from JPL bsp files
    nLines = 74

    # keyword to search spk value
    key = "Target SPK ID   :"
    lenKey = len(key)

    spk = ""
    m, header, flag = spice.dafec(1, nLines)
    for row in header:
        if row[:lenKey] == key:
            spk = row[lenKey:].strip()
            break

    return spk


# Function to add spkid and object name associated to sh file
def addSPK2file(name, spk, filename):
    shFile = open(filename, "r+")
    content = shFile.readlines()

    listSPK = []
    for line in content:
        code = find_between(line, "idspk=", " ;fi")
        if code:
            listSPK.append(code)

    # 2 000 000 < spk of number objects < 3 000 000
    if int(spk) > 3000000 and spk not in listSPK:
        n = len(listSPK) + 4
        text = '        if [ "$aster" = "' + name + '" ]; then idspk=' + spk + " ;fi\n"

        content.insert(n, text)
        shFile.seek(0)
        shFile.writelines(content)
    shFile.close()


def NIMAmanager(inputParametersFile, log_file):
    parameters, comment = np.loadtxt(
        inputParametersFile,
        dtype="str",
        delimiter="|",
        converters={0: lambda s: s.strip()},
        unpack=True,
    )

    pathNIMAuser = parameters[0]
    number = parameters[5]
    name = parameters[6]

    # data_dir = os.environ.get("DIR_DATA").rstrip('/')
    # TODO: Tentar não usar os paths vindo do arquivo de inputs.

    # Check if necessary files exist (if not then it is finalized here)
    in_astrometry = os.path.join(parameters[1], name + ".txt")

    if not os.path.exists(in_astrometry):
        raise Exception("No Astrometry file found. [ %s ]" % in_astrometry)
        exit(1)

    f_bsp_jpl = name + ".bsp"
    in_bsp_jpl = os.path.join(parameters[2], f_bsp_jpl)

    if not os.path.exists(in_bsp_jpl):
        raise Exception("No BSP_JPL file found. [ %s ]" % in_bsp_jpl)
        exit(1)

    # Observations AstDys
    in_observatios = os.path.join(parameters[3], name + ".rwo")

    if not os.path.exists(in_observatios):
        # Nao existe arquivo do AstDys verifica do MPC
        print("No Observations AstDys found. [ %s ]" % in_observatios)

        # Observations MPC
        in_observatios = os.path.join(parameters[3], name + ".rwm")
        if not os.path.exists(in_observatios):
            raise Exception("No Observations file found. [ %s ]" % in_observatios)
            exit(1)

    # Orbital Parameters AstDys
    in_orb_parameters = os.path.join(parameters[4], name + ".eq0")

    if not os.path.exists(in_orb_parameters):
        # Nao existe arquivo do AstDys verifica do MPC
        print("No Orbital Parameters AstDys found. [ %s ]" % in_orb_parameters)

        in_orb_parameters = os.path.join(parameters[4], name + ".eqm")
        if not os.path.exists(in_orb_parameters):
            raise Exception(
                "No Orbital Parameters file found. [ %s ]" % in_orb_parameters
            )
            exit(1)

    asteroidFolder = pathNIMAuser + "/results/" + number
    # create the folder "number" if it does not exist
    if os.path.exists(asteroidFolder):
        subprocess.call(["rm", "-r", asteroidFolder])
    os.mkdir(asteroidFolder)

    print("Asteroid Folder: %s" % asteroidFolder)

    myPath = os.getcwd()
    # changing from local path to especific path
    os.chdir(pathNIMAuser)

    # copy the bsp file (JPL) and astrometry file (PRAIA) to NIMA
    subprocess.call(["cp", in_astrometry, asteroidFolder])

    jplbsp = os.path.join(pathNIMAuser, "jplbsp", f_bsp_jpl)
    subprocess.call(["cp", in_bsp_jpl, jplbsp])

    # ============================= EXECUTE ALL SCRIPTS NIMA =============================

    # Fix para Objetos que nao possuem numero.
    if name == number:
        idspk = findIDSPK(jplbsp)
        print("IDSPK: %s" % idspk)

        idspkFile = os.path.join(pathNIMAuser, "idspk.sh")

        addSPK2file(name, idspk, idspkFile)

        # Only for debug
        # shutil.copy2(idspkFile, os.path.join(os.environ.get("DIR_RESULTS"), 'idspk.sh' ))

    # ========================== sc_AstDySMPC2NIMA ==========================
    path_script = os.path.join(pathNIMAuser, "sc_AstDySMPC2NIMA.sh")
    executeScript(
        path_script, np.concatenate([parameters[5:7], parameters[3:5]]), log_file
    )

    # ============================== sc_esoopd ==============================
    path_script = os.path.join(pathNIMAuser, "sc_esoopd.sh")
    executeScript(path_script, parameters[5:7], log_file)

    # =============================== sc_cat ================================
    executeScript("./sc_cat.sh", np.insert(parameters[7:8], 0, number), log_file)

    # ============================== sc_merge ===============================

    executeScript("./sc_merge.sh", np.insert(parameters[8:10], 0, number), log_file)

    # =============================== sc_fit ================================
    executeScript("./sc_fit.sh", np.insert(parameters[10:17], 0, number), log_file)

    # ============================= sc_importbsp ============================
    executeScript("./sc_importbsp.sh", np.append(parameters[5:7], jplbsp), log_file)

    # ============================ sc_diffjplomc ============================
    executeScript(
        "./sc_diffjplomcPython.sh", np.insert(parameters[17:31], 0, number), log_file
    )

    # ============================== sc_makebsp =============================
    executeScript("./sc_makebsp.sh", np.insert(parameters[31:38], 0, number), log_file)

    # =============================== sc_ephem ==============================
    executeScript("./sc_ephem.sh", np.insert(parameters[38:], 0, number), log_file)

    # TODO: COPIAR ARQUIVO DE DUPLICIDADE

    # ============================ move results ==============================
    print("============================ move results ==============================")

    result_folder = os.environ.get("DIR_DATA")
    print("Result Folder: %s" % result_folder)

    files = os.listdir(asteroidFolder)

    result_files = []

    for f in files:
        try:
            # Ignorar o Link Simbolico para o arquivo jplbsp
            if f != os.path.basename(jplbsp):

                filename = f
                if f.find("nima.bsp") != -1:
                    print("Rename BSP NIMA")
                    filename = "%s_nima.bsp" % name

                dest_file = os.path.join(result_folder, filename)

                shutil.move(os.path.join(asteroidFolder, f), dest_file)

                # os.chmod(dest_file, 0776)
                os.chmod(dest_file, 0o664)

                result_files.append(dest_file)

                print(
                    "File: [ %s ] Size: [ %s ]"
                    % (dest_file, os.path.getsize(dest_file))
                )

        except Exception as e:
            print(e)

    return result_files


def start_nima():
    # path para arquivo de inputs.
    parametersFile = os.path.join(os.environ.get("DIR_DATA"), "nima_input.txt")

    # path para arquivo de log.
    log_file = os.path.join(os.environ.get("DIR_DATA"), "nima.log")

    orig_stdout = sys.stdout
    f = open(log_file, "w")
    sys.stdout = f

    start_time = datetime.now()

    files = NIMAmanager(parametersFile, log_file=f)

    end_time = datetime.now()

    print("Duration: %s" % (end_time - start_time))

    sys.stdout = orig_stdout
    f.close()

    return files
