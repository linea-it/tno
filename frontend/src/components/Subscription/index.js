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
import { Stack } from '../../../node_modules/@mui/material/index';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { color } from 'd3';
import { Height } from '../../../node_modules/@mui/icons-material/index';
import { useEffect, useState } from 'react'
import axios from 'axios'
import {saveEmailSubscription} from '../../services/api/Subscription'
import { api } from '../../services/api/Api';
import { data } from '../../../node_modules/browserslist/index';

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
        <Box className='container textBanner'
          sx={{
            marginTop: 4,
            display: 'flex',
            flexDirection: 'columns',
            alignItems: 'center',
            color: '#F4F4F4',
            borderRadius: '6px', width: '60vw', border: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'center' 
          }}
        >
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 , display: 'block'}}>
          <Stack direction='row' justifyContent='flex-end' alignItems='center' spacing={1}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus sx={{ input: { borderRadius: '6px', height:'8px', color: 'white', backgroundColor: '#F4F4F450' } }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ width: '30vw', height:'34px' }}
            >
              Subscribe
            </Button>
            </Stack>
              <p>
                Receive reports in your email with the main star occultation predictions in your region.
              </p>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}