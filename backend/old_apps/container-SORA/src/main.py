import datetime
import json
import os

import restApi
import workAssyncFile
from sora.prediction import prediction
from sora.prediction.occmap import plot_occ_map as occmap


def __clearName(name):
    name = "".join(x for x in name if x.isalnum() or x == " " or x == "-" or x == "_")
    name = name.replace(" ", "_")
    return name


def processRequest(data, output):
    outputFile = generateMap(data, output, False)
    f = open(outputFile, "rb")
    content = f.read()
    return content


def processFile(input, output, fileName):
    f = open(os.path.join(input, fileName), "r")
    data = json.loads(f.read())
    generateMap(data, output, True)


def generateMap(data, output, forced=False):
    if "body" in data:
        return generateMapWithIternet(data, output, forced)
    else:
        return generateMapWithoutIternet(data, output, forced)


def generateMapWithIternet(data, output, forced=False):
    body = data["body"]
    strDate = data["date"]
    strTime = data["time"]
    fileName = __clearName(
        body + " " + strDate.replace("-", "") + " " + strTime.replace(":", "")
    )
    outputFile = os.path.join(output, fileName + ".jpg")
    if forced or not os.path.exists(outputFile):
        v = (strDate + "-" + strTime).replace(":", "-").split("-")
        dtRef = datetime.datetime(
            int(v[0]), int(v[1]), int(v[2]), int(v[3]), int(v[4]), int(v[5])
        )
        time0 = dtRef - datetime.timedelta(hours=4, minutes=0)  # fuso 3
        time1 = time0 + datetime.timedelta(hours=2, minutes=0)
        dtRef = dtRef - datetime.timedelta(hours=3, minutes=0)

        pred = prediction(
            body=body, time_beg=time0, time_end=time1, step=10, divs=1, verbose=False
        )
        for p in pred:
            p.plot_occ_map(nameimg=fileName, path=output, fmt="jpg")

    return outputFile


def generateMapWithoutIternet(data, output, forced=False):
    name = data["name"]
    radius = data["radius"]
    coord = data["coord"]
    time = data["time"]
    ca = data["ca"]
    pa = data["pa"]
    vel = data["vel"]
    dist = data["dist"]
    mag = data["mag"]
    longi = data["longi"]
    v = time.split("T")
    strDate = v[0]
    if "." in v[1]:
        v[1] = v[1].split(".")[0]
    strTime = v[1]
    fileName = __clearName(
        name + " " + strDate.replace("-", "") + " " + strTime.replace(":", "")
    )
    outputFile = os.path.join(output, fileName + ".jpg")
    if forced or not os.path.exists(outputFile):
        occmap(
            name,
            radius,
            coord,
            time,
            ca,
            pa,
            vel,
            dist,
            mag=mag,
            longi=longi,
            dpi=50,
            nameimg=fileName,
            path=output,
            fmt="jpg",
        )

    return outputFile


if __name__ == "__main__":
    waf = workAssyncFile.WorkAssyncFile(
        os.getenv("INPUT_PATH", "~/media/input"),
        os.getenv("OUTPUT_PATH", "~/media/output"),
    )
    waf.setProcessFile(processFile)
    waf.start()

    api = restApi.RespApi(
        port=os.getenv("PORT", 8000),
        cachePath=os.getenv("CACHE_PATH", "~/media/output"),
    )
    api.setProcessReponse(processRequest)
    api.start()
