import React from 'react'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'

function AlertGenericError() {
  return (
    <Alert variant='outlined' severity='error'>
      <AlertTitle>Opps, something went wrong</AlertTitle>
      Server Error 500. We apologize for the inconvenience.
      <br />
      We are working to resolve the issue. Please attempt again shortly.
    </Alert>
  )
}

export default AlertGenericError
