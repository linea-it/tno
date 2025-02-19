import React from 'react'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Stack from '@mui/material/Stack'

const NewRelease = () => {
  return (
    <Stack direction='column' alignItems='flex-start' spacing={2} style={{ maxWidth: 'fit-content', width: '100%' }}>
      <Alert severity='success' style={{ width: '100%', justifyContent: 'flex-start' }}>
        <AlertTitle>New Release Live.</AlertTitle>
        Click here to learn more &nbsp;
        <a href='https://solarsystem.linea.org.br/docs/release-notes/latest-release/' target='blank' rel='noopener noreferrer'>
          https://solarsystem.linea.org.br/docs/release-notes/latest-release/.
        </a>
      </Alert>
    </Stack>
  )
}

export default NewRelease
