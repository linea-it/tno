import subprocess


def funpack(filepath):
    # Descompactar .fz -> .fits usando funpack no sistema.
    process = subprocess.Popen(["funpack %s" % filepath],
                               stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=True)

    out, error = process.communicate()

    if process.returncode > 0:
        raise Exception(
            "Failed to run Funpack. OUT: [%s] Error: [%s]" % (out.decode("utf-8"), error.decode("utf-8")))
