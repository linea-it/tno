import React from 'react';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { Router } from 'react-router-dom';
import { TitleProvider } from './contexts/title';
import light from './themes/light';
import Routes from './routes';
import history from './services/history';

function App() {
  return (
    <MuiThemeProvider theme={light}>
      <TitleProvider>
        <Router history={history}>
          <Routes />
        </Router>
      </TitleProvider>
    </MuiThemeProvider>
  );
}

export default App;
