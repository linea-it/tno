import React, { useEffect, useState } from 'react';

import {
  BrowserRouter as Router, Switch, Redirect, Route,
} from 'react-router-dom';
import { MuiThemeProvider } from '@material-ui/core/styles';
import theme from '../../theme/MaterialTheme';
import Drawer from '../Drawer/Drawer';
import { isAuthenticated, url } from '../../api/Auth';

function App() {
  const [authenticated, setAuthenticated] = useState(null);

  useEffect(() => {
    isAuthenticated().then((res) => {
      setAuthenticated(res);
    });
  }, []);

  const renderMain = () => {
    if (authenticated !== null) {
      return authenticated ? <Drawer /> : (
        <Router>
          <Switch>
            <Route
              exact
              path="/login"
              render={() => {
                const loginUrl = `${url}/auth/login/`;
                const next = window.location.host;
                window.location.replace(`${loginUrl}?next=${next}`);
                return null;
              }}
            />
            <Redirect to="/login" />
          </Switch>
        </Router>
      );
    }
    return null;
  };


  return (
    <MuiThemeProvider theme={theme}>
      <>
        {renderMain()}
      </>
    </MuiThemeProvider>
  );
}

export default App;
