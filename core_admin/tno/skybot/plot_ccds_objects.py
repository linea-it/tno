from matplotlib import pyplot as plt
import numpy as np


#Function to convert Right Ascension in Hour Minute and Second format to degrees
def hh2degrees(hhmmss):
    h, m, s = hhmmss.split()
    deg = (int(h) + int(m)/60.0 + float(s)/3600.0)*15.0
    return deg


#Function to convert Declination in Degree Minute and Second format to degrees
def dd2degrees(ddmmss):
    d, m, s = ddmmss.split()
    deg = abs(int(d)) + int(m)/60.0 + float(s)/3600.0
    if d[0] == '-':
        deg = -deg
    return deg


def ccds_objects(ra, dec, ccds, skybot_file, file_path ):
    try:
        # DEcam Field of View (diameter = 2.2 degrees)
        rho = 1.2   

        fig = plt.figure(figsize=(8,8),dpi=90)

        #plot circle used in SkyBoT query
        phi = np.linspace(0, 2*np.pi, 100)
        xx = ra + rho*np.cos(phi)
        yy = dec + rho*np.sin(phi)

        plt.plot(xx, yy, 'k')

        # Plot CCDs
        for c in ccds:
            x = [c['rac1'], c['rac2'], c['rac3'], c['rac4'], c['rac1']] #rac1, rac2, rac3, rac4, rac1
            y = [c['decc1'], c['decc2'], c['decc3'], c['decc4'], c['decc1']] #decc1, decc2, decc3, decc4, decc1
            plt.plot(x, y, 'b')

            # CCD number centered
            h = (c['rac1'] + c['rac3'])/2
            k = (c['decc1'] + c['decc2'])/2
            plt.text(h, k, str(c['ccdnum']), horizontalalignment='center', verticalalignment='center', fontsize=6, weight='bold')

        # Plot SkyBoT output
        raH, decD = np.loadtxt(skybot_file, delimiter='|', usecols=(2,3), dtype=str, unpack=True)
        ra = [hh2degrees(hms) for hms in raH]
        dec = [dd2degrees(dms) for dms in decD]

        plt.plot(ra, dec, '.r')

        plt.xlabel(r"$\alpha(\circ)$")
        plt.ylabel(r"$\delta(\circ)$")

        plt.savefig(file_path, bbox_inches='tight')

        return file_path

    except Exception as e:
        raise e
