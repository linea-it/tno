import React, { useState, useEffect } from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import { withRouter } from 'react-router-dom';
import { login } from './api/Auth';

//Come on

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(7),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

function Login({ history, setTitle }) {
  const classes = useStyles();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const loginEnv = process.env.REACT_APP_INST_LOGIN || process.env.REACT_APP_INST_LOGIN !== "" ?
    process.env.REACT_APP_INST_LOGIN : "";

  const handleUsernameChange = (e) => setUsername(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);

  const handleSubmit = () => {
    if (username !== '' && password !== '') {
      login(username, password, (loggedIn) => {
        if (loggedIn) history.push('/');
        window.location.reload();
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.charCode === 13 && username !== '' && password !== '') {
      handleSubmit();
    }
  };


  const handleInstitutionalLogin = () => {
    window.location.href = process.env.REACT_APP_INST_LOGIN;
  };


  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        <form className={classes.form} noValidate>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            value={username}
            onChange={handleUsernameChange}
            autoFocus
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            value={password}
            onChange={handlePasswordChange}
            onKeyPress={handleKeyPress}
            autoComplete="current-password"
          />
          {/* <FormControlLabel
            control={<Checkbox value="remember" color="primary" />}
            label="Remember me"
          /> */}
          <Button
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            onClick={handleSubmit}
            disabled={!!(username === '' || password === '')}
          >
            Sign In
          </Button>

          {loginEnv !== "" ? <Button
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            onClick={handleInstitutionalLogin}
          // disabled={!!(username === '' || password === '')}
          >
            Institutional Login
            </Button> : null}





          {/* <Grid container>
            <Grid item xs>
              <Link href="#" variant="body2">
                Forgot password?
              </Link>
            </Grid>
          </Grid> */}
        </form>
      </div>
    </Container>
  );
}

export default withRouter(Login);

// export default Login;
