import React from 'react'
import Grid from '@material-ui/core/Grid'
import Container from '@material-ui/core/Container'
import Typography from '@material-ui/core/Typography'
import styles from './styles'

function PublicInterfaces() {
  const classes = styles()

  return (
    // <Container>
    <>
      <br></br>
      <Grid container justifyContent="center" alignItems="center">
        <div className={classes.titleItem}><label>SSSOs Stellar Occultation Prediction Database</label></div><br></br>     
      </Grid><br></br>
      <Grid container justifyContent="center" alignItems="center">       
        <div><label>(Last update: 2023-05-12)</label></div>
      </Grid><br></br><br></br>
      <Grid container>
        <Typography>This is a database of predictions for stellar occultations by small Solar System objects, calculated from the legacy positions provided by the Dark Energy Survey (DES) and the constantly updated positions from the Minor Planet Center (MPC). These predictions are regularly updated. Use our advanced filters to refine your search and find more suitable events.
        </Typography>
      </Grid>
      </>
    // </Container>
  )
}

export default PublicInterfaces
