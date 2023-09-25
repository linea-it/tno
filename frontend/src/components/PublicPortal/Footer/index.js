import React from 'react'
import { Typography, Grid } from '@material-ui/core'
import clsx from 'clsx'
import logo from '../../../assets/img/linea-logo-mini.png'
import useStyles from './styles'

function PublicFooter() {
  const classes = useStyles()

  return (
    <footer className={clsx(classes.root, classes.appBarDrawerClose)}>
      <Grid container direction='row' justifyContent='space-between' alignItems='center'>
        <Grid item className={classes.marginItem}>
          <Typography color='primary'>
            <span className={classes.poweredBy}>Testing</span> <span className={classes.versionLink}>1.0.0</span>
          </Typography>
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
export default PublicFooter
