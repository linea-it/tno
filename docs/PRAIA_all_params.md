
# PRAIA All parameters in .dat

| Display name      | name                  | type    |  default value                 |  Description |
|-------------------|-----------------------|---------|---------------------------|------------------------------------------------------------------------------------|
| 2MASS             | path_2mass            | string  |                           | root directory under which the 2MASS catalogue sub-directories lay
| UCAC4             | path_ucac4            | string  |                           | root directory under which the UCAC4 catalogue sub-directories lay
| UCAC5             | path_ucac5            | string  |                           | root directory under which the UCAC5 catalogue directory lays
| GAIA              | path_gaia             | string  |                           | root directory under which the complete GAIA catalogue (GAIA_1) sub-directories lay
| Magnitude min cutoff Gaia |mag_min_cutoff_gaia2  | string | +10                 | magnitude cutoffs: minimum magnitude defining GAIA_2 catalogue solution
| Magnitude max cutoff Gaia |mag_max_cutoff_gaia2  | string | +30                 | magnitude cutoffs: maximum magnitude defining GAIA_2 catalogue solution
| User Catalog      | path_user_catalog     | string  | gaia.cat                  | User reference catalogue (PRAIA format)  |
| Remake Astrometry | remake_astrometry     | choice  |0                          | (0) Astrometry of fits images .:. Remake astrometry from PRAIA's previous: (1) measured (x,y)s ; (2) measured (RA,DEC)s (tangent plane technique)
| Astrometry Option | astrometry_option     | string  |output                     | Astrometry option = 0 -> file with extracted header data from fits images .:. option = 1,2 -> List of PRAIA xy files for remaking astrometry
| Target Input File | target_input_file     | string  |targets                    | targets input file: (RA,Dec), JD, target name
| FDP File Type     | fdp_file_type         | choice  |4                          | FDP file type: (1) d(x,y)s (pixels) or d(RA,Dec)s (") mask; (2) (x,y)/(RA,Dec) 3rd degree distortion polynomial; (3) = polynomial FITS keywords; (4) DES
| FDP File          | fdp_file              | string  |fdp.dat                    | FDP (Field Distortion Pattern) file (images/remaking astrometry) with polinomial coeffs. or mask for d(x,y)s or d(RA,Dec)s (tangent plane technique)
| n Nearest Points  | n_nearest_ points     | string  |4                          | n nearest points for FDP mask interpolation (FDP file type 1 only)
|  |   | choise |1                                                 | output (x,y)s: (1) without FDP correction (keeps original xys in all astrometry modes); (2) with FDP correction (tangent plane xys in astrometry mode 2)
|   |  |                |bpx.dat                                           | Bad pixel mask  (xmin xmax ymin ymax)  common to all treated images (only applies for astrometry of fits images)
|   |  |                |astrometry_photometry                             | photometric statistics of each field
|   |  |                |astrometry_reduction_UCAC4                        | reduction statistics of each field for UCAC4
|   |  |                |astrometry_reduction_UCAC5                        | reduction statistics of each field for UCAC5
|   |  |                |astrometry_reduction_GAIA1                        | reduction statistics of each field for GAIA_1 solution (all GAS stars, including TGAS stars)
|   |  |                |astrometry_reduction_GAIA2                        | reduction statistics of each field for GAIA_2 solution (all GAS stars, including TGAS stars, within magnitude range given by the user)
|   |  |                |astrometry_reduction_GAIA3                        | reduction statistics of each field for GAIA_3 solution (GAIA_1, including UCAC4 proper motions)
|   |  |                |astrometry_reduction_GAIA4                        | reduction statistics of each field for GAIA_4 solution (GAIA_1, including [GAIA1-UCAC4]-based proper motions)
|   |  |                |astrometry_reduction_GAIA5                        | reduction statistics of each field for GAIA_5 solution (GAIA_1, including UCAC4 proper motions, but only with stars with proper motions)
|   |  |                |astrometry_reduction_GAIA6                        | reduction statistics of each field for GAIA_6 solution (GAIA_1, including [GAIA1-UCAC4]-based proper motions, but only with stars with proper motions)
|   |  |                |astrometry_reduction_GAIA7                        | reduction statistics of each field for GAIA_7 solution (GAIA_5 or GAIA_6 stars only, but with GAS positions without UCAC4-based proper motions)
|                       |  | |astrometry_reduction_CUSER                        | reduction statistics of each field for User catalogue solution
|                     |  | |astrometry_target_PRAIA_UCAC4                     | target file PRAIA format for UCAC4 solution
|                     |  | |astrometry_target_PRAIA_UCAC5                     | target file PRAIA format for UCAC5 solution
|                     |  | |astrometry_target_PRAIA_GAIA1                     | target file PRAIA format for GAIA_1 solution
|                     |  | |astrometry_target_PRAIA_GAIA2                     | target file PRAIA format for GAIA_2 solution
|                     |  | |astrometry_target_PRAIA_GAIA3                     | target file PRAIA format for GAIA_3 solution
|                     |  | |astrometry_target_PRAIA_GAIA4                     | target file PRAIA format for GAIA_4 solution
|                     |  | |astrometry_target_PRAIA_GAIA5                     | target file PRAIA format for GAIA_5 solution
|                     |  | |astrometry_target_PRAIA_GAIA6                     | target file PRAIA format for GAIA_6 solution
|                     |  | |astrometry_target_PRAIA_GAIA7                     | target file PRAIA format for GAIA_7 solution
|                     |  | |astrometry_target_PRAIA_CUSER                     | target file PRAIA format for User reference catalogue solution
|                     |  | |astrometry_target_MPC_UCAC4                       | target file MPC format for UCAC4 solution
|                     |  | |astrometry_target_MPC_UCAC5                       | target file MPC format for UCAC5 solution
|                     |  | |astrometry_target_MPC_GAIA1                       | target file MPC format for GAIA_1 solution
|                     |  | |astrometry_target_MPC_GAIA2                       | target file MPC format for GAIA_2 solution
|                     |  | |astrometry_target_MPC_GAIA3                       | target file MPC format for GAIA_3 solution
|                     |  | |astrometry_target_MPC_GAIA4                       | target file MPC format for GAIA_4 solution
|                     |  | |astrometry_target_MPC_GAIA5                       | target file MPC format for GAIA_5 solution
|                     |  | |astrometry_target_MPC_GAIA6                       | target file MPC format for GAIA_6 solution
|                     |  | |astrometry_target_MPC_GAIA7                       | target file MPC format for GAIA_7 solution
|                     |  | |astrometry_target_MPC_CUSER                       | target file MPC format for User reference catalogue solution
|                     |  | |astrometry_target_NIMA_UCAC4                      | target file NIMA format for UCAC4 solution
|                     |  | |astrometry_target_NIMA_UCAC5                      | target file NIMA format for UCAC5 solution
|                     |  | |astrometry_target_NIMA_GAIA1                      | target file NIMA format for GAIA_1 solution
|                     |  | |astrometry_target_NIMA_GAIA2                      | target file NIMA format for GAIA_2 solution
|                     |  | |astrometry_target_NIMA_GAIA3                      | target file NIMA format for GAIA_3 solution
|                     |  | |astrometry_target_NIMA_GAIA4                      | target file NIMA format for GAIA_4 solution
|                     |  | |astrometry_target_NIMA_GAIA5                      | target file NIMA format for GAIA_5 solution
|                     |  | |astrometry_target_NIMA_GAIA6                      | target file NIMA format for GAIA_6 solution
|                     |  | |astrometry_target_NIMA_GAIA7                      | target file NIMA format for GAIA_7 solution
|                     |  | |astrometry_target_NIMA_CUSER                      | target file NIMA format for User reference catalogue solution
|                     |  | |C                                                 | object type for target MPC output format only
|                     |  | |R                                                 | magnitude bandpass for target MPC output format only
|                     |  | |W84                                               | IAU code of observation site or user-based site designation for target NIMA/MPC output formats only
|                     |  | |U                                                 | User's reference catalogue code for target NIMA/MPC output formats only
|                     |  | |ucac4.rad.xy                                      | extension of "xy" output files, UCAC4 reduction
|                     |  | |ucac5.rad.xy                                      | extension of "xy" output files, UCAC5 reduction
|                     |  | |gaia1.rad.xy                                      | extension of "xy" output files  GAIA_1 reduction
|                     |  | |gaia2.rad.xy                                      | extension of "xy" output files  GAIA_2 reduction
|                     |  | |gaia3.rad.xy                                      | extension of "xy" output files  GAIA_3 reduction
|                     |  | |gaia4.rad.xy                                      | extension of "xy" output files  GAIA_4 reduction
|                     |  | |gaia5.rad.xy                                      | extension of "xy" output files  GAIA_5 reduction
|                     |  | |gaia6.rad.xy                                      | extension of "xy" output files  GAIA_6 reduction
|                     |  | |gaia7.rad.xy                                      | extension of "xy" output files  GAIA_7 reduction
|                     |  | |cuser.rad.xy                                      | extension of "xy" output files, User reference catalog reduction
|                     |  | |1.0                                               | time instant tolerance for target identification (seconds)
|                     |  | |2.0                                               | position error radius for target identification (arcsec)
|                     |  | |0.263                                             | pixel scale (arcsec/pixel)
|                     |  | |0.002                                             | +/- error of pixel scale (arcsec/pixel)
|                     |  | |2                                                 | Automatic catalogue <-> (x,y) identification: 1 - same N-S/E-W orientation & pixel scale;  2 - mixed images
|                     |  | |-90000                                            | ADU minimum count cutoff (ex.: -10,0,...); if cutoff < 0, pixel counts are reset: new count = original - cutoff
|                     |  | |1                                                 | Pixel physical counts: 0 = from image header or 1 = from user (here)
|                     |  | |1.0d0                                             | Pixel physical counts: bscale;  Pixel = bscale * matrix + bzero
|                     |  | |0.0d0                                             | Pixel physical counts: bzero ;  Pixel = bscale * matrix + bzero
|                     |  | |-99                                               | bitpix: -99 reads from image header; otherwise use 16, 32, 64, -32, -64 following FITS conventions
|                     |  | |0                                                 | litteendian x bigendian: byte-swap (0 = automatic; 1 = don't swap ; 2 = swap bytes)
|                     |  | |1                                                 | Sample a pixel to check for image reading configurations? (1) yes; (2) no
|                     |  | |2                                                 | Actually fit trace-shaped objects identified in the images? (1) Yes; (2) No.
|                     |  | |0.8                                               | Object detection .:. excentricity cutoff for identification of rounded/trace-shaped objects (suggestion: e = 0.8)
|                     |  | |0.10                                              | Object detection .:. minimum allowed FWHM range
|                     |  | |05.0                                              | Object detection .:. maximum allowed FWHM range
|                     |  | |2                                                 | Object detection .:. ring width (in pixels) in circular spiral search (suggestion: 1 or 2 pixels)
|                     |  | |5                                                 | Object detection .:. step (in pixels) of rectangular perimeter delimitation of trace-shaped objects (suggestion: N pixels equivalent to 1 FWHM)
|                     |  | |3.0000                                            | Object detection (rounded-shaped PSFs) .:. ADU noise threshold FACTOR: pixel - sky > FACTOR * ADU_sigma
|                     |  | |0005.00                                           |   PSF   fitting  (rounded-shaped PSFs) .:. pixel elimination, ADU threshold FACTOR: pixel - PSF > FACTOR * PSF_sigma
|                     |  | |0.01                                              |   PSF   fitting  (rounded-shaped PSFs) .:. PSF_sigma convergence FACTOR:  PSF_sigma(i+1) - PSF_sigma(i) < FACTOR
|                     |  | |0.001                                             |   PSF   fitting  (rounded-shaped PSFs) .:. PSF centroid convergence THRESHOLD (mas): PSFxy_centroid(i+1) - PSFxy_centroid(i) < THRESHOLD
|                     |  | |30                                                |   PSF   fitting  (rounded-shaped PSFs) .:. Limit number of internal L.S. fitting iterations
|                     |  | |10                                                |   PSF   fitting  (rounded-shaped PSFs) .:. Limit number of external L.S. fitting iterations (FWHM-radius fitting region convergence)
|                     |  | |1000.00                                           | Object detection (trace-shaped PSF) .:. ADU noise threshold FACTOR: pixel - sky > FACTOR * ADU_sigma
|                     |  | |0003.00                                           |   PSF  fitting   (trace-shaped PSF) .:. pixel elimination, ADU threshold FACTOR: pixel - PSF > FACTOR * PSF_sigma
|                     |  | |0.01                                              |   PSF  fitting   (trace-shaped PSF) .:. PSF_sigma convergence FACTOR:  PSF_sigma(i+1) - PSF_sigma(i) < FACTOR
|                     |  | |0.001                                             |   PSF  fitting   (trace-shaped PSF) .:. PSF centroid convergence THRESHOLD (mas): PSFxy_centroid(i+1) - PSFxy_centroid(i) < THRESHOLD
|                     |  | |30                                                |   PSF  fitting   (trace-shaped PSF) .:. Limit number of L.S. fitting iterations
|                     |  | |200                                               | No. of brightest GAIA_1 stars for cross-identification with brightest measured (x,y) objects
|                     |  | |20                                                | No. of brightest measured (x,y) objects for cross-identification with brightest GAIA_1 stars
|                     |  | |2.0                                               | Expansion/contraction factor for (RA,Dec) FOV sizes in star catalogue extraction (factor = 1 means no expansion/contraction)
|                     |  | |20                                                | RA  area cutoff for brightest GAIA_1 stars search around FOV's projection center (arcmin)
|                     |  | |20                                                | Dec area cutoff for brightest GAIA_1 stars search around FOV's projection center (arcmin)
|                     |  | |0.5                                               | error radius (arcsec) for cross-identification between brightest catalogue/measured objs
|                     |  | |0.120                                             | (O-C) cutoff for outliers in (RA,DEC) reductions with UCAC4  catalogue
|                     |  | |0.030                                             | (O-C) cutoff for outliers in (RA,DEC) reductions with UCAC5  catalogue
|                     |  | |0.030                                             | (O-C) cutoff for outliers in (RA,DEC) reductions with GAIA_1 catalogue
|                     |  | |0.030                                             | (O-C) cutoff for outliers in (RA,DEC) reductions with GAIA_2 catalogue
|                     |  | |0.030                                             | (O-C) cutoff for outliers in (RA,DEC) reductions with GAIA_3 catalogue
|                     |  | |0.030                                             | (O-C) cutoff for outliers in (RA,DEC) reductions with GAIA_4 catalogue
|                     |  | |0.030                                             | (O-C) cutoff for outliers in (RA,DEC) reductions with GAIA_5 catalogue
|                     |  | |0.030                                             | (O-C) cutoff for outliers in (RA,DEC) reductions with GAIA_6 catalogue
|                     |  | |0.030                                             | (O-C) cutoff for outliers in (RA,DEC) reductions with GAIA_7 catalogue
|                     |  | |0.030                                             | (O-C) cutoff for outliers in (RA,DEC) reductions with user's reference catalogue
|                     |  | |3                                                 | polynomial (x,y) <-> (X,Y) in (RA,DEC) reductions: 0 = 4 Ctes; 1 to 3 = complete order
|                     |  | |0                                                 | radial distortion of 3rd order (x,y) <-> (X,Y) in (RA,DEC) reduction: 0 = no; 3 = yes
|                     |  | |0                                                 | radial distortion of 5th order (x,y) <-> (X,Y) in (RA,DEC) reduction: 0 = no; 5 = yes
|                     |  | |000                                               | first field (image, xy PRAIA file) to proccess  .:. zero for first and last fields -> proccess all fields
|                     |  | |000                                               | last  field (image, xy PRAIA file) to proccess  .:. zero for first and last fields -> proccess all fields
|                     |  | |0635                                              | x coordinate center for plot of trace-shaped image (analysis purposes)
|                     |  | |0530                                              | y coordinate center for plot of trace-shaped image (analysis purposes)
************************************************************************************************************************************************************************************************************




GAIA_1 - complete GAIA catalogue

GAIA_2 - GAIA catalogue within magnitude range furnished by the user



Typical pixel scales of some instruments (1x1 pixel binning)  (error = 0.01 arcsec/pixel or less)


(arcsec/pixel) - instrument

0.1765         - LNA 1.6m P&E / CCD105
0.1710         - LNA 1.6m P&E / S800
0.1800         - LNA 1.6m P&E / Ikon
0.2940         - LNA 1.6m P&E / CCD106
0.3100         - LNA 1.6m P&E / CCD301

0.3460         - LNA 0.6m B&C / CCD105
0.3500         - LNA 0.6m B&C / S800
0.3352         - LNA 0.6m B&C / Ikon
0.6166         - LNA 0.6m B&C / CCD 106
0.6000         - LNA 0.6m B&C / CCD 301


0.1850         - 3.6m MegaCam CFHT, Hawaii

0.0770         - 4m SOAR/SOI, Chile

0.2380         - 2.2m ESO2p2/WFI, Chile

0.6800         - 2.2m Observatoire de Haute-Provence (OHP), France

0.8600         - 1m Pic du Midi, France

0.4572         - 1.5m Sierra Nevada, Spain

0.5027         - 3.5m Calar Alto, Spain

0.5248         - 2.2m Calar Alto CAFO, Spain

0.5019         - 1.23m Calar Alto, Spain

0.4350         - 40cm Las Campanas Astrograph, Chile

0.6989         - 77cm La Hita, Spain

1.4698         - 45cm Astrograph for the Southern Hemisphere, Cerro Burek (CASLEO, San Juan), Argentina

1.7523         - 70cm AZT8 Tubitak telescope, Turkey

0.6187  (?)    - 1.5m Tubitak Russian-Turkish telescope, Turkey





MPC/NIMA reference  catalogue codes:


http://www.minorplanetcenter.org/iau/info/CatalogueCodes.html

```
Char   Catalogue
  a    USNO-A1.0
  b    USNO-SA1.0
  c    USNO-A2.0
  d    USNO-SA2.0
  e    UCAC-1
  f    Tycho-1
  g    Tycho-2
  h    GSC-1.0
  i    GSC-1.1
  j    GSC-1.2
  k    GSC-2.2
  l    ACT
  m    GSC-ACT
  n    SDSS-DR8
  o    USNO-B1.0
  p    PPM
  q    UCAC-4
  r    UCAC-2
  s    USNO-B2.0
  t    PPMXL
  u    UCAC-3
  v    NOMAD
  w    CMC-14
  x    Hipparcos 2
  y    Hipparcos
  z    GSC (version unspecified)
  A    AC
  B    SAO 1984
  C    SAO
  D    AGK 3
  E    FK4
  F    ACRS
  G    Lick Gaspra Catalogue
  H    Ida93 Catalogue
  I    Perth 70
  J    COSMOS/UKST Southern Sky Catalogue
  K    Yale
  L    2MASS
  M    GSC-2.3
  N    SDSS-DR7
  O    SST-RC1
  P    MPOSC3
  Q    CMC-15
  R    SST-RC4
  S    URAT-1
  T    URAT-2
  U    Gaia-DR1
  V    Gaia-DR2
```
