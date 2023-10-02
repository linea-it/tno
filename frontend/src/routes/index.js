import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

import Dashboard from '../pages/Dashboard'
import Grid from '@material-ui/core/Grid'
import Skybot from '../pages/Skybot'
import SkybotDetail from '../pages/Skybot/Detail'
import SkybotAsteroid from '../pages/Skybot/Asteroid'
import SkybotStatistics from '../pages/Skybot/Statistics'
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
import styles from './styles'
import { useAuth } from '../contexts/AuthContext.js'
import Header from '../components/LandingPage/Header'
import Footer from '../components/LandingPage/Footer'
import PersistentDrawerLeft from '../components/Drawer'
import OrbitTraceDetail from '../pages/OrbitTrace/Detail'
import OrbitTraceAsteroid from '../pages/OrbitTrace/Asteroid'
import PublicHeader from '../components/PublicPortal/Header/index'
import PublicHome from '../pages/PublicPortal/Home'
import PublicAboutUs from '../pages/PublicPortal/AboutUs/index'
import PublicTutorials from '../pages/PublicPortal/Contact/index'
import PublicOccultation from '../pages/PublicPortal/documentation/index'
import OccultationDetail from '../pages/Occultation/Detail'
import PublicSupporters from '../pages/PublicPortal/Home/partials/Supporters/index'
import PublicBanner from '../components/PublicPortal/Banner/index'
import PublicDocumentation from '../pages/PublicPortal/documentation/index'
import PublicContact from '../pages/PublicPortal/Contact/index'
import FooterSupporte from '../components/PublicPortal/Footer/FooterSupporters'


export default function AppRoutes() {
  const { isAuthenticated, signIn } = useAuth()
  const classes = styles()
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
        <FooterSupporte />
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
            <div className={classes.root}>
              <Grid container justifyContent="center" alignItems="center">
                <div className={classes.titleItem}><label>Occultation Prediction Details</label></div>
              </Grid><br></br>
              <OccultationDetail />
              <PublicSupporters />
            </div>
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
        path='/contact-us'
        element={
          <PublicPortalPage>
            <PublicContact />
          </PublicPortalPage>
        }
      />
      <Route
        isHomePage
        exact
        path='/documentation'
        element={
          <PublicPortalPage>
            <PublicDocumentation />
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
        path='/dashboard'
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
        path='/dashboard/stats'
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
        path='/dashboard/data-preparation/des/statistics'
        element={
          <PrivateRoute auth={{ isAuthenticated }}>
            <DashboardPage>
              <SkybotStatistics />
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
        path='/dashboard/data-preparation/des/orbittrace'
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
        path='/dashboard/prediction-of-occultation'
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
        path='/dashboard/occultation'
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
        path='/dashboard/occultation-detail/:id'
        element={
          <PrivateRoute auth={{ isAuthenticated }}>
            <DashboardPage>
              <OccultationDetail />
            </DashboardPage>
          </PrivateRoute>
        }
      />

      <Route path='*' element={<Navigate to='/' />} />
    </Routes>
  )
}
