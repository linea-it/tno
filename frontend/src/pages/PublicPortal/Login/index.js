import React, { useState, useEffect } from 'react'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'

import { sendPasswordLessCode, passwordLessSignIn, loggedUser } from '../../../services/api/Auth'

function PublicLogin() {
  const [email, setEmail] = useState('')
  const [emailIsValid, setEmailIsValid] = useState(false)
  const [tokenSended, setCodeSended] = useState(false)
  const [token, setCode] = useState('')
  const [tokenIsValid, setCodeIsValid] = useState(false)
  const [sendCodeError, setSendCodeError] = useState(false)
  const [signinError, setSigninError] = useState(false)

  useEffect(() => {
    loggedUser()
      .then((res) => {
        console.log('Logged')
        if (res) {
          window.location.replace('/newsletter_settings/')
        }
      })
      .catch((res) => {
        console.log('Not logged')
      })
  }, [])

  const resetForm = () => {
    setCodeSended(false)
    setCode('')
    setCodeIsValid(false)
    setSendCodeError(false)
    setSigninError(false)
  }

  const handleChangeEmail = (e) => {
    setEmail(e.target.value)
    resetForm()
    if (e.target.validity.valid) {
      setEmailIsValid(true)
    } else {
      setEmailIsValid(false)
    }
  }

  const handleSendCode = () => {
    sendPasswordLessCode(email)
      .then((res) => {
        setCodeSended(true)
      })
      .catch((res) => {
        setSendCodeError(true)
      })
  }

  const handleChangeCode = (e) => {
    setCode(e.target.value)
    if (e.target.value.length === 6) {
      setCodeIsValid(true)
    } else {
      setCodeIsValid(false)
    }
  }

  const handleSignin = () => {
    passwordLessSignIn(email, token).catch((res) => {
      console.log('Autehntication failed')
      setSigninError(true)
    })
  }

  return (
    <Container maxWidth='sm'>
      <Box>
        <Stack mb={2}>
          <Typography variant='h5' color='textPrimary'>
            Sign in to your account
          </Typography>
          <Typography variant='body2' color='textPrimary'>
            Don't have an account? Get started
          </Typography>
        </Stack>
        <Box component='form' noValidate autoComplete='off'>
          <Stack spacing={2}>
            <Stack direction='row'>
              <TextField fullWidth label='Email address' type='email' value={email} onChange={handleChangeEmail} error={sendCodeError} />
              <Button sx={{ width: 150 }} variant='contained' disabled={!emailIsValid} onClick={handleSendCode}>
                Send Code
              </Button>
            </Stack>
            {tokenSended && (
              <Alert icon={false} severity='success'>
                We’ve sent a 6-character code to {email}. The code expires shortly, so please enter it soon.
              </Alert>
            )}
            {sendCodeError && (
              <Alert severity='error'>
                The authentication code could not be sent to this email. Please check your email address and try again.
              </Alert>
            )}
            <TextField label='Code' value={token} onChange={handleChangeCode} disabled={!tokenSended} inputProps={{ maxLength: 6 }} />
            <Typography variant='caption' color='textPrimary'>
              Can’t find your code? Check your spam folder!
            </Typography>

            {signinError && (
              <Alert severity='error' onClose={resetForm}>
                Authentication failed, please check your email and code and try again.
              </Alert>
            )}
            <Button variant='contained' disabled={!tokenIsValid || !emailIsValid} onClick={handleSignin}>
              Sign in
            </Button>
          </Stack>
        </Box>
      </Box>
    </Container>
  )
}
export default PublicLogin
