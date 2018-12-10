import React from 'react';
import ReactDOM from 'react-dom';

import { Router, Route, Switch, Redirect } from 'react-router-dom';

import App from 'containers/App/App.jsx';
import Login from 'containers/Login/Login.jsx';
import OccultationsPanel from 'views/Occultations/Panel';
import OccultationDetail from 'views/Occultations/Detail';

import './assets/css/bootstrap.min.css';
import './assets/css/animate.min.css';
import './assets/sass/light-bootstrap-dashboard.css';
import './assets/css/demo.css';
import './assets/css/pe-icon-7-stroke.css';
import 'semantic-ui-css/semantic.min.css';
import 'react-notifications/lib/notifications.css';
import 'primeflex/primeflex.css';

import history from './history';

import { isAuthenticated } from './auth';

const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={props => {
      if (isAuthenticated()) {
        return <Component {...props} />;
      } else {
        return (
          <Redirect
            to={{
              pathname: '/login',
              state: { from: props.location },
            }}
          />
        );
      }
    }}
  />
);

ReactDOM.render(
  <Router history={history}>
    <Switch>
      <Route path="/login" name="Login" component={Login} />
      <Route
        path="/predictions"
        name="Predictions"
        component={OccultationsPanel}
      />
      <Route
        path="/predict_detail/:id"
        name="Predictions"
        component={OccultationDetail}
      />
      <PrivateRoute path="/" name="Home" component={App} />
    </Switch>
  </Router>,

  document.getElementById('root')
);
