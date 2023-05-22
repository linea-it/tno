import React from 'react'
import Grid from '@material-ui/core/Grid'
import Container from '@material-ui/core/Container'
import Typography from '@material-ui/core/Typography'
import styles from './styles'

function PublicInterfaces() {
  const classes = styles()

  return (
    <Container>
      <br></br>
      <Grid container justifyContent="center" alignItems="center">
        <div className={classes.titleItem}><label>Prediction of stellar occultations by Solar System Objects</label></div><br></br>     
      </Grid><br></br>
      <Grid container justifyContent="center" alignItems="center">       
        <div><label>(Last update: 2023-05-12)</label></div>
      </Grid><br></br><br></br>
      <Grid container>
        <Typography>This page presents the prediction of stellar occultations by Solar System Objects (Main Belt Asteroids, Trans-Neptunian Objects, Centaurs, Trojans, among others) observed by the Dark Energy Survey for forthcoming months. These predictions are made in the Solar System Portal of LIneA project (led by L. N. da Costa) and in collaboration with 11 tech.
          <br></br>You can select the events by period, dynamic class and visibility in a specific place (longitude and latitude):
        </Typography>
      </Grid>
    </Container>
  )
}

export default PublicInterfaces
