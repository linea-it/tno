#Read_DES_Table v1.0
#
#This Program generates one output file with the desired collumns and filter then, if is needed.
#
#DAT File
#The dat file must be Like: And be called READ_DES_Table.dat


'''
Value					| Row name		 	 |Description 
des_fmt.txt				| InputName			 |Input Des table Name
Centaur				| FClass	 	 	 |Class (0 if All DES File, else readme)
55.0					| FVmag	 	 	 |Visual Mag(0 if no filter)(dot decimal separation)
0					| Fposerr 	 	 	 |Position error (0 if no filter)
2006_BZ8				| FObjectName 	 	 |Object name ( 0 if all objects)
OutputFile.txt			| OutputName 		 |Output File name 
0 					| showDObject  	 	 |Show Duplicated Object 
0 					| showDDates  	 	 |Show Duplicated Dates
0 					| showDFilters  	 	 |Show Duplicates Filters (works only with search object name)
1 					| showObjectNumber 	 |Show object number
0 					| showObjectName 	 	 |Show object Name
0 					| showEquatorialCoordA 	 |Show EquatorialCoordA
0 					| showEquatorialCoordA 	 |Show EquatorialCoordD
0  					| showClass  	 	 |Show Class
0 					| showVMag  	 	 |Show Visual Magnitude
0					| showPosErr  	 	 |Show Position error
1					| showBCAD  	 	 |Show BodyCenterAngularDist
1					| showMotionACD  	 	 |Show MotionAcosD
1					| showMotionD    	 	 |Show MotionD
0					| showGeoDist  	 	 |Show GeocentricDist
0					| showHelioDist  	 	 |Show HeliocentricDist
1					| showPhaseD  	 	 |Show PhaseD
0					| showSolarE  	 	 |Show SolarElongation
1					| showH1  		 	 |Show Heliocen1
1					| showH2  		 	 |Show Heliocen2
1					| showH3  		 	 |Show Heliocen3
1					| showH4  		 	 |Show Heliocen4
1					| showH5  		 	 |Show Heliocen5
1					| showH6  		 	 |Show Heliocen6
0					| showJD  		 	 |Show JulienDate
1					| showFN  		 	 |Show FILENAME
1					| showComp  	 	 |Show COMPRESSION
1					| showPath  	 	 |Show PATH
1					| showPfwId  	 	 |Show PFW_ATTEMPT_ID
1					| showUnitN  	 	 |Show UNITNAME
1					| showBand  	 	 |Show BAND
1					| showCCDNUM  	 	 |Show CCDNUM
0					| showDATEOBS  	 	 |Show DATE_OBS
0					| showNITE  	 	 |Show NITE
1					| showEXPNUM  	 	 |Show EXPNUM
1					| showCrosRA  	 	 |Show CROSSRA0
1					| showRACMIN  	 	 |Show RACMIN
1					| showRACMAX  	 	 |Show RACMAX
1					| showDECCMIN  	 	 |Show DECCMIN
1					| showDECCMAX  	 	 |Show DECCMAX
1					| showRA_CENT  	 	 |Show RA_CENT
1					| showDEC_CENT  	 	 |Show DEC_CENT
1					| showRAC1  	 	 |Show RAC1
1					| showRAC2  	 	 |Show RAC2
1					| showRAC3  	 	 |Show RAC3
1					| showRAC4  	 	 |Show RAC4
1					| showDECC1  	 	 |Show DECC1
1					| showDECC2  	 	 |Show DECC2
1					| showDECC3  	 	 |Show DECC3
1					| showDECC4  	 	 |Show DECC4
1					| showRAS	  	 	 |Show RA_SIZE
1 					| showDECS  	 	 |Show DEC_SIZE
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
filters = Table.read("Read_DES_Table.dat",format='ascii', delimiter='|' )


# Read Filters from table
InputName=filters['Value'][0]
FClass= filters['Value'][1]       
FVmag= filters['Value'][2]
FVmag = float(FVmag)
FPoserr= filters['Value'][3]    
FPoserr=float(FPoserr)
FObjectName= filters['Value'][4]
OutputName= filters['Value'][5]
showDObject= filters['Value'][6]    
showDDates= filters['Value'][7]     
showDFilters= filters['Value'][8]  
showObjectNumber= filters['Value'][9] 
showObjectName= filters['Value'][10] 
showEquatorialCoordA= filters['Value'][11] 
showEquatorialCoordD= filters['Value'][12] 
showClass= filters['Value'][13]      
showVMag= filters['Value'][14]       
showPosErr= filters['Value'][15]     
showBCAD= filters['Value'][16]       
showMotionACD= filters['Value'][17]  
showMotionD= filters['Value'][18]    
showGeoDist= filters['Value'][19]    
showHelioDist= filters['Value'][20]  
showPhaseD= filters['Value'][21]     
showSolarE= filters['Value'][22]     
showH1= filters['Value'][23]        
showH2= filters['Value'][24]        
showH3= filters['Value'][25]        
showH4= filters['Value'][26]        
showH5= filters['Value'][27]        
showH6= filters['Value'][28]        
showJD= filters['Value'][29]        
showFN= filters['Value'][30]        
showComp= filters['Value'][31]       
showPath= filters['Value'][32]       
showPfwId= filters['Value'][33]      
showUnitN= filters['Value'][34]      
showBand= filters['Value'][35]       
showCCDNUM= filters['Value'][36]     
showDATEOBS= filters['Value'][37]    
showNITE= filters['Value'][38]       
showEXPNUM= filters['Value'][39]     
showCrosRA= filters['Value'][40]     
showRACMIN= filters['Value'][41]     
showRACMAX= filters['Value'][42]     
showDECCMIN= filters['Value'][43]    
showDECCMAX= filters['Value'][44]    
showRA_CENT= filters['Value'][45]    
showDEC_CENT= filters['Value'][46]  
showRAC1= filters['Value'][47]       
showRAC2= filters['Value'][48]       
showRAC3= filters['Value'][49]       
showRAC4= filters['Value'][50]       
showDECC1= filters['Value'][51]      
showDECC2= filters['Value'][52]      
showDECC3= filters['Value'][53]      
showDECC4= filters['Value'][54]      
showRAS= filters['Value'][55]
showDECS= filters['Value'][56] 

#Open File
print('Reading', InputName, "\n This may take a While")
data_des = Table.read(InputName, format='ascii', delimiter='\t')

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


#aply duplicated Object name Filter, Dates and BAND
if showDObject == '1':
    data_des = data_des.group_by ("ObjectName")
    data_des = astropy.table.unique(data_des, keys='ObjectName') #not working after updating astropy
if showDDates == '1':
    data_des = data_des.group_by ('JulienDate')
    if showDObject =='1':
        print ("error, please show your filters configuration")
    else:
        data_des = astropy.table.unique(data_des, keys = 'JulienDate')#not working after updating astropy
if showDFilters == '1':
    data_des = data_des.group_by('BAND')
    if showDObject =='1':
        print ("error, please show your filters configuration")
    else:
        data_des = astropy.table.unique(data_des, keys = 'BAND')#not working after updating astropy


#filter object name
if FObjectName != '0':
    data_des = data_des.group_by ("ObjectName")
    mask = data_des.groups.keys['ObjectName'] == FObjectName
    data_des  = data_des.groups[mask]

#apply columns filters
if showObjectNumber == '1' : 
	data_des.remove_column('ObjectNumber') 

if showObjectName == '1' : 
	data_des.remove_column('ObjectName') 

if showEquatorialCoordA == '1' : 
	data_des.remove_column('EquatorialCoordA') 

if showEquatorialCoordD == '1' : 
	data_des.remove_column('EquatorialCoordD') 

if showClass == '1' : 
	data_des.remove_column('Class') 

if showVMag == '1' : 
	data_des.remove_column('VMag') 

if showPosErr == '1' : 
	data_des.remove_column('PositionError') 

if showBCAD == '1' : 
	data_des.remove_column('BodyCenterAngularDist') 

if showMotionACD == '1' : 
	data_des.remove_column('MotionAcosD') 

if showMotionD == '1' : 
	data_des.remove_column('MotionD') 

if showGeoDist == '1' : 
	data_des.remove_column('GeocentricDist') 

if showHelioDist == '1' : 
	data_des.remove_column('HeliocentricDist') 

if showPhaseD == '1' : 
	data_des.remove_column('PhaseD') 

if showSolarE == '1' : 
	data_des.remove_column('SolarElongation') 

if showH1 == '1' : 
	data_des.remove_column('Heliocen1') 

if showH2 == '1' : 
	data_des.remove_column('Heliocen2') 

if showH3 == '1' : 
	data_des.remove_column('Heliocen3') 

if showH4 == '1' : 
	data_des.remove_column('Heliocen4') 

if showH5 == '1' : 
	data_des.remove_column('Heliocen5') 

if showH6 == '1' : 
	data_des.remove_column('Heliocen6') 

if showJD == '1' : 
	data_des.remove_column('JulienDate') 

if showFN == '1' : 
	data_des.remove_column('FILENAME') 

if showComp == '1' : 
	data_des.remove_column('COMPRESSION') 

if showPath == '1' : 
	data_des.remove_column('PATH') 

if showPfwId == '1' : 
	data_des.remove_column('PFW_ATTEMPT_ID') 

if showUnitN == '1' : 
	data_des.remove_column('UNITNAME') 

if showBand == '1' : 
	data_des.remove_column('BAND') 

if showCCDNUM == '1' : 
	data_des.remove_column('CCDNUM') 

if showDATEOBS == '1' : 
	data_des.remove_column('DATE_OBS') 

if showNITE == '1' : 
	data_des.remove_column('NITE') 

if showEXPNUM == '1' : 
	data_des.remove_column('EXPNUM') 

if showCrosRA == '1' : 
	data_des.remove_column('CROSSRA0') 

if showRACMIN == '1' : 
	data_des.remove_column('RACMIN') 

if showRACMAX == '1' : 
	data_des.remove_column('RACMAX') 

if showDECCMIN == '1' : 
	data_des.remove_column('DECCMIN') 

if showDECCMAX == '1' : 
	data_des.remove_column('DECCMAX') 

if showRA_CENT == '1' : 
	data_des.remove_column('RA_CENT') 

if showDEC_CENT == '1' : 
	data_des.remove_column('DEC_CENT') 

if showRAC1 == '1' : 
	data_des.remove_column('RAC1') 

if showRAC2 == '1' : 
	data_des.remove_column('RAC2') 

if showRAC3 == '1' : 
	data_des.remove_column('RAC3') 

if showRAC4 == '1' : 
	data_des.remove_column('RAC4') 

if showDECC1 == '1' : 
	data_des.remove_column('DECC1') 

if showDECC2 == '1' : 
	data_des.remove_column('DECC2') 

if showDECC3 == '1' : 
	data_des.remove_column('DECC3') 

if showDECC4 == '1' : 
	data_des.remove_column('DECC4') 

if showRAS == '1' : 
	data_des.remove_column('RA_SIZE') 

if showDECS == '1' : 
	data_des.remove_column('DEC_SIZE') 

#Write NewTable
print('Saving', OutputName)
data_des.write(OutputName, format='ascii', delimiter='\t', overwrite=True)
#FINISHED
print('Finished')
