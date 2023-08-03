/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable react/style-prop-object */
/* eslint-disable react/jsx-indent */
/* eslint-disable max-len */
import React from 'react'
import { Grid, Container, Typography, Breadcrumbs, Link } from '@material-ui/core'
import styles from './styles'
import {OccultationImagesFirstRow, OccultationImagesSecondRow} from './partials/index'
function PublicOccultation() {
  const classes = styles()
  return (
    <div className={classes.initContainer}>
      <Container>
        <Grid item xs={12} className={classes.grid}>
          <Breadcrumbs aria-label='breadcrumb'>
            <Link color='inherit' to='/'>
              Home
            </Link>
            <Typography color='textPrimary'>Stellar Occultation</Typography>
          </Breadcrumbs>
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

export default PublicOccultation
