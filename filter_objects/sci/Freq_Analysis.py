#Freq_Analysis v1.0
#
#This softaware is used to read a ascii DES file and return some important informations, like:
# Number of observations, Max Difference between two observations, Magnitude, position error
#number of filters and if has more than one filter in the some Night
#
#DAT File
#The dat file must be Like: And be called Freq_Analysis.dat
'''
Value				|Description 
ALL.txt			|Input File
ALL_FREQ.txt		|Output File
#####################################
 Put name of Des_Table file into 
input File
 Put name of filtered DES Table File
into Output File

#####################################
'''

#import Libraries
print('Importing Libraries')
from numpy import *
from astropy.table import Table
import os

# read Files file 
print('Reading Freq_Analysis.dat')
files = Table.read("Freq_Analysis.dat",format='ascii', delimiter='|' )
InputName= files['Value'][0]       
OutputName= files['Value'][1]

#read DES_Table
print('Reading', InputName, 'It may take a while')
data_des = Table.read(InputName, format='ascii', delimiter='\t')

#create Table
FreqTable = Table(names = ('ObjectName','Class','Freq','DiffNights','MfilterN', 'NFilters','VMagMin', 'VMagMax','DeltaTime',"MaxPosErr","MinPosErr" ), dtype=(('str',24),('str',24),'i','i','str', 'i','float64', 'float64','i','float64','float64'))

#Group Object names in the Des File and filter then
data_des = data_des.group_by ("ObjectName")
classes = data_des.groups.keys
number = len(classes)
print('Analysing')

for i in range(number):
    name = classes['ObjectName'][i] #Object name
    mask = data_des['ObjectName'] == name
    objects = data_des[mask]
    Class = objects['Class'][0] #Object Class
    freq = len(objects) #Number of reapeted Observations on DES
    deltatime = max(objects["JulienDate"]) - min(objects["JulienDate"])
    MagMax = max(objects['VMag'])
    MagMax = ("%.1f" % round(MagMax,1)) #Max. Magnitude 
    MagMin = min(objects['VMag'])
    MagMin = ("%.1f" % round(MagMin,1)) #Min. Magnitude
    MaxPosErr = max(objects['PositionError']) #Max Position Error
    MinPosErr = min(objects['PositionError']) #Min Position Error
    objects = objects.group_by('JulienDate')
    DiffNights = objects.groups.keys
    DiffNights = len(DiffNights)# number of observations in different nights
    for j in range(DiffNights): #filter if has more than one filter in the some night
        Date = objects['JulienDate'][j]
        mask = objects['JulienDate'] == Date
        objects = objects.group_by('BAND')
        filters = objects.groups.keys
        if len(filters) > 1:
            MfilterN = 'Y'
            break
        else:
            MfilterN = 'N'
            continue                
    objects = objects.group_by('BAND')
    filters = objects.groups.keys 
    filters = len(filters) #number of diferent filters
    FreqTable.add_row([name, Class, freq,DiffNights,MfilterN,filters, MagMax, MagMin, deltatime,MaxPosErr,MinPosErr] )
    if i % 2 == 0:
        os.system('clear')  # For Linux/OS X
        print('Analysing',i,'/', number)
print('Saving', OutputName)
FreqTable.write(OutputName, format='ascii', delimiter='\t')

#FINISHED
print('Finished')
