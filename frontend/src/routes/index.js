import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

import Dashboard from '../pages/Dashboard'

import Skybot from '../pages/Skybot'
import SkybotDetail from '../pages/Skybot/Detail'
import SkybotAsteroid from '../pages/Skybot/Asteroid'
import OrbitTrace from '../pages/OrbitTrace/'
import DesManagement from '../pages/DesManagement'

import PredictOccultation from '../pages/PredictOccultation'

import Occultation from '../pages/Occultation'

import Home from '../pages/LandingPage/Home'
import AboutUs from '../pages/LandingPage/AboutUs'
import Help from '../pages/LandingPage/Help'
import Tutorials from '../pages/LandingPage/Tutorials'
import Contact from '../pages/LandingPage/Contact'

import { useAuth } from '../contexts/AuthContext.js'
import Header from '../components/LandingPage/Header'
import Footer from '../components/LandingPage/Footer'
// import Drawer from '../components/Drawer';
import PersistentDrawerLeft from '../components/Drawer'
// import RefineOrbit from '../pages/RefineOrbit';
// import RefineOrbitDetail from '../pages/RefineOrbit/Detail';
// import RefineOrbitAsteroid from '../pages/RefineOrbit/Asteroid';

// import PredictionOccultation from '../pages/PredictionOccultation';
// import PredictionOccultationDetail from '../pages/PredictionOccultation/Detail';
// import PredictionOccultationAsteroid from '../pages/PredictionOccultation/Asteroid';

// import Occultation from '../pages/Occultation';
// import OccultationDetail from '../pages/Occultation/Detail';
// import OccultationCalendar from '../pages/Occultation/Calendar';

// import Download from '../pages/Download';
// import DownloadDetail from '../pages/Download/Detail';

export default function AppRoutes() {
  const { isAuthenticated, signIn } = useAuth()

  const PrivateRoute = ({ auth: { isAuthenticated }, children }) => {
    return isAuthenticated ? children : signIn()
  }

  const LandingPage = ({ children }) => {
    return (
      <>
        <Header />
        {children}
        <Footer />
      </>
    )
  }

  const DashboardPage = ({ children }) => {
    return (
      <>
        <PersistentDrawerLeft>{children}</PersistentDrawerLeft>
      </>
    )
  }

  return (
    <Routes>
      {/* Landing Page  Layout*/}
      <Route
        isHomePage
        exact
        path='/'
        element={
          <LandingPage>
            <Home />
          </LandingPage>
        }
      />
      <Route
        isHomePage
        exact
        path='/about-us'
        element={
          <LandingPage>
            <AboutUs />
          </LandingPage>
        }
      />
      <Route
        isHomePage
        exact
        path='/help'
        element={
          <LandingPage>
            <Help />
          </LandingPage>
        }
      />
      <Route
        isHomePage
        exact
        path='/tutorials'
        element={
          <LandingPage>
            <Tutorials />
          </LandingPage>
        }
      />
      <Route
        isHomePage
        exact
        path='/contact-us'
        element={
          <LandingPage>
            <Contact />
          </LandingPage>
        }
      />

      {/* Dashboard  Layout*/}
      <Route
        isPrivate
        exact
        path='/dashboard'
        element={
          <PrivateRoute auth={{ isAuthenticated }}>
            <DashboardPage>
              <Dashboard />
            </DashboardPage>
          </PrivateRoute>
        }
      />
      <Route
        isPrivate
        exact
        path='/data-preparation/des/discovery'
        element={
          <PrivateRoute auth={{ isAuthenticated }}>
            <DashboardPage>
              <Skybot />
            </DashboardPage>
          </PrivateRoute>
        }
      />
      <Route
        isPrivate
        exact
        path='/data-preparation/des/discovery/:id'
        element={
          <PrivateRoute auth={{ isAuthenticated }}>
            <DashboardPage>
              <SkybotDetail />
            </DashboardPage>
          </PrivateRoute>
        }
      />
      <Route
        isPrivate
        exact
        path='/data-preparation/des/discovery/asteroid/:id'
        element={
          <PrivateRoute auth={{ isAuthenticated }}>
            <DashboardPage>
              <SkybotAsteroid />
            </DashboardPage>
          </PrivateRoute>
        }
      />
      <Route
        isPrivate
        exact
        path='/data-preparation/des/orbit_trace'
        element={
          <PrivateRoute auth={{ isAuthenticated }}>
            <DashboardPage>
              <OrbitTrace />
            </DashboardPage>
          </PrivateRoute>
        }
      />
      <Route
        isPrivate
        exact
        path='/data-preparation/des/management'
        element={
          <PrivateRoute auth={{ isAuthenticated }}>
            <DashboardPage>
              <DesManagement />
            </DashboardPage>
          </PrivateRoute>
        }
      />
      <Route
        isPrivate
        exact
        path='/data-preparation/des/management'
        element={
          <PrivateRoute auth={{ isAuthenticated }}>
            <DashboardPage>
              <DesManagement />
            </DashboardPage>
          </PrivateRoute>
        }
      />
      <Route
        isPrivate
        exact
        path='/predict_occultation'
        element={
          <PrivateRoute auth={{ isAuthenticated }}>
            <DashboardPage>
              <PredictOccultation />
            </DashboardPage>
          </PrivateRoute>
        }
      />
      <Route
        isPrivate
        exact
        path='/occultation'
        element={
          <PrivateRoute auth={{ isAuthenticated }}>
            <DashboardPage>
              <Occultation />
            </DashboardPage>
          </PrivateRoute>
        }
      />

      <Route path='*' element={<Navigate to='/' />} />

      {/* <Route element={<Notfound />} />       */}
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
  )
}
