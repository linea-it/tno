/* eslint-disable react/prop-types */
/* eslint-disable no-nested-ternary */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Route, Redirect } from 'react-router-dom';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import useStyles from './styles';
import Drawer from '../components/Drawer';
import { isAuthenticated, url } from '../services/api/Auth';
import Header from '../components/LandingPage/Header';
import Footer from '../components/LandingPage/Footer';

export default function RouteWrapper({
  component: Component,
  isPrivate,
  isHomePage,
  ...rest
}) {
  const [title, setTitle] = useState('');
  const [open, setOpen] = useState(window.innerWidth > 1360);
  const [authenticated, setAuthenticated] = useState(false);
  const classes = useStyles();

  useEffect(() => {
    isAuthenticated().then((res) => {
      setAuthenticated(res);
      if (res && !isPrivate) {
        return <Redirect to="/" />;
      }

      if (!res && isPrivate) {
        const loginUrl = `${url}/auth/login/`;
        // TODO:
        // Este if é para quando o usuario tem um link para uma url especifica do app com parametros
        // e tenta acessar mais ainda não está logado.
        // No Django é o parametro next.
        // Depois do login ele redireciona para onde o usuario tentou acessar.
        // O Router não me passa esse valor, se o usuario tentou acessar uma url,
        // sem estar logado o router direcionou ele para o /login mas não passa  a url de origem.
        let next = '/';
        if (window.location.pathname !== '/login') {
          next = window.location.pathname + window.location.search;
        }
        return window.location.replace(`${loginUrl}?next=${next}`);
      }
    });
  }, [isPrivate]);

  return (
    <>
      {isHomePage ? (
        <>
          <Header />
          <Component setTitle={setTitle} />
          <Footer />
        </>
      ) : !authenticated ? (
        <Backdrop className={classes.backdrop} open>
          <CircularProgress color="inherit" />
        </Backdrop>
      ) : (
        <Route
          {...rest}
          render={(props) => (
            <Drawer title={title} open={open} setOpen={setOpen}>
              <Component setTitle={setTitle} {...props} />
            </Drawer>
          )}
        />
      )}
    </>
  );
}

RouteWrapper.propTypes = {
  isPrivate: PropTypes.bool,
  component: PropTypes.oneOfType([PropTypes.element, PropTypes.func])
    .isRequired,
};

RouteWrapper.defaultProps = {
  isPrivate: false,
};
