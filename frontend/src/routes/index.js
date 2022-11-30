import React from 'react';
import { Routes, Route } from 'react-router-dom';

// import Route from './Route';

import Dashboard from '../pages/Dashboard';

// import Download from '../pages/Download';
// import DownloadDetail from '../pages/Download/Detail';

import Skybot from '../pages/Skybot';
import SkybotDetail from '../pages/Skybot/Detail';
import SkybotAsteroid from '../pages/Skybot/Asteroid';

// import RefineOrbit from '../pages/RefineOrbit';
// import RefineOrbitDetail from '../pages/RefineOrbit/Detail';
// import RefineOrbitAsteroid from '../pages/RefineOrbit/Asteroid';

// import PredictionOccultation from '../pages/PredictionOccultation';
// import PredictionOccultationDetail from '../pages/PredictionOccultation/Detail';
// import PredictionOccultationAsteroid from '../pages/PredictionOccultation/Asteroid';

// import Occultation from '../pages/Occultation';
// import OccultationDetail from '../pages/Occultation/Detail';
// import OccultationCalendar from '../pages/Occultation/Calendar';

import Home from '../pages/LandingPage/Home';
import AboutUs from '../pages/LandingPage/AboutUs';
import Help from '../pages/LandingPage/Help';
import Tutorials from '../pages/LandingPage/Tutorials';
import Contact from '../pages/LandingPage/Contact';
import Notfound from '../pages/LandingPage/NotFound';

export default function AppRoutes() {
  return (
    <Routes>
      <Route isHomePage exact path="/" element={<Home />} />
      <Route isHomePage exact path="/about-us" element={<AboutUs />} />
      <Route isHomePage exact path="/help" element={<Help />} />
      <Route isHomePage exact path="/tutorials" element={<Tutorials />} />
      <Route isHomePage exact path="/contact-us" element={<Contact />} />
      <Route isPrivate exact path="/dashboard" element={<Dashboard />} />
      <Route element={<Notfound />} />
      <Route
        isPrivate
        exact
        path="/data-preparation/des/discovery"
        element={<Skybot />}
      />
      <Route
        isPrivate
        exact
        path="/data-preparation/des/discovery/:id"
        element={<SkybotDetail />}
      />
      <Route
        isPrivate
        exact
        path="/data-preparation/des/discovery/asteroid/:id"
        element={<SkybotAsteroid />}
      />
      {/* <Route isPrivate exact path="/refine-orbit" element={RefineOrbit} />
      <Route
        isPrivate
        exact
        path="/refine-orbit/:id"
        element={RefineOrbitDetail}
      />
      <Route
        isPrivate
        exact
        path="/refine-orbit/asteroid/:id"
        element={RefineOrbitAsteroid}
      />
      <Route
        isPrivate
        exact
        path="/prediction-of-occultation/asteroid/:id"
        element={PredictionOccultationAsteroid}
      />
      <Route
        isPrivate
        exact
        path="/prediction-of-occultation/:id"
        element={PredictionOccultationDetail}
      />
      <Route
        isPrivate
        exact
        path="/prediction-of-occultation"
        element={PredictionOccultation}
      />
      <Route
        isPrivate
        exact
        path="/occultation-calendar"
        element={OccultationCalendar}
      />
      <Route
        isPrivate
        exact
        path="/occultation-calendar-back/:id/:date/:view/:sDate/:fDate/:searching"
        element={OccultationCalendar}
      />
      <Route isPrivate exact path="/occultation" element={Occultation} />
      <Route
        isPrivate
        exact
        path="/occultation/:id"
        element={OccultationDetail}
      /> */}
      {/* <Route
        isPrivate
        exact
        path="/data-preparation/des/download"
        element={Download}
      />
      <Route
        isPrivate
        exact
        path="/data-preparation/des/download/:id"
        element={DownloadDetail}
      /> */}
    </Routes>
  );
}
