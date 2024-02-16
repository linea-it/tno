import React from 'react'
import PropTypes from 'prop-types'
import AppBar from '@mui/material/AppBar'
import { Typography, Toolbar } from '@mui/material'
import logo from '../../assets/img/logo-mini.png'
import useStyles from './styles'
import { Box } from '@mui/material'

function Footer({ drawerOpen }) {
  const classes = useStyles({ drawerOpen })

  return (
    <Box></Box>
  )
}

Footer.defaultProps = {
  drawerOpen: true
}

Footer.propTypes = {
  drawerOpen: PropTypes.bool
}

export default Footer
