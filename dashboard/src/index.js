import React from 'react';
import ReactDOM from 'react-dom';

import { Router, Route, Switch, Redirect } from 'react-router-dom';

import App from 'containers/App/App.jsx';
import Login from 'containers/Login/Login.jsx';

import './assets/css/bootstrap.min.css';
import './assets/css/animate.min.css';
import './assets/sass/light-bootstrap-dashboard.css';
import './assets/css/demo.css';
import './assets/css/pe-icon-7-stroke.css';

import history from './history';

import { isAuthenticated, login } from './auth';

console.log("isAuthenticated: %o", isAuthenticated())

login("gverde", "adminadmin")

const fakeAuth = {
  isAuthenticated: false,
  authenticate(cb) {
    this.isAuthenticated = true;
    setTimeout(cb, 100); // fake async
  },
  signout(cb) {
    this.isAuthenticated = false;
    setTimeout(cb, 100);
  },
};

const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={props =>
      isAuthenticated() ? (
        <Component {...props} />
      ) : (
        <Redirect
          to={{
            pathname: '/login',
            state: { from: props.location },
          }}
        />
      )
    }
  />
);

ReactDOM.render(
  <Router history={history}>
    <Switch>
      <Route path="/login" name="Login" component={Login} />
      <PrivateRoute path="/" name="Home" component={App} />
    </Switch>
  </Router>,

  document.getElementById('root')
);
