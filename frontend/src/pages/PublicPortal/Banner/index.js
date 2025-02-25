import React from 'react'
import Grid from '@mui/material/Grid'
import styles from './styles'
import Box from '@mui/material/Box'
import Subscribe from '../../../components/Subscription/index'
import { useAuth } from '../../../contexts/AuthContext'
// import { environmentSettings } from '../../../services/api/Api'
import NewRelease from '../../../components/NewRelease/index'

function PublicBanner() {
  const classes = styles()
  // const [newsletterEnabled, setNewsletterEnabled] = useState(false)
  const { envSettings } = useAuth()

  // useEffect(() => {
  //   environmentSettings()
  //     .then((res) => {
  //       setNewsletterEnabled(res.NEWSLETTER_SUBSCRIPTION_ENABLED)
  //     })
  //     .catch(() => {
  //       // TODO: Aviso de erro
  //     })
  // }, [])
  return (
    <Box className={classes.root}>
      <Grid container direction='row' spacing={2} sx={{ padding: 0 }} className={classes.container}>
        {/* New Release component */}
        <Grid
          item
          xs={12}
          sm='auto'
          sx={{
            display: 'flex',
            justifyContent: { xs: 'center', sm: 'flex-end' },
            alignItems: 'center',
            ml: { xs: 0, sm: 'auto' }
          }}
        >
          <NewRelease />
        </Grid>

        {/* Logo */}
        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
          <img src={`${process.env.PUBLIC_URL}/img/tno_logo_projetos.png`} alt='Data Release Interface' className={classes.logo} />
        </Grid>

        {/* Title */}
        <Grid item xs={12} className={classes.titleWrapper}>
          <h1 className={classes.title}>LIneA Occultation Prediction Database</h1>
        </Grid>

        {/* Title */}
        <Grid item xs={12} container className={classes.bannerWrapper}>
          <Box className='container textBanner' sx={{ borderRadius: '4px', width: '45vw', textAlign: 'center' }}>
            <Grid item xs={12} className={classes.textOcultatiom}>
              <label>
                This database features predictions for stellar occultations by small Solar System objects, updated regularly. Use the
                advanced filters to refine your search. Subscribe and set up customized updates.
              </label>
            </Grid>
          </Box>
        </Grid>

        {/* Subscription (if enabled) */}
        <Grid item xs={12} container sx={{ padding: 2 }} className={classes.bannerWrapper}>
          <Grid item xs={12}>
            {envSettings.NEWSLETTER_SUBSCRIPTION_ENABLED && <Subscribe />}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  )
}

export default PublicBanner
