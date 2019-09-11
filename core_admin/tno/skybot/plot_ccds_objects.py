from matplotlib import pyplot as plt
import numpy as np


#Function to do a translation in RA from [pi --> 2pi | 0 --> pi] to [-pi --> 0 --> pi]
#input: list with elements in degrees (0-->360)
#output: list with elements in degrees 
def translationRA(ra):
    ra = np.array(ra, ndmin=1)
    newRA = [rai - 360 if rai > 180 else rai for rai in ra]
    if len(newRA) == 1:
        newRA = newRA[0]
    return newRA

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

def read_skybot_output(filepath):
    raH, decD = np.loadtxt(filepath, delimiter='|', usecols=(2,3), dtype=str, unpack=True)
    ra = [hh2degrees(hms) for hms in raH]
    dec = [dd2degrees(dms) for dms in decD]

    return ra, dec

def get_circle_from_ra_dec(ra, dec):
    x0, y0 = translationRA(ra), dec
    rho = 1.2  
    phi = np.linspace(0, 2*np.pi, 100)
    xx = x0 + rho*np.cos(phi)
    yy = y0 + rho*np.sin(phi)

    return xx, yy

def ccds_objects(ra, dec, ccds, skybot_file, file_path ):

    
    try:
        # DEcam Field of View (diameter = 2.2 degrees)
        x0, y0 = translationRA(ra), dec
        rho = 1.2   

        fig = plt.figure(figsize=(8,8),dpi=90)

        #plot circle used in SkyBoT query
        phi = np.linspace(0, 2*np.pi, 100)
        xx = x0 + rho*np.cos(phi)
        yy = y0 + rho*np.sin(phi)

        plt.plot(xx, yy, 'k')

        # Plot CCDs
        idx = 0

        for c in ccds:
            x = [c['rac1'], c['rac2'], c['rac3'], c['rac4'], c['rac1']]
            y = [c['decc1'], c['decc2'], c['decc3'], c['decc4'], c['decc1']]

            plt.plot(translationRA(x), y, 'b')

            # CCD number centered
            h = (translationRA(c['rac1']) + translationRA(c['rac3']))/2
            k = (c['decc1'] + c['decc2'])/2
            plt.text(h, k, str(c['ccdnum']), horizontalalignment='center', verticalalignment='center', fontsize=6, weight='bold')

            idx += 1

        # Plot SkyBoT output
        raH, decD = np.loadtxt(skybot_file, delimiter='|', usecols=(2,3), dtype=str, unpack=True)
        ra = [hh2degrees(hms) for hms in raH]
        dec = [dd2degrees(dms) for dms in decD]

        plt.plot(translationRA(ra), dec, '.r')

        plt.xlabel(r"$\alpha(\circ)$")
        plt.ylabel(r"$\delta(\circ)$")


        labels0, locations = plt.xticks()
        labels1 = [360 - abs(alpha) if alpha < 0 else alpha for alpha in labels0]
        plt.xticks(labels0, labels1)

        plt.axes().set_aspect('equal', 'datalim')

        plt.savefig(file_path, bbox_inches='tight')

        return file_path

    except Exception as e:
        raise e
