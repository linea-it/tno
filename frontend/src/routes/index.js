import React from 'react';
import { Switch, Redirect } from 'react-router-dom';

import Route from './Route';

import Dashboard from '../pages/Dashboard';

import Download from '../pages/Download';

import Skybot from '../pages/Skybot';
import SkybotDetail from '../pages/Skybot/Detail';
import SkybotAsteroid from '../pages/Skybot/Asteroid';

import RefineOrbit from '../pages/RefineOrbit';
import RefineOrbitDetail from '../pages/RefineOrbit/Detail';
import RefineOrbitAsteroid from '../pages/RefineOrbit/Asteroid';

import PredictionOccultation from '../pages/PredictionOccultation';
import PredictionOccultationDetail from '../pages/PredictionOccultation/Detail';
import PredictionOccultationAsteroid from '../pages/PredictionOccultation/Asteroid';

import Occultation from '../pages/Occultation';
import OccultationDetail from '../pages/Occultation/Detail';
import OccultationCalendar from '../pages/Occultation/Calendar';

export default function Routes() {
  return (
    <Switch>
      <Route isPrivate exact path="/refine-orbit" component={RefineOrbit} />
      <Route
        isPrivate
        exact
        path="/refine-orbit/:id"
        component={RefineOrbitDetail}
      />
      <Route
        isPrivate
        exact
        path="/refine-orbit/asteroid/:id"
        component={RefineOrbitAsteroid}
      />
      <Route
        isPrivate
        exact
        path="/prediction-of-occultation/asteroid/:id"
        component={PredictionOccultationAsteroid}
      />
      <Route
        isPrivate
        exact
        path="/prediction-of-occultation/:id"
        component={PredictionOccultationDetail}
      />
      <Route
        isPrivate
        exact
        path="/prediction-of-occultation"
        component={PredictionOccultation}
      />
      <Route
        isPrivate
        exact
        path="/occultation-calendar"
        component={OccultationCalendar}
      />
      <Route
        isPrivate
        exact
        path="/occultation-calendar-back/:id/:date/:view/:sDate/:fDate/:searching"
        component={OccultationCalendar}
      />
      <Route isPrivate exact path="/occultation" component={Occultation} />
      <Route
        isPrivate
        exact
        path="/occultation/:id"
        component={OccultationDetail}
      />

      <Route
        isPrivate
        exact
        path="/data-preparation/des/skybot"
        component={Skybot}
      />
      <Route
        isPrivate
        exact
        path="/data-preparation/des/skybot/:id"
        component={SkybotDetail}
      />
      <Route
        isPrivate
        exact
        path="/data-preparation/des/skybot/asteroid/:id"
        component={SkybotAsteroid}
      />
      <Route isPrivate exact path="/download/" component={Download} />
      <Route isPrivate exact path="/" component={Dashboard} />
      <Redirect path="/" to="/" />
    </Switch>
  );
}
