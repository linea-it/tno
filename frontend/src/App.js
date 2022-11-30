import React from 'react';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import light from './themes/light';
import AppRoutes from './routes';
import history from './services/history';
function App() {
  return (
    <MuiThemeProvider theme={light}>
      <BrowserRouter history={history}>
        <AppRoutes />
      </BrowserRouter>
    </MuiThemeProvider>
  );
}

export default App;
