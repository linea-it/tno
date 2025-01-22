import React from 'react'
import Grid from '@mui/material/Grid'
import styles from './styles'
import Box from '@mui/material/Box'
import Subscribe from '../../../components/Subscription/index'
import { useAuth } from '../../../contexts/AuthContext'
// import { environmentSettings } from '../../../services/api/Api'

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
      <Grid container direction='row' justifyContent='space-between' spacing={2} className={classes.container}>
        <img src={`${process.env.PUBLIC_URL}/img/tno_logo_projetos.png`} alt='Data Release Interface' className={classes.logo} />
        <Grid item xs={12} className={classes.titleWrapper}>
          <h1 className={classes.title}>LIneA Occultation Prediction Database</h1>
        </Grid>
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
        <Grid item xs={12} container className={classes.bannerWrapper}>
          <Grid item xs={12}>
            {envSettings.NEWSLETTER_SUBSCRIPTION_ENABLED && <Subscribe />}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  )
}

export default PublicBanner
