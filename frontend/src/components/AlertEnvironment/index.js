import React from 'react'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'

function AlertEnvironment() {
  return (
    <Alert severity='warning'>
      <AlertTitle>This is a development and testing version of this platform.</AlertTitle>
      Do not use its data or reference it in any way.
      <br />
      For the official product, visit the link &nbsp;
      <a href='https://solarsystem.linea.org.br' target='blank' rel='noopener noreferrer'>
        https://solarsystem.linea.org.br.
      </a>
    </Alert>
  )
}

export default AlertEnvironment
