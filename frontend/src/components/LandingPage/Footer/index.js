import React from 'react'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import logo from '../../../assets/img/linea-logo-mini.png'
import useStyles from './styles'
function Footer() {
  const classes = useStyles()

  return (
    <footer className={`${classes.root} ${classes.appBarDrawerClose}`}>
      <Grid container direction='row' justifyContent='space-between' alignItems='center'>
        <Grid item className={classes.marginItem}>
        </Grid>
        <Grid item className={classes.marginItem}>
          <Typography color='primary'>
            <span className={classes.poweredBy}>Powered by</span>
            <a href='http://www.linea.org.br/' target='blank' className={classes.logoLink}>
              <img src={logo} title='LIneA' alt='LineA' className={classes.logoFooter} />
            </a>
          </Typography>
        </Grid>
      </Grid>
    </footer>
  )
}
export default Footer
