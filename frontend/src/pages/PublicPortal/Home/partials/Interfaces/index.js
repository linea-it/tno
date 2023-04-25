import React from 'react'
import Grid from '@material-ui/core/Grid'
import Container from '@material-ui/core/Container'
import Typography from '@material-ui/core/Typography'
import styles from './styles'

function PublicInterfaces() {
  const classes = styles() 

  return (
    <Container className={classes.mainContainer}>
      <br></br>
      <Grid container spacing={2}>
        <div className={classes.titleItem}><label>Lorem</label></div>
        <Typography>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla porttitor dui ipsum, ultricies placerat orci venenatis vel. In varius tortor tempus, feugiat nulla nec, tempus leo. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse tincidunt imperdiet metus, a tempor purus vehicula sed. Aenean nec velit vitae ex cursus ultricies. Ut vitae finibus est, sed fringilla lorem. Nam sit amet ipsum placerat, vehicula lectus ut, consequat dolor. Vestibulum efficitur ligula sapien, ac vehicula mauris sodales non. Vestibulum finibus magna vulputate lacus pretium, vel sollicitudin elit tincidunt. Donec turpis elit, facilisis id massa vel, elementum lobortis velit. Praesent sit amet lobortis nulla, vitae facilisis nisi. Mauris vitae blandit mauris. Duis luctus metus vitae dolor tempus, sit amet viverra magna hendrerit.</Typography>
      </Grid>
    </Container>
  )
}

export default PublicInterfaces
