import React from 'react'
import Grid from '@mui/material/Grid'
import styles from './styles'
import Box from '@mui/material/Box'
import Subscribe from '../../../components/Subscription/index'
import { AlignHorizontalCenter } from '../../../../node_modules/@mui/icons-material/index'

function PublicBanner() {
  const classes = styles()

  return (
    <Box className={classes.root}>
      <Grid container direction='row' justifyContent='space-between' spacing={2} className={classes.container}>
        <img src={`${process.env.PUBLIC_URL}/img/tno_logo_projetos.png`} alt='Data Release Interface' className={classes.logo} />
        <Grid item xs={12} className={classes.titleWrapper}>
          <h1 className={classes.title}>LIneA Occultation Prediction Database</h1>
        </Grid>
        <Grid item xs={12} container className={classes.bannerWrapper}>
          <Box className='container textBanner' sx={{ borderRadius: '6px', width: '45vw', textAlign: 'center' }}>
            <Grid item xs={12} className={classes.textOcultatiom}>
              <label>
                This is a database of predictions for stellar occultations by small Solar System objects, calculated from the legacy
                positions provided by the Dark Energy Survey (DES) and the constantly updated positions from the Minor Planet Center (MPC).
                These predictions are regularly updated. Use our advanced filters to refine your search and find more suitable events.
              </label>
            </Grid>
          </Box>
          <Grid item xs={12}>
            <Subscribe></Subscribe>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  )
}

export default PublicBanner
