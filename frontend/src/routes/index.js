import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

import Dashboard from '../pages/Dashboard'

import Skybot from '../pages/Skybot'
import SkybotDetail from '../pages/Skybot/Detail'
import SkybotAsteroid from '../pages/Skybot/Asteroid'
import OrbitTrace from '../pages/OrbitTrace/'
import DesManagement from '../pages/DesManagement'

import PredictOccultation from '../pages/PredictOccultation'
import PredictDetail from '../pages/PredictOccultation/Detail'
import PredictionAsteroid from '../pages/PredictOccultation/Asteroid'

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
import OrbitTraceDetail from '../pages/OrbitTrace/Detail'
import OrbitTraceAsteroid from '../pages/OrbitTrace/Asteroid'
import PublicHeader from '../components/PublicPortal/Header/index'
import PublicFooter from '../components/PublicPortal/Footer/index'
import PublicHome from '../pages/PublicPortal/Home'
import PublicAboutUs from '../pages/PublicPortal/AboutUs/index'
import PublicTutorials from '../pages/PublicPortal/Tutorials/index'
import PublicOccultation from '../pages/PublicPortal/occultation/index'
import OccultationDetail from '../pages/Occultation/Detail'
import PublicSupporters from '../pages/PublicPortal/Home/partials/Supporters/index'
import PublicBanner from '../components/PublicPortal/Banner/index'
import PublicInterfaces from '../pages/PublicPortal/Home/partials/Interfaces/index'
// import RefineOrbit from '../pages/RefineOrbit';
// import RefineOrbitDetail from '../pages/RefineOrbit/Detail';
// import RefineOrbitAsteroid from '../pages/RefineOrbit/Asteroid';

// import PredictionOccultation from '../pages/PredictionOccultation';
// import PredictionOccultationDetail from '../pages/PredictionOccultation/Detail';
// import PredictionOccultationAsteroid from '../pages/PredictionOccultation/Asteroid';

// import Occultation from '../pages/dashboard/data-preparation/occultation';
// import OccultationDetail from '../pages/dashboard/data-preparation/occultation/Detail';
// import OccultationCalendar from '../pages/dashboard/data-preparation/occultation/Calendar';

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

  const PublicPortalPage = ({ children }) => {
    return (
      <>
        <PublicHeader />
        {children}
        <PublicFooter />
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
      {/* Public Portal  Layout*/}
      <Route
        isHomePage
        exact
        path='/'
        element={
          <PublicPortalPage>
            <PublicHome />
          </PublicPortalPage>
        }
      />
      <Route
        isHomePage
        exact
        path='/occultation-detail/:id'
        element={
          <PublicPortalPage>
            <PublicBanner />
            <OccultationDetail />
            <PublicSupporters />
          </PublicPortalPage>
        }
      />
      <Route
        isHomePage
        exact
        path='/about-us'
        element={
          <PublicPortalPage>
            <PublicAboutUs />
          </PublicPortalPage>
        }
      />
      <Route
        isHomePage
        exact
        path='/tutorials'
        element={
          <PublicPortalPage>
            <PublicTutorials />
          </PublicPortalPage>
        }
      />
       <Route
        isHomePage
        exact
        path='/public-occultation'
        element={
          <PublicPortalPage>
            <PublicOccultation/>
          </PublicPortalPage>
        }
      />
      {/* Landing Page  Layout*/}
      <Route
        isHomePage
        exact
        path='/'
        element={
          <PublicPortalPage>
            <PublicHome />
          </PublicPortalPage>
        }
      />
      <Route
        isHomePage
        exact
        path='/privatePortal'
        element={
          <LandingPage>
            <Home />
          </LandingPage>
        }
      />
      
      {/* Dashboard  Layout*/}
      <Route
        isPrivate
        exact
        path='/dashboard/data-preparation/des/statistics'
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
        path='/dashboard/data-preparation/des/discovery'
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
        path='/dashboard/data-preparation/des/discovery/:id'
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
        path='/dashboard/data-preparation/des/orbittrace-detail/:id'
        element={
          <PrivateRoute auth={{ isAuthenticated }}>
            <DashboardPage>
              <OrbitTraceDetail />
            </DashboardPage>
          </PrivateRoute>
        }
      />
      <Route
        isPrivate
        exact
        path='/dashboard/data-preparation/des/discovery/asteroid/:id'
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
        path='/dashboard/data-preparation/des/orbittrace/asteroid/:id'
        element={
          <PrivateRoute auth={{ isAuthenticated }}>
            <DashboardPage>
              <OrbitTraceAsteroid />
            </DashboardPage>
          </PrivateRoute>
        }
      />
      <Route
        isPrivate
        exact
        path='/dashboard/data-preparation/des/orbit_trace'
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
        path='/dashboard/data-preparation/des/management'
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
        path='/dashboard/data-preparation/des/management'
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
        path='/dashboard/data-preparation/prediction-of-occultation'
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
        path='/dashboard/data-preparation/predict-detail/:id'
        element={
          <PrivateRoute auth={{ isAuthenticated }}>
            <DashboardPage>
              <PredictDetail />
            </DashboardPage>
          </PrivateRoute>
        }
      />
      <Route
        isPrivate
        exact
        path='/dashboard/data-preparation/predict-asteroid/:id'
        element={
          <PrivateRoute auth={{ isAuthenticated }}>
            <DashboardPage>
              <PredictionAsteroid />
            </DashboardPage>
          </PrivateRoute>
        }
      />
      <Route
        isPrivate
        exact
        path='/dashboard/data-preparation/occultation'
        element={
          <PrivateRoute auth={{ isAuthenticated }}>
            <DashboardPage>
              <Occultation />
            </DashboardPage>
          </PrivateRoute>
        }
      />
      <Route
        IsPrivate
        exact
        path='/dashboard/data-preparation/occultation-detail/:id'
        element={
          <PrivateRoute auth={{ isAuthenticated }}>
            <DashboardPage>
              <OccultationDetail />
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
        path="/dashboard/data-preparation/prediction-of-occultation/asteroid/:id"
        element={PredictionOccultationAsteroid}
      />
      <Route
        isPrivate
        exact
        path="/dashboard/data-preparation/prediction-of-occultation/:id"
        element={PredictionOccultationDetail}
      />
      <Route
        isPrivate
        exact
        path="/dashboard/data-preparation/prediction-of-occultation"
        element={PredictionOccultation}
      />
      <Route
        isPrivate
        exact
        path="/dashboard/data-preparation/occultation-calendar"
        element={OccultationCalendar}
      />
      <Route
        isPrivate
        exact
        path="/dashboard/data-preparation/occultation-calendar-back/:id/:date/:view/:sDate/:fDate/:searching"
        element={OccultationCalendar}
      />
      <Route isPrivate exact path="/dashboard/data-preparation/occultation" element={Occultation} />
      <Route
        isPrivate
        exact
        path="/dashboard/data-preparation/occultation/:id"
        element={OccultationDetail}
      /> */}
      {/* <Route
        isPrivate
        exact
        path="/dashboard/data-preparation/des/download"
        element={Download}
      />
      <Route
        isPrivate
        exact
        path="/dashboard/data-preparation/des/download/:id"
        element={DownloadDetail}
      /> */}
    </Routes>
  )
}
