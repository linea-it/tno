import React from 'react';
import {BrowserRouter as Router} from 'react-router-dom';
import { MuiThemeProvider } from '@material-ui/core/styles';
import theme from './theme/MaterialTheme';
import Drawer from './Drawer';
import Login from './Login';

import { isAuthenticated } from './api/Auth';

function App() {
  return (
    <Router >
      <MuiThemeProvider theme={theme}>
        {isAuthenticated() ? <Drawer /> : <Login />}
      </MuiThemeProvider>
    </Router>
  );
}
export default App;
