import React from 'react'
import Alert from '@mui/material/Alert'
import Stack from '@mui/material/Stack'

const NewRelease = () => {
  return (
    <Alert variant='filled' severity='success' style={{ padding: '0px 3px' }}>
      <strong>New Release Live</strong>.&nbsp;
      <a
        href='https://solarsystem.linea.org.br/docs/release-notes/latest-release/'
        target='blank'
        rel='noopener noreferrer'
        style={{ color: 'inherit', textDecoration: 'none' }}
      >
        <u>Click here</u>&nbsp;
      </a>
      to learn more.&nbsp;
    </Alert>
  )
}

export default NewRelease
