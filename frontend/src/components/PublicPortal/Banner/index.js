import React from 'react'
import { Grid, Card, CardContent } from '@material-ui/core';
import styles from './styles'
import './styles.css'

function PublicBanner() {
  const classes = styles()

  return (
    <div className={classes.root}>
      <Grid container direction='row' justifyContent='space-between' spacing={2} className={classes.container}>
        <Grid item xs={12} className={classes.titleWrapper} alignItems='flex-start'>
          <img src={`${process.env.PUBLIC_URL}/img/tno_logo_projetos.png`} alt='Data Release Interface' className={classes.logo} />
          <h1 className={classes.title}>LIneA Solar System Portal</h1>
        </Grid>
        <Grid item xs={12} container className={classes.bannerWrapper} alignItems='flex-end'>
          <div className="container textBanner">
            <Grid xs={12} className={classes.textTitleOcultatiom}><label>Ocultation</label></Grid>
            <Grid xs={12} className={classes.textOcultatiom}><label >Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla porttitor dui ipsum, ultricies placerat orci venenatis vel. In varius tortor tempus, feugiat nulla nec, tempus leo. Lorem ipsum dolor sit amet, consectetur adipiscing elit...</label></Grid>
            <Grid xs={12} className={classes.bannerWrapper}  alignItems='flex-end'><label>read more</label></Grid>
          </div>
        </Grid>
      </Grid>
    </div>
  )
}

export default PublicBanner
