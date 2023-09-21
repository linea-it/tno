/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable react/style-prop-object */
/* eslint-disable react/jsx-indent */
/* eslint-disable max-len */
import React from 'react'
import { Grid, Container, Typography, Breadcrumbs, Link } from '@material-ui/core'
import styles from './styles'
import {OccultationImagesFirstRow, OccultationImagesSecondRow} from './partials/index'
function PublicDocumentation() {
  const classes = styles()
  return (
    <div className={classes.initContainer}>
      <Container>
        <Grid item xs={12} className={classes.grid}>
          <Breadcrumbs aria-label='breadcrumb'>
            <Link color='inherit' to='/'>
              Home
            </Link>
            <Typography color='textPrimary'>Documentation</Typography>
          </Breadcrumbs>
          <Typography gutterBottom className={classes.textFormat} variant='overline' component='h2'>
            <Grid item md={7} sm={10} className={classes.grid}>
              <div>
                <p>
                  <strong>
                    <em>Filtering Occultations</em>
                  </strong>
                </p>
                <p>
                  <span>
                    <p>In this database, we have a vast number of stellar occultation predictions. Let's explore some filtering options to help you find more interesting events. Along with advanced filters, you can also sort the output lists by any visible (or hidden) column.</p>
                    <p>The <b>Period filter</b> allows you to constrain the date range of interest.</p>
                    <p><b>All events</b> displays every event available in our database.</p>
                    <p>The <b>Next 20 events</b> will show the upcoming 20 occurrences based on the current access date.</p>
                    <p>If you choose <b>User Selected</b>, you gain access to more advanced options to refine your events as follows:</p>
                    <ol>
                      <li><em>Date range:</em> Select an initial and final date range of interest.</li>
                      <li><em>Filter Type:</em> Customize the name or dynamical type of the objects of interest.
                        <ul>
                          <li>When choosing <b>Object name</b>, you can type the asteroid number or designated name in the <b>Filter Value</b> field to perform a lookup in the database. If the object doesn't show up during typing, it means it's not registered in our database.</li>
                          <li>When selecting <b>Dynamical class</b> or <b>Dynamical class (with subclasses)</b>, you can choose the relevant class or subclass in the <b>Filter Value</b> field.</li>
                        </ul>
                      </li>
                      <li><em>Magnitude:</em> Filter events based on the stellar magnitude range of interest. The default value is 14, but predictions are available for much deeper values.</li>
                      <li><em>Geo Filter</em> (experimental): This feature allows finding occultations occurring within a specified latitude and longitude on Earth, with a given radius in kilometers. Please note that due to its time-consuming nature, <b>you must use other filters in advance to reduce the list to a maximum of 200 predictions</b>. This is necessary to avoid server timeouts since the default connection limit is 120 seconds. Sorting is disabled by default when using the Geo Filter. We are working to make this functionality faster in future releases.</li>
                    </ol>
                    <p>Direct API search methods will be available soon.</p>
                  </span>
                </p>
              </div>
            </Grid>
          </Typography>
          <Typography gutterBottom className={classes.textFormat} variant='overline' component='h2'>
            <Grid item md={7} sm={10} className={classes.grid}>
              <div>
                <p>
                  <strong>
                    <em>What is a stellar occultation?</em>
                  </strong>
                </p>
                <p>
                  <span>
                  <p>
                    Stellar Occultation is an astronomical event that occurs when the light of a star is temporarily 
                    blocked by an object passing in front of it from the perspective of the observer's referential. <em>Figure 1</em> illustrates the geometry of a stellar occultation by a small solar system object 
                    being observed from the Earth's surface, and the animation in <em>Figure 2</em> shows an example of a 
                    stellar occultation observed from a telescope on Earth. If the observer is in the path of 
                    the shadow (white markers in Fig. 1), it will observe the star abruptly disappear/reappear as 
                    the small airless body moves in front of it. Therefore, we can acquire images as quickly as possible 
                    (Figure 2) to measure the stellar flux as a function of time and derive the occultation light curve.
                  </p>
                  <div className={classes.root}>
                      <OccultationImagesFirstRow />
                  </div>
                  <p>
                  <em>Figure 3</em> presents two examples of occultation light curves: i) a positive detection of the 
                  event, which means that the observer was inside the shadow path (Figure 2), and ii) a negative 
                  observation, where the star did not disappear because the observer was outside the region of the 
                  shadow. Using many positive and negative records of the same stellar occultation event, we can 
                  reproduce the shape and size of the object. For example, the TNO's most successful observation of a 
                  stellar occultation happened on August 8, 2020. At the time, the dwarf planet candidate named (307261) 
                  2002 MS4 occulted a star, and the event was observed from 116 telescopes based in Europe, North Africa, 
                  and Western Asia. Such extensive data allowed us to determine the object’s size and shape with sub-Km 
                  precision. Also, it allowed the detection and characterization of a 320 km wide topography at the 
                  northeast region of the observed limb (see the complete analysis on Rommel et al. submitted). <em>Figure 4</em> shows the object’s observed limb as proposed by the authors in gray color, with a 
                  zoom in the measured topography – a 25 Km high mountain followed by a 45 Km deep depression.
                  </p>
                  <div className={classes.root}>
                      <OccultationImagesSecondRow />
                  </div>
                  <p>
                  Observations of stellar occultations with fast CCD cameras that allow for short exposures and no dead 
                  time also permitted the discovery of ring systems around small solar system objects. The first small 
                  body with rings was (10199) Chariklo. This asteroid shares its orbital path with the giant planets and, 
                  therefore, is classified dynamically as a Centaur object (see Braga-Ribas et al. 2014). This discovery 
                  opened a new field of research, the dynamics of rings around small solar system objects. It has been 
                  quite challenging to explain how such a small object (~250 Km wide) can maintain such tiny structures 
                  stable around it (these rings have a width of 4 to 7 km only). To make things even more complex, in 2017, 
                  another ring was found around (136108) Haumea, a Transneptunian object (TNO for short) that orbits 
                  the sun beyond Neptune's orbit (Ortiz et al., 2017). This object is in a colder region, is much larger 
                  than Chariklo, rotates quickly, and has a sizeable elongated shape, two known satellites, and an 
                  equatorial ring. What mechanisms are involved in maintaining ring systems around two objects that are 
                  so different? May rings be a typical structure around outer solar system minor bodies? Since then, we 
                  have tried to get even more accuracy when observing occultations to investigate TNOs' surroundings. 
                  Also, we have been revising older data sets, searching for signatures in the light curves. The international 
                  collaboration's effort revealed an even more impressive ring system around (50000) Quaoar, one of the 
                  largest known TNOs (Morgado et al., 2023; Pereira et al., 2023). This time, the rings are farther from 
                  the main body than expected and the discovery again reaches out substantial questions about the physics 
                  and dynamics of particles around small bodies. In summary, stellar occultations allow for detecting, 
                  characterizing, and following up objects and their sub-km structures at the boundaries of the Solar 
                  System using Earth-based observations.
                  </p>

                  </span>
                </p>
              </div>
            </Grid>
          </Typography>
        </Grid>
      </Container>
    </div>
  )
}

export default PublicDocumentation
