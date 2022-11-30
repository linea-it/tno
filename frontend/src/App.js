import React from 'react';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import light from './themes/light';
import AppRoutes from './routes';
import history from './services/history';
import { isAuthenticated, url } from './services/api/Auth';
import Header from './components/LandingPage/Header';
import Footer from './components/LandingPage/Footer';
function App() {
  return (
    <MuiThemeProvider theme={light}>
      <BrowserRouter history={history}>
        <Header />
        <AppRoutes />
        <Footer />
      </BrowserRouter>
    </MuiThemeProvider>
  );
}

export default App;
