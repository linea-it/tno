import React from 'react'
import { Grid, Link } from '@material-ui/core';
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
            <Grid xs={12} className={classes.textTitleOcultatiom}><label>Stellar Occultation</label></Grid>
            <Grid xs={12} className={classes.textOcultatiom}><label >A Stellar Occultation is an astronomical event that occurs when the flux of the light from a star is temporarily blocked by a Solar System Object passing in front of it for an specific observer on Earth. This technique allows the determination of sizes and shapes with accuracy comparable to observations by spacecraft and also provides information about the object's surroundings, such as: atmosphere, rings, jets, among other structures around the body.</label></Grid>
            <Grid xs={12} className={classes.bannerWrapper} alignItems='flex-end'><Link color='inherit' href="/publicOccultation"
              target="_self" className={classes.menuLink}><label>read more</label></Link></Grid>
          </div>
        </Grid>
      </Grid>
    </div>
  )
}

export default PublicBanner
