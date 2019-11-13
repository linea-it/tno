import React from 'react';
import { MuiThemeProvider } from '@material-ui/core/styles';
import {
  BrowserRouter as Router, Route, Redirect, Switch,
} from 'react-router-dom';
import theme from './theme/MaterialTheme';
import Drawer from './Drawer';
import Login from './Login';

function App() {
  return (
    <MuiThemeProvider theme={theme}>
      <Router>
        <Switch>
          <Route exact path="/login" render={() => <Login />} />
          <Redirect path="/" to="/login" />
        </Switch>
      </Router>
      {/* <Drawer /> */}
    </MuiThemeProvider>
  );
}

export default App;
