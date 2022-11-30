import React from 'react';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { BrowserRouter } from 'react-router-dom';
import light from './themes/light';
import AppRoutes from './routes';
import history from './services/history';
import Header from './components/LandingPage/Header';
import Footer from './components/LandingPage/Footer';
import { AuthProvider } from './contexts/AuthContext.js';
function App() {
  return (
    <MuiThemeProvider theme={light}>
      <AuthProvider>
        <BrowserRouter history={history}>
          <Header />
          <AppRoutes />
          <Footer />
        </BrowserRouter>
      </AuthProvider>
    </MuiThemeProvider>
  );
}

export default App;
