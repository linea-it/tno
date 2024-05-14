import React, { useState } from 'react';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { Stack } from '../../../node_modules/@mui/material/index';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Alert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'
import AlertTitle from '@mui/material/AlertTitle'
import axios from 'axios'
import {saveEmailSubscription} from '../../services/api/Subscription'
import { data } from '../../../node_modules/browserslist/index';

const defaultTheme = createTheme();

export default function Subscribe() {
  const [email, setEmail] = useState("")
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [validEmail, setValidEmail] = useState(true)
  
  const [open, setOpen] = React.useState('')

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
    saveEmailSubscription(r_email).then(() => {
      setSnackbarOpen(true)
      setOpen('success')
    })
    axios
      .get(`${window.location.origin}/api/subscription/`)
      .then((res) => checkEmail(res.data))
      setSnackbarOpen(true)
      setOpen('warning')
      setEmail(" ") 
  };

  const checkEmail = (getdata) => {
    console.log(getdata);
    if(getdata.includes(email)){
        setSnackbarOpen(true)
        setOpen('warning')
      }else{
        axios.post(`${window.location.origin}/api/subscription/`, data).then((res) => {
        console.log(res.data);
    });
    }
  };
  
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setSnackbarOpen(false)
    setOpen('')
  }

  return (
    <ThemeProvider theme={defaultTheme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box className='container textBanner'
          sx={{
            marginTop: 4,
            display: 'flex',
            flexDirection: 'columns',
            alignItems: 'center',
            color: '#F4F4F4',
            borderRadius: '6px', width: '60vw', textAlign: 'center' 
          }}
        >
           <Box component="form" onSubmit={handleSubmit} autoComplete='off' noValidate sx={{ mt: 1 , display: 'block'}}>
          <Stack direction='row' justifyContent='flex-end' alignItems='center' spacing={1}>

          </Stack>
          </Box>
        </Box>
        </Container>
    </ThemeProvider>
  )
}