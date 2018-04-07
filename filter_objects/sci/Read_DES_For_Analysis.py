#Read_DES_for_Analysis v1.0
#
# This Program generates one file with only collunms that is needed for Freq_Analysis v1.0
#
#DAT File
#The dat file must be Like: And be called Read_DES_For_Analysis.dat


'''
Value					| Row name		 	 |Description 
INPUTfile.txt			| InputName			 |Input Des table Name
0					| FClass	 	 	 |Class (0 if All DES File, else readme)
55.0					| FVmag	 	 	 |Visual Mag(0 if no filter)(dot decimal separation)
0					| Fposerr 	 	 	 |Position error (0 if no filter)
0					| FObjectName 	 	 |Object name ( 0 if all objects)
OutputFile.txt			| OutputName 		 |Output File name 

'''




#Import libraries
print('Importing Libraries')
from astropy.table import Column
from astropy.table import Table
from astropy.table import unique
from astropy.io import ascii
from numpy import *
import os
import numpy as np

# read Filters file 
print('Reading Read_DES_Table.dat')
filters = Table.read("Read_DES_For_Analysis.dat",format='ascii', delimiter='|' )


# Read Filters from table
InputName=filters['Value'][0]
FClass= filters['Value'][1]       
FVmag= filters['Value'][2]
FVmag = float(FVmag)
FPoserr= filters['Value'][3]    
FPoserr=float(FPoserr)
FObjectName= filters['Value'][4]
OutputName= filters['Value'][5]
 

#Open File
print('Reading', InputName, "\n This may take a While")
data_des = Table.read(InputName, format='ascii', delimiter='\t')

#Remove Columns
print('Removing undesired columns')
data_des.remove_columns(["ObjectNumber", "EquatorialCoordA", "EquatorialCoordD", "BodyCenterAngularDist", "MotionAcosD", "MotionD", "GeocentricDist","HeliocentricDist", "PhaseD", "SolarElongation", "Heliocen1", "Heliocen2", "Heliocen3", "Heliocen4", "Heliocen5", "Heliocen6",  "FILENAME", "COMPRESSION", "PATH", "PFW_ATTEMPT_ID", "UNITNAME", "CCDNUM", "DATE_OBS", "NITE", "EXPNUM", "CROSSRA0", "RACMIN", "RACMAX", "DECCMIN", "DECCMAX", "RA_CENT", "DEC_CENT","RAC1", "RAC2", "RAC3", "RAC4", "DECC1", "DECC2", "DECC3", "DECC4", "RA_SIZE", "DEC_SIZE"])

# apply  class filters
print('Appling Filters')
if FClass != '0':
    data_des = data_des.group_by ("Class")
    mask = data_des.groups.keys['Class'] == FClass
    data_des  = data_des.groups[mask]

#aply Visual magnitude filter and Position error filter
if FVmag != 0:
    magnitude = data_des["VMag"] <= FVmag
    data_des = data_des[magnitude]
    
if FPoserr != 0:
    position = data_des["PositionError"] <= FPoserr
    data_des = data_des[position]

#filter object name
if FObjectName != '0':
    data_des = data_des.group_by ("ObjectName")
    mask = data_des.groups.keys['ObjectName'] == FObjectName
    data_des  = data_des.groups[mask]

#Write NewTable
print('Saving', OutputName)
data_des.write(OutputName, format='ascii', delimiter='\t')
#FINISHED
print('Finished')
