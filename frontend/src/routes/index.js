import React from 'react';
import { Switch, Redirect } from 'react-router-dom';

import Route from './Route';

import Dashboard from '../pages/Dashboard';

import Pointings from '../pages/Pointings';
import PointingsDetail from '../pages/Pointings/Detail';

import SearchSsso from '../pages/SearchSsso';
import SearchSssoDetail from '../pages/SearchSsso/Detail';

import Skybot from '../pages/Skybot';
import SkybotDetail from '../pages/Skybot/Detail';
import SkybotAsteroid from '../pages/Skybot/Asteroid';

import FilterObjects from '../pages/FilterObjects';
import FilterObjectsDetail from '../pages/FilterObjects/Detail';

import Astrometry from '../pages/Astrometry';
import AstrometryDetail from '../pages/Astrometry/Detail';
import AstrometryAsteroid from '../pages/Astrometry/Asteroid';

import RefineOrbit from '../pages/RefineOrbit';
import RefineOrbitDetail from '../pages/RefineOrbit/Detail';
import RefineOrbitAsteroid from '../pages/RefineOrbit/Asteroid';

import PredictionOccultation from '../pages/PredictionOccultation';
import PredictionOccultationDetail from '../pages/PredictionOccultation/Detail';
import PredictionOccultationAsteroid from '../pages/PredictionOccultation/Asteroid';

import Occultation from '../pages/Occultation';
import OccultationDetail from '../pages/Occultation/Detail';
import OccultationCalendar from '../pages/Occultation/Calendar';

import BspJpl from '../pages/BspJpl';
import Observation from '../pages/Observation';
import OrbitalParameter from '../pages/OrbitalParameter';
import JohnstonArchive from '../pages/JohnstonArchive';
import JohnstonArchiveDetail from '../pages/JohnstonArchive/Detail';

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
        path="/astrometry/asteroid/:id"
        component={AstrometryAsteroid}
      />
      <Route
        isPrivate
        exact
        path="/astrometry/:id"
        component={AstrometryDetail}
      />
      <Route isPrivate exact path="/astrometry" component={Astrometry} />
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
      <Route isPrivate exact path="/pointings" component={Pointings} />
      <Route isPrivate exact path="/skybot" component={Skybot} />
      <Route isPrivate exact path="/bsp-jpl" component={BspJpl} />
      <Route isPrivate exact path="/observation" component={Observation} />
      <Route
        isPrivate
        exact
        path="/orbital-parameter"
        component={OrbitalParameter}
      />
      <Route
        isPrivate
        exact
        path="/johnston-archive"
        component={JohnstonArchive}
      />
      <Route
        isPrivate
        exact
        path="/johnston-archive/:id"
        component={JohnstonArchiveDetail}
      />
      <Route isPrivate exact path="/ssso" component={SearchSsso} />
      <Route isPrivate exact path="/filter-objects" component={FilterObjects} />
      <Route
        isPrivate
        exact
        path="/filter-objects/:id"
        component={FilterObjectsDetail}
      />
      <Route isPrivate exact path="/skybot/:id" component={SkybotDetail} />
      <Route
        isPrivate
        exact
        path="/skybot/:runId/asteroid/:id"
        component={SkybotAsteroid}
      />
      <Route
        isPrivate
        exact
        path="/pointings/:id"
        component={PointingsDetail}
      />
      <Route
        isPrivate
        exact
        path="/search-ssso-detail/:id"
        component={SearchSssoDetail}
      />
      <Route isPrivate exact path="/dashboard" component={Dashboard} />
      <Redirect path="/" to="/dashboard" />
    </Switch>
  );
}
