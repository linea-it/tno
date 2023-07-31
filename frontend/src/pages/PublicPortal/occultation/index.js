/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable react/style-prop-object */
/* eslint-disable react/jsx-indent */
/* eslint-disable max-len */
import React from 'react'
import { Grid, Container, Typography, Breadcrumbs, Link } from '@material-ui/core'
import styles from './styles'

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
                    <em>Stellar Occultation</em>
                  </strong>
                </p>
                <p>
                  <span>
                    A Stellar Occultation is an astronomical event that occurs when the flux of the light from a star is temporarily blocked by a Solar System Object passing in front of it for an specific observer on Earth. This technique allows the determination of sizes and shapes with accuracy comparable to observations by spacecraft and also provides information about the object's surroundings, such as: atmosphere, rings, jets, among other structures around the body.
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
