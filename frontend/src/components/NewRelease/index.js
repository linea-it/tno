import React from 'react'
import Alert from '@mui/material/Alert'
import Stack from '@mui/material/Stack'

const NewRelease = () => {
  return (
    <Stack style={{}}>
      <Alert variant='filled' severity='success' icon={false} style={{ padding: '0px 3px' }}>
        {/* <AlertTitle>New Release Live.</AlertTitle> */}
        New Release Live.&nbsp;
        <a
          href='https://solarsystem.linea.org.br/docs/release-notes/latest-release/'
          target='blank'
          rel='noopener noreferrer'
          style={{ color: 'inherit', textDecoration: 'none' }}
        >
          Click here &nbsp;
        </a>
        to learn more.
      </Alert>
    </Stack>
  )
}

export default NewRelease
