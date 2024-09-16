# Occultation Detail Page

The occultation details page aggregates information not only about the event but also about the occulted star and the object and also includes a generic map for this occultation prediction.

### Occultation Prediction Circumstances

Organizes specific information and parameters that, in general, are the product of the occultation prediction calculation.

**Instant of the closest approach:** Date and time of the occultation, in UTC.<br>
**Star position (ICRF):** Right ascension and declination with assumed proper motion, in ICRF/J2000.<br>
**Closest approach:** Geocentric closest approach, in arcsec.<br>
**Position angle:** Planet position angle with respect to star at closest approach, in degrees.<br>
**Velocity:** Velocity in the plane of the sky. Positive is prograde, negative is retrograde. In km/s.<br>
**Geocentric distance:** Distance between the object and the Earth's geocenter, at closest approach, in au.<br>
**Event duration:** Estimate of the event duration, in seconds. Only defined for objects with known diameter.<br>
**Star magnitude (Gaia):** Star G magnitude from Gaia DR3 catalog.<br>
**Moon separation:** Moon angular distance to the object, as seen from the Earth's geocenter, in degrees.<br>
**Sun elongation:** Sun angular distance to the object, as seen from the Earth's geocenter, in degrees.<br>
**Creation date:** Date and time of the prediction computation.<br>

### Occultation Prediction Map

Maps for occultation prediction are not available for all events as they are generated periodically due to the large number of events available. For events where a prediction map does not exist, it is generated on demand when the event prediction details page is loaded. Note that generating the map can take up to a minute.

Maps are generated using the [SORA](https://sora.readthedocs.io/) library. To generate personalized and detailed maps, visit the module documentation. When using the map provided in your publications, check the protocols for adequately citing sources as described in this documentation.

### Occulted Star

Brings information about the hidden star, generally from the Gaia stellar catalog.

**Star astrometric position in catalogue (ICRF):** Astrometric right ascension and declination of the star, in ICRF/J2000, in degrees.<br>
**Proper motion:** Star proper motion in right ascension and declination, in mas/year.<br>
**Source of proper motion:** Catalog source for proper motion.<br>
**Uncertainty in star position:** Uncertainty in right ascension and declination position of the star, in mas.<br>
**G magnitude (source: Gaia DR3):** Star G magnitude.<br>
**RP magnitude (source: Gaia DR3):** Star RP magnitude.<br>
**BP magnitude (source: Gaia DR3):** Star BP magnitude.<br>

### Object

Brings information about the occulting object. The orbital parameters are sourced from the Minor Planet Center ([MPCORB](https://minorplanetcenter.net/iau/MPCORB.html)). Diameter, when available, is sourced from the [Virtual Observatory Solar system Open Database Network](https://ssp.imcce.fr/webservices/ssodnet/) at IMCCE (when using this information in your publications, please check their protocols for adequately citing the source). We also provide links to further information on the object at [SsODNet service](https://ssp.imcce.fr/webservices/ssodnet/) at IMCCE and [Small-Body Database Lookup](https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/) at JPL/NASA.

**Object:** Name or provisional designation. Numeration is shown in parenthesis when the object is numbered.<br>
**Object's astrometric position (ICRF):** Object's astrometric right ascension and declination, in ICRF/J2000.<br>
**Absolute magnitude:** Absolute magnitude H of the object as defined by the Minor Planet Center.<br>
**Apparent magnitude:** Apparent magnitude of the object at closest approach instant. Estimated from parameters H and G provided by the Minor Planet Center.<br>
**Diameter:** Diameter of the object, when known. Displayed in kilometers (or meters for small diameters).<br>
**Apparent diameter:** Apparent diameter of the object on the plane of the sky at closest approach instant, in mas.<br>
**Dynamic class (Skybot):** Dynamic classification and sub-classification as defined by Skybot (IMCCE).<br>
**Semi-major axis:** Semi-major axis of the object's orbit, in au.<br>
**Eccentricity:** Eccentricity of the object's orbit, in degrees.<br>
**Inclination:** Inclination of the object's orbit, in degrees.<br>
**Perihelion:** Closest point to the Sun in the object's orbit, in au.<br>
**Aphelion:** Farthest point to the Sun in the object's orbit, in au.<br>
