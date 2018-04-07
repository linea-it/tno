#Download_from_DES V1.0
# 
#
#
##READ_DES_Table v1.0
#
#
#DAT File
#The dat file must be Like: And be called READ_DES_Table.dat
'''
Value					| Name		 | Description
ALL.txt				| inputfile		 | Input Des File
OutputFile2.txt	 		| inputfile		 | Names File
OutputfileN.txt			| outputfile	 | For pushing .fits files from DES server
'''

#Import libraries
print('Importing Libraries')
from astropy.table import Column
from astropy.table import Table
from astropy.table import table
from astropy.table import unique
from astropy.io import ascii
from numpy import *
import os
import numpy as np

# read Filters file 
print('Reading Download_from_DES.dat')
filters = Table.read("Download_from_DES.dat",format='ascii', delimiter='|' )
inputfile = filters["Value"][1]
InputName = filters["Value"][0]
OutputName = filters["Value"][2]

#Read Names File

print('Reading',inputfile )
names = Table.read(inputfile,format='ascii', delimiter=' ' )

#Open File

print('Reading', InputName, "\n This may take a While")
data_des = Table.read(InputName, format='ascii', delimiter='\t')
data_des = data_des.group_by ("ObjectName")

#Remove Columns)
print('Removing undesired columns')
data_des.remove_columns(["ObjectNumber", "EquatorialCoordA", "EquatorialCoordD", "Class",  "PositionError", "BodyCenterAngularDist", "MotionAcosD", "MotionD", "GeocentricDist", "HeliocentricDist", "PhaseD", "SolarElongation", "Heliocen1", "Heliocen2", "Heliocen3", "Heliocen4", "Heliocen5", "Heliocen6", "JulienDate",  "EXPNUM", "CROSSRA0", "RACMIN", "RACMAX", "DECCMIN", "DECCMAX", "RA_CENT", "DEC_CENT","RAC1", "RAC2", "RAC3", "RAC4", "DECC1", "DECC2", "DECC3", "DECC4", "RA_SIZE", "DEC_SIZE"])
#filtering file
number = len(names)
for i in range(number):
    name = names['ObjectName'][i]
    if i == 0:
        mask = data_des.groups.keys['ObjectName'] == name
        Objects  = data_des.groups[mask]
    else:
        mask = data_des['ObjectName'] == name
        Objects2 = data_des[mask]
        for j in range(len(Objects2)):
            Objects.add_row(Objects2[j])
    if i % 2 ==0:
        os.system('clear')
        print(i,"/", number)
#removing duplicated filesnames
print('Saving', OutputName)
Objects.write(OutputName, format='ascii', delimiter='\t', overwrite=True)

#Input Username and Password
user = input("User Name:")
os.system("clear")
password = input("Password:")
os.system("clear")

#Downloading files
number= len(Objects)
for i in range(number):
    os.system("clear")
    print("downloading",i,"/",number)
    #print("wget --user=",user," --password=",password," https://desar2.cosmology.illinois.edu/DESFiles/desarchive/",Objects['PATH'][i],"/",Objects['FILENAME'][i],Objects['COMPRESSION'][i], sep ="")
    os.system("wget --user="+user+" --password="+password+" https://desar2.cosmology.illinois.edu/DESFiles/desarchive/"+Objects['PATH'][i]+"/"+Objects['FILENAME'][i]+Objects['COMPRESSION'][i])
#FINISHED
print("FINISHED")
