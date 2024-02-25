import React from 'react'
import PropTypes from 'prop-types'
import { Box } from '@mui/material'

function Footer({ drawerOpen }) {
  return <Box></Box>
}

Footer.defaultProps = {
  drawerOpen: true
}

Footer.propTypes = {
  drawerOpen: PropTypes.bool
}

export default Footer
