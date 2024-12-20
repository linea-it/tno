import React, { useState, useEffect } from 'react'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import Divider from '@mui/material/Divider'
import Link from '@mui/material/Link'
import SettingsIcon from '@mui/icons-material/Settings'

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
        if (res) {
          window.location.replace('/newsletter_settings/')
        }
      })
      .catch(() => {
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
    setEmailIsValid(e.target.validity.valid)
  }

  const handleSendCode = () => {
    sendPasswordLessCode(email)
      .then(() => {
        setCodeSended(true)
      })
      .catch(() => {
        setSendCodeError(true)
      })
  }

  const handleChangeCode = (e) => {
    setCode(e.target.value)
    setCodeIsValid(e.target.value.length === 6)
  }

  const handleSignin = () => {
    passwordLessSignIn(email, token)
      .then(() => {
        console.log('Sign-in successful')
        // Trigger loggedUser after successful sign-in
        return loggedUser()
      })
      .then((res) => {
        // console.log('Logged User Response after sign-in:', res)
        if (res) {
          window.location.replace('/newsletter_settings/')
        }
      })
      .catch((err) => {
        console.error('Sign-in or loggedUser failed:', err)
        setSigninError(true)
      })
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        bgcolor: '#f0f0f0'
      }}
    >
      <Container
        maxWidth='sm'
        sx={{
          bgcolor: '#F8F8F8',
          p: 3,
          borderRadius: 2,
          boxShadow: 1
        }}
      >
        {/* Header */}
        <Box
          sx={{
            bgcolor: '#0076BC',
            color: '#fff',
            py: 2,
            textAlign: 'center',
            borderRadius: 1,
            mb: 3
          }}
        >
          <Typography
            variant='h4'
            sx={{
              fontFamily: 'Oxanium, sans-serif',
              fontWeight: 400,
              fontSize: '1.5rem'
            }}
          >
            LIneA Occultation Prediction Database
          </Typography>
        </Box>
        {/* Body */}
        <Stack spacing={2} mb={2}>
          <Typography variant='body1' color='textPrimary' textAlign='center'>
            Sign in to your account
          </Typography>
          <Typography variant='body2' color='textSecondary' textAlign='center'>
            Don't have an account?{' '}
            <Link href='/' underline='hover' color='primary'>
              Subscribe now.
            </Link>
          </Typography>
          <Typography variant='body2' color='textPrimary' textAlign='center'>
            Once you've signed in, click on the{' '}
            <SettingsIcon
              fontSize='small'
              sx={{
                verticalAlign: 'bottom'
              }}
            />{' '}
            icon to customize your filter settings.
          </Typography>
          <Divider />
        </Stack>
        {/* Form */}
        <Box component='form' noValidate autoComplete='off'>
          <Stack spacing={2}>
            <Stack direction='row' spacing={1}>
              <TextField fullWidth label='Email address' type='email' value={email} onChange={handleChangeEmail} error={sendCodeError} />
              <Button sx={{ width: 150 }} variant='contained' disabled={!emailIsValid} onClick={handleSendCode}>
                Send Code
              </Button>
            </Stack>
            {tokenSended && (
              <Alert icon={false} severity='success' sx={{ fontSize: '0.875rem' }}>
                We’ve sent a 6-character code to {email}. The code expires shortly, so please enter it soon.
              </Alert>
            )}
            {sendCodeError && (
              <Alert severity='error' sx={{ fontSize: '0.875rem' }}>
                The authentication code could not be sent to this email. Please check your email address and try again.
              </Alert>
            )}
            <TextField label='Code' value={token} onChange={handleChangeCode} disabled={!tokenSended} inputProps={{ maxLength: 6 }} />
            <Typography variant='caption' color='textSecondary' textAlign='center' sx={{ fontStyle: 'italic' }}>
              Can’t find your code? Check your spam folder!
            </Typography>
            {signinError && (
              <Alert severity='error' onClose={resetForm} sx={{ fontSize: '0.875rem', textAlign: 'center' }}>
                Authentication failed, please check your email and code and try again.
              </Alert>
            )}
            <Button variant='contained' fullWidth disabled={!tokenIsValid || !emailIsValid} onClick={handleSignin}>
              Sign in
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  )
}

export default PublicLogin
