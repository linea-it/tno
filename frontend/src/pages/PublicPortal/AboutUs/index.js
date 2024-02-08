/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable react/style-prop-object */
/* eslint-disable react/jsx-indent */
/* eslint-disable max-len */
import React from 'react'
import Grid from '@mui/material/Grid'
import Container from '@mui/material/Container'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Link from '@mui/material/Link'
import styles from './styles'

function PublicAboutUs() {
  const classes = styles()
  return (
    <div className={classes.initContainer}>
      <Container>
        <Grid item xs={12} className={classes.grid}>
          <Breadcrumbs aria-label='breadcrumb'>
            <Link color='inherit' to='/'>
              Home
            </Link>
            <Typography color='textPrimary'>About Us</Typography>
          </Breadcrumbs>
          <Card style={{ margin: '16px 0' }}>
          <CardContent>
          <Typography gutterBottom className={classes.textFormat} variant='overline' component='h2'>
            <Grid item md={9} sm={10} className={classes.grid}>
              <div>
                <p>
                  <strong>
                    <em>About us</em>
                  </strong>
                </p>
                <p>
                  <span>
                  <p>
                  LIneA is a multi-user laboratory supported by the Brazilian National Laboratory for Scientific Computing
                  (LNCC) and the Brazilian National Education and Research Network (RNP). It was created to support Brazilian
                  participation in large astronomical surveys, and since then, it has been managing a comprehensive infrastructure
                  for storing, processing, analyzing, and distributing astronomical data. LIneA association comprises researchers
                  in the Astronomy field, professors from many universities in Brazil, students, Data Scientists, technicians,
                  and others. This diverse team has made great effort to develop the TNO portal, a public tool that predicts
                  stellar occultation events by the small solar system objects observed by the DES survey. The Dark Energy Survey
                  (DES) is an international, collaborative effort to map the Southern skies to observe galaxies, supernovae,
                  find patterns of cosmic structure and study the dark energy. However, as a subproduct,thousands of small Solar
                  System bodies are found in the DES images. Therefore, part of our team of researchers identified the
                  known ones in those images, measured their positions, refined their orbits, and predicted stellar occultations
                  by them that are publicly available on the TNO portal.
                  </p>
                  <p>
                  Soon, this portal will also publish the stellar occultation events by small solar system bodies detected by the
                  LSST survey. The Legacy Survey of Space and Time (LSST) is a planned 10-year survey of the southern sky under
                  construction on Cerro Pachón - Chile. The survey data will be processed and analyzed by an international collaboration
                  of researchers from many fields in Astronomy. Among other aims, the survey will enable accurate measurements of
                  small objects' position and flux. Such data will allow us to refine asteroids' orbits, predict stellar
                  occultations, and determine their flux variations with time.
                  </p>
                  </span>
                </p>
              </div>
            </Grid>
          </Typography>
          </CardContent>
          </Card>
        </Grid>
      </Container>
    </div>
  )
}

export default PublicAboutUs
