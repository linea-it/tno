<!-- 03-2024-ca-uncertainties-release.md -->

# Predictions with CA Uncertainties

Release date: September 5th, 2024.

Main updates include the computation of uncertainties related to the the closest approach, and includes the newly developed python module lineaSSP to retrive predictions programatically. It also offers a new filtering option by the shaddow path uncertainty in kilometers.

At this stage occultation predictions are computed only for the outer Solar System objects including **Trojans**, **Centaurs**, **Kuiper Belt**, and **inner Oort Cloud** objects.

The total number of predictions also include a small percentage of events that happen strictly during the day, which are in very special cases of interest to some astronomers.

Below are the description of the main input sources and the outputs produced in this release.

| Description                                            | Value                                       |
| ------------------------------------------------------ | ------------------------------------------- |
| Number of asteroids with predictions (at release date) | 18,835                                      |
| Number of events (at release date)                     | 2,375,049                                   |
| Earliest prediction (at release date)                  | Jan, 1st 2024                               |
| Latest prediction (at release date)                    | Oct, 31st 2025                              |
| Asteroid dynamical classes included (at release date)  | Centaur <br/>Trojan <br/>Kuiper Belt Object |
| Source of asteroids ephemerides                        | JPL/NASA                                    |
| Source of planetary ephemerides                        | de440 - JPL/NASA                            |
| Leap second kernel                                     | NAIF0012 - JPL/NASA                         |
| Source of star catalog                                 | Gaia DR3 / ESA                              |
