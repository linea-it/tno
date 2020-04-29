import React from 'react';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { Router } from 'react-router-dom';
import light from './themes/light';
import Routes from './routes';
import history from './services/history';

function App() {
  return (
    <MuiThemeProvider theme={light}>
      <Router history={history}>
        <Routes />
      </Router>
    </MuiThemeProvider>
  );
}

export default App;
