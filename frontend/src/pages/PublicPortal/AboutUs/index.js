/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable react/style-prop-object */
/* eslint-disable react/jsx-indent */
/* eslint-disable max-len */
import React from 'react'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
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
    <Box className={classes.initContainer}>
      <Container maxWidth='lg'>
        <Grid item xs={12} className={classes.grid}>
          <Breadcrumbs aria-label='breadcrumb'>
            <Link color='inherit' to='/'>
              Home
            </Link>
            <Typography color='textPrimary'>About Us</Typography>
          </Breadcrumbs>
          <Card sx={{ margin: '16px 0' }}>
            <CardContent>
              <Grid item md={9} sm={10} className={classes.grid}>
                <Typography gutterBottom className={classes.textFormat} component='h2'>
                  <Box>
                    <p>
                      <strong>
                        <em>About</em>
                      </strong>
                    </p>
                    <p>
                      <span>
                        <p>
                          This database is tailored to streamline access to predictions of stellar occultations by small bodies in the Solar
                          System. Through the integration of orbital data for these celestial objects, the Gaia stellar catalog, and our
                          software infrastructure, we generate updated predictions utilizing high-performance computing. Our goal is to
                          assist both amateur and professional astronomers by offering easily accessible occultation forecasts. These
                          platform aid observational planning and is also a preparation step for the forthcoming Legacy Survey of Space and
                          Time (LSST) era. Accurate predictions rely on up-to-date celestial motion knowledge and precise star charts,
                          enabling astronomers to anticipate upcoming occultations. Users can explore forthcoming events in their locality
                          or any region of interest.
                        </p>
                      </span>
                    </p>
                  </Box>
                </Typography>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Container>
    </Box>
  )
}

export default PublicAboutUs
