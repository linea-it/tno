import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { color } from 'd3';
import { Height } from '../../../node_modules/@mui/icons-material/index';
import { useEffect, useState } from 'react'
import axios from 'axios'
import {saveEmailSubscription} from '../../services/api/Subscription'
import { api } from '../../services/api/Api';
import { data } from '../../../node_modules/browserslist/index';

/*
function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <Link color="inherit" href="https://mui.com/">
        Your Website
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}*/

// TODO remove, this demo shouldn't need to reset the theme.

const defaultTheme = createTheme();

export default function Subscribe() {
  const [email, setEmail] = useState([])

    //api.post("http://localhost/api/subscription/",{
    //  email: "adriano@gmail.com"
    //}) // this work
    //api.delete("http://localhost/api/subscription/unsubscribe/?c=6a48fbd6-6d34-4b9c-b022-ac3648219b3a"

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const r_email = data.get('email')
    saveEmailSubscription(r_email)
    console.log({
      email: data.get('email'),
    });
    console.log("Cadastrou email")
  };

  
  return (
    <ThemeProvider theme={defaultTheme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            color: '#212121',
            bgcolor: '#F4F4F4',
          }}
        >
            <p>
                Fique por dentro dos eventos de predicao ocorridos em sua região email: {email}!
                Subscreva-se para receber em seu email relatórios personalizados dos eventos de predição de ocultações estelar  para sua região.
                </p>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Subscribe
            </Button>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}