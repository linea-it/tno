# from matplotlib import pyplot as plt
# import numpy as np
# ​
# #function to plot the limits from a CCD and the stars which are within it
# #and after save in a file (pdf, png, etc.)
# def plotStarsCCD(arrayStar, ccd, outFile):
# ​
#     xx = np.concatenate((ccd[1:5], [ccd[1]]))
#     yy = np.concatenate((ccd[5:9], [ccd[5]]))
# ​
#     data = filter(lambda x: int(x[2])==int(ccd[0]), arrayStar)
# ​
#     ra = [x[0] for x in data]
#     dec = [x[1] for x in data]
# ​
#     plt.figure()
# ​
#     plt.plot(xx,yy, 'k')
#     plt.plot(ra,dec, '.r')
#     plt.axes().set_aspect('equal', 'datalim')
# ​
#     plt.savefig(outFile)
#     plt.close()
​