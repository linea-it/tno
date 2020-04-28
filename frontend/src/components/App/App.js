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
                // TODO: Este if é para quando o usuario tem um link para uma url especifica do app com parametros
                // e tenta acessar mais ainda não está logado. no Django é o parametro next. depois do login ele redireciona para onde o usuario tentou acessar. 
                // No react o Router não me passa esse valor, se o usuario tentou acessar uma url, sem estar logado o router direcionou ele para o /login mais não passa  a url que tentou antes
                let next = '/';
                if (window.location.pathname !== '/login') {
                  next = window.location.pathname + window.location.search;
                }
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
