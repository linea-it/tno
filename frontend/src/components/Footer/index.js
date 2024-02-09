import React from 'react'
import PropTypes from 'prop-types'
import AppBar from '@mui/material/AppBar'
import { Typography, Toolbar } from '@mui/material'
import logo from '../../assets/img/logo-mini.png'
import useStyles from './styles'

function Footer({ drawerOpen }) {
  const classes = useStyles({ drawerOpen })

  return (
    <footer className={classes.root}>
      <AppBar position='fixed' className={drawerOpen ? classes.appBarDrawerOpen : classes.appBarDrawerClose}>
        <Toolbar className={classes.toolbar}>
          <Typography color='inherit'>
            TNO: <span className={classes.versionLink}>1.0.0</span>
          </Typography>
          <Typography color='inherit'>
            <span className={classes.poweredBy}>Powered by</span>
            <a href='http://www.linea.org.br/' target='blank' className={classes.logoLink}>
              <img src={logo} title='LIneA' alt='LineA' style={{ cursor: 'pointer', marginLeft: '10px' }} />
            </a>
          </Typography>
        </Toolbar>
      </AppBar>
    </footer>
  )
}

Footer.defaultProps = {
  drawerOpen: true
}

Footer.propTypes = {
  drawerOpen: PropTypes.bool
}

export default Footer
