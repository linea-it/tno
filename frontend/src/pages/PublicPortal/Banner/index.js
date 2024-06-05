import React, { useEffect, useState } from 'react'
import Grid from '@mui/material/Grid'
import styles from './styles'
import Box from '@mui/material/Box'
import { Alert } from '../../../../node_modules/@mui/lab/index'
import { pageTnoDev } from '../../../services/api/Auth' 
import { Typography } from '../../../../node_modules/@mui/material/index'

function PublicBanner() {
  const classes = styles()
  const [resultsDev, setResultsDev] = useState([])

  useEffect(() => {
    // Get results by year
    pageTnoDev()
      .then((res) => {
        setResultsDev(res)
      })
      .catch(() => {
        setResultsDev([])
      })
  }, [])
  const verifyPage = resultsDev[0]
  console.log(verifyPage)

  return (
    <Box className={classes.root}>
      <Grid container direction='row' justifyContent='space-between' spacing={2} className={classes.container}>
        {verifyPage === 'Development' ? 
        <Grid item xs={12}>
          <Alert severity='warning'> 
            YOU ARE VISITING A DEVELOPMENT PAGE. <a href="https://linea.org.br/" target='blank' rel="noopener noreferrer">
              PLEASE VISIT OUR OFFICIAL PAGE.
            </a>
          </Alert>
        </Grid>
        :
        ' '
        }
        
        <img src={`${process.env.PUBLIC_URL}/img/tno_logo_projetos.png`} alt='Data Release Interface' className={classes.logo} />
        <Grid item xs={12} className={classes.titleWrapper}>
          <h1 className={classes.title}>LIneA Occultation Prediction Database</h1>
        </Grid>
        <Grid item xs={12} container className={classes.bannerWrapper}>
          <Box
            className='container textBanner'
            sx={{ borderRadius: '6px', width: '45vw', border: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'center' }}
          >
            <Grid item xs={12} className={classes.textOcultatiom}>
              <label>
                This is a database of predictions for stellar occultations by small Solar System objects, calculated from the legacy
                positions provided by the Dark Energy Survey (DES) and the constantly updated positions from the Minor Planet Center (MPC).
                These predictions are regularly updated. Use our advanced filters to refine your search and find more suitable events.
              </label>
            </Grid>
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}

export default PublicBanner
