import React, { useState } from 'react'
import Button from '@mui/material/Button'
import { Stack } from '../../../node_modules/@mui/material/index'
import Alert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'
import { subscribe } from '../../services/api/Newsletter'
import Paper from '@mui/material/Paper'
import InputBase from '@mui/material/InputBase'

export default function Subscribe() {
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState(false)
  const [errorAlertOpen, setErrorAlertOpen] = useState(false)
  const [emailSuccess, setEmailSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState(
    'An error occurred while sending the subscription email. Please try again later or contact support if the issue persists.'
  )

  const handleChange = (e) => {
    setEmail(e.target.value)
    if (e.target.validity.valid) {
      setEmailError(false)
    } else {
      setEmailError(true)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (email !== '') {
      subscribe(email)
        .then(() => {
          setEmail('')
          setEmailSuccess(true)
        })
        .catch((res) => {
          console.log(res)
          if (res.response.data.detail) {
            setErrorMsg(res.response.data.detail)
          }
          setEmail('')
          setErrorAlertOpen(true)
        })
    }
  }

  return (
    <Stack direction='column' justifyContent='center' alignItems='center' spacing={2}>
      <Paper
        component='form'
        sx={{
          ml: 1,
          mr: 1,
          display: 'flex',
          alignItems: 'center',
          width: 600
        }}
      >
        <InputBase
          sx={{
            ml: 1,
            mr: 1,
            flex: 1
          }}
          placeholder='Email Address'
          inputProps={{
            'aria-label': 'Email Address'
          }}
          type='email'
          value={email}
          onChange={handleChange}
          error={emailError}
          autoComplete='email'
        />
        <Button
          variant='contained'
          sx={{
            borderTopLeftRadius: '0px',
            borderBottomLeftRadius: '0px'
          }}
          size='large'
          disabled={emailError}
          onClick={handleSubmit}
          type='submit'
        >
          Subscribe
        </Button>
      </Paper>
      <p>Receive reports in your email with the main star occultation predictions in your region.</p>
      {emailSuccess && (
        <Snackbar
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          open={true}
          autoHideDuration={3500}
          onClose={() => {
            setEmailSuccess(false)
          }}
        >
          <Alert severity='success'>Email successfully registered. Check your email inbox.</Alert>
        </Snackbar>
      )}

      {errorAlertOpen && (
        <Alert
          severity='error'
          onClose={() => {
            setErrorAlertOpen(false)
          }}
        >
          {errorMsg}
        </Alert>
      )}
    </Stack>
  )
}
