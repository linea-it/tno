import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Switch, Redirect, Route } from 'react-router-dom';
import { MuiThemeProvider } from '@material-ui/core/styles';
import theme from './theme/MaterialTheme';
import Drawer from './Drawer';
import Login from './Login';
import { isAuthenticated } from './api/Auth';

function App() {
  return (
    <MuiThemeProvider theme={theme}>
      {isAuthenticated() ? <Drawer /> : (
        <Router>
          <Switch>
            <Route exact path="/login" render={() => <Login />} />
            <Redirect to="/login" />
          </Switch>
        </Router>
      )}
    </MuiThemeProvider>
  );
}

export default App;
