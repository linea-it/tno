// eslint-disable-next-line no-unused-expressions 
import React, { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { Stack } from '../../../node_modules/@mui/material/index';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Alert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'
import AlertTitle from '@mui/material/AlertTitle'
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import {saveEmailSubscription} from '../../services/api/Subscription'
import {getEmailDb} from '../../services/api/Subscription'
import {updateEmailSubscription} from '../../services/api/Newsletter'

const defaultTheme = createTheme();
//updateEmailSubscription

export default function UpdateEmail(subscriptionId) {
  const [email, setEmail] = useState("")
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [validEmail, setValidEmail] = useState(true)
  
  const [open, setOpen] = React.useState('')
  const [resultsEmail, setResultsEmail] = useState([])
  const [openDialog, setOpenDialog] = React.useState(false);

  //console.log(Object.getOwnPropertyDescriptor(subscriptionId, "subscriptionId").value)
  useEffect(() => {
      getEmailDb()
      .then((res) => {
        setResultsEmail(res)
      })
      .catch(() => {
        setResultsEmail([])
      })
  }, [])

  const handleClickOpen = () => {
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
    setEmail("")
  };
  //const getEmail = Object.getOwnPropertyDescriptor(resultsEmail[0], "email").value
  //console.log(getEmail)

  // this function for get our title value from the user.
  function emailChangeHandler(event) {
    setEmail(event.target.value);
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(event.target.value)
    setValidEmail(isValid)
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const r_email = data.get('email')
    
    const  email_length = resultsEmail.length
    console.log(email_length)
    const getEmail = [ ]
    
    for(let i = 0; i < email_length; i = i + 1 ) {
      getEmail[i] = Object.getOwnPropertyDescriptor(resultsEmail[i], "email").value
      //console.log(getEmail)
    }

    getEmail.forEach( email => {
      if (r_email == email){
        console.log(r_email, getEmail)
        setSnackbarOpen(true)
        setOpen('warning')
        console.log('Entrei no if email existe....')
      }else{
          updateEmailSubscription(Object.getOwnPropertyDescriptor(subscriptionId, "subscriptionId").value, r_email).then(() => {
          setSnackbarOpen(true)
          setOpen('success')
          console.log(subscriptionId.value, r_email)
          console.log('salvando email no bd')})
      }
    })
  }

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setSnackbarOpen(false)
    setOpen('')
  }

  return (
    <Box  autoComplete='off' noValidate sx={{ mt: 1 , display: 'block'}}>
        <Button variant="outlined" onClick={handleClickOpen}>
            Update email
        </Button>
        <Dialog component="form" onSubmit={handleSubmit}
        open={openDialog}
        onClose={handleClose}
        >
            <Stack sx={{ display: "inlineflex" }}>
                <DialogTitle sx={{ paddingRight: '270px' }} >Update email </DialogTitle>
                <Button variant="outlined" sx={{ width: '10vw', height:'34px', margin: '15px' }} onClick={ handleClose }>
                    <CloseIcon  color='primary'/>
                </Button>
            </Stack>
        <DialogContent>
          <DialogContentText>
            Please enter your new email address here.
          </DialogContentText>
          <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              //autoComplete="email"
              autoComplete= 'off'
              autoFocus sx={{ input: { borderRadius: '6px', height:'8px', color: 'gray' }}}
              value={email}
              onChange={emailChangeHandler}
              error={!validEmail}
              helperText={!validEmail ? 'Please enter a valid email address' : ''}
              InputLabelProps={{ sx: { color: 'gray' } }}
            />
            </DialogContent>
            <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          {/*<Button type="submit">Save</Button>*/}
            <Button
              type="submit"
              //fullWidth 
              //variant="outlined"
              //sx={{ width: '20vw', height:'34px', margin: 'none'}}
              inputValue = ''
            >
              Save
            </Button>
            {/*<Button variant="outlined" onClick={ handleClose }>
                <CloseIcon  color='primary'/>
            </Button>*/}
              {/*<p>
                Receive reports in your email with the main star occultation predictions in your region.
              </p>*/}
              <Snackbar
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
              open={open === 'success' || open === 'warning'}
              autoHideDuration={3500}
              onClose={handleCloseSnackbar}
            >
              <Alert
                onClose={handleCloseSnackbar}
                severity={open === 'success' ? 'success' : 'warning'}
              >
                <AlertTitle>
                  {open === 'success' ? 'Success' : 'Warning'}
                </AlertTitle>
                <p>
                  {open === 'success'
                    ? 'Email successfully registered. Check your email inbox.'
                    : 'Subscription with this Email already exists.'}
                </p>
              </Alert>
            </Snackbar>
            </DialogActions>
            </Dialog>
          </Box>
  )
}