# Frequently Asked Questions

## What are the main data sources used in the predictions?

All predictions are computed using the PRAIA package ([Assafin et al. 2010](https://ui.adsabs.harvard.edu/abs/2010gfss.conf...85A/abstract), [Assafin 2023a](https://ui.adsabs.harvard.edu/link_gateway/2023P&SS..23805801A/doi:10.1016/j.pss.2023.105801), [Assafin 2023b](https://ui.adsabs.harvard.edu/link_gateway/2023P&SS..23905816A/doi:10.1016/j.pss.2023.105816)) and the search of events is limited to stars with magnitude up to 18. The limiting magnitude is imposed because it would be impossible for most observers to register events with high cadence on fainter stars without powerful telescopes and expensive cameras. We can, however, compute predictions at higher magnitudes for objects on demand. Below, we list the sources and versions of our inputs.

| Element             | Source   | Version         |
| ------------------- | -------- | --------------- |
| Object ephemeris    | JPL/Nasa | Latest availabe |
| Planetary ephemeris | JPL/Nasa | de440           |
| Leap Second Kernel  | JPL/Nasa | NAIF0012        |
| Star Catalog        | Gaia     | DR3             |
| Step Size           | 60 s     | --              |

## Why can't I find occultations for a specific object?

It is possible to search for the occultations by an object using its designation or provisional designation. In the latest, note that you should include a space between the year and the letters for its designation, for example, search for "2003 VS2" not "2003VS2". Note that the search field is **not** case sensitive.

If you type in the name of an object and it does not show up in the drop-down list, there are no occultation predictions for that object at that time.

## Will a prediction always result in an observed occultation?

No. It is important to note that predictions are made based on the available orbit information at the time of computation. Some orbits may be poorly constrained, which can result in predictions that may not come to fruition. Note in the Occultation Prediction Map that there are red dashed lines showing the occultation uncertainty, providing insights into the accuracy of a given prediction. Our aim is to provide users with the most reliable and informative predictions possible, while also acknowledging the limitations of the available data.

## Can I select multiple asteroids to apply the filter?

Yes. When you filter objects by name, you can select a set of arbitrary objects. Just type in each object name at a time and select it from the drop-down list. Similarly, you can remove one by one from the list. If an object does not appear in the drop-down list, there are no occultations predictions for that object at that time.

## Why is the geolocation filter failing?

The geolocation filter is still an experimental feature and is computationally very demanding. To be successful, you should narrow down the number of occultation events up to a maximum of 500 and only then apply it. During low demanding usage you should be fine applying the filter up to 2000 events, however we strongly advise to always narrow down using a proper time interval, magnitude limit, and/or set of objects selected by name or dynamical class. If you start the geolocation filter with too many events, it will fail by timeout, sometimes without warning.
