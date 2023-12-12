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
// import Occultation from '../pages/Occultation'

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
// import OccultationDetail from '../pages/Occultation/Detail'
import PublicBanner from '../components/PublicPortal/Banner/index'
import PublicDocumentation from '../pages/PublicPortal/documentation/index'
import PublicContact from '../pages/PublicPortal/Contact/index'
import FooterSupporte from '../components/PublicPortal/Footer/FooterSupporters'
import PredictionEvents from '../pages/PredictionEvents/index'
import PredictionEventDetail from '../pages/PredictionEvents/Detail'

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



  const PublicPageRoutes = () => {
    return (
      <>
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
          exact
          path='/prediction-event-detail/:id'
          element={
            <PublicPortalPage>
              <PredictionEventDetail />
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
      </>
    )
  }

  const DashboardPage = ({ children }) => {
    return (
      <>
        <PrivateRoute auth={{ isAuthenticated }}>
          <PersistentDrawerLeft>{children}</PersistentDrawerLeft>
        </PrivateRoute>
      </>
    )
  }

  const DashboardPageRoutes = () => {
    return (
      <>
        {/* Dashboard  Layout*/}
        <Route
          isHomePage
          isPrivate
          exact
          path='/dashboard/stats'
          element={
            <DashboardPage>
              <Dashboard />
            </DashboardPage>
          }
        />
        <Route
          isPrivate
          exact
          path='/dashboard/data-preparation/des/discovery'
          element={
              <DashboardPage>
                <Skybot />
              </DashboardPage>
          }
        />
        <Route
          isPrivate
          exact
          path='/dashboard/data-preparation/des/discovery/:id'
          element={
              <DashboardPage>
                <SkybotDetail />
              </DashboardPage>
          }
        />
        <Route
          isPrivate
          exact
          path='/dashboard/data-preparation/des/statistics'
          element={
              <DashboardPage>
                <SkybotStatistics />
              </DashboardPage>
          }
        />
        <Route
          isPrivate
          exact
          path='/dashboard/data-preparation/des/orbittrace-detail/:id'
          element={
              <DashboardPage>
                <OrbitTraceDetail />
              </DashboardPage>
          }
        />
        <Route
          isPrivate
          exact
          path='/dashboard/data-preparation/des/discovery/asteroid/:id'
          element={
              <DashboardPage>
                <SkybotAsteroid />
              </DashboardPage>
          }
        />
        <Route
          isPrivate
          exact
          path='/dashboard/data-preparation/des/orbittrace/asteroid/:id'
          element={
              <DashboardPage>
                <OrbitTraceAsteroid />
              </DashboardPage>
          }
        />
        <Route
          isPrivate
          exact
          path='/dashboard/data-preparation/des/orbittrace'
          element={
              <DashboardPage>
                <OrbitTrace />
              </DashboardPage>
          }
        />
        <Route
          isPrivate
          exact
          path='/dashboard/data-preparation/des/management'
          element={
              <DashboardPage>
                <DesManagement />
              </DashboardPage>
          }
        />
        <Route
          isPrivate
          exact
          path='/dashboard/data-preparation/des/management'
          element={
              <DashboardPage>
                <DesManagement />
              </DashboardPage>
          }
        />
        <Route
          isPrivate
          exact
          path='/dashboard/prediction-of-occultation'
          element={
              <DashboardPage>
                <PredictOccultation />
              </DashboardPage>
          }
        />
        <Route
          isPrivate
          exact
          path='/dashboard/data-preparation/predict-detail/:id'
          element={
              <DashboardPage>
                <PredictDetail />
              </DashboardPage>
          }
        />
        <Route
          isPrivate
          exact
          path='/dashboard/data-preparation/predict-asteroid/:id'
          element={
              <DashboardPage>
                <PredictionAsteroid />
              </DashboardPage>
          }
        />
        <Route
          isPrivate
          exact
          path='/dashboard/occultation'
          element={
              <DashboardPage>
                <PredictionEvents />
              </DashboardPage>
          }
        />
        {/* <Route
          IsPrivate
          exact
          path='/prediction-event-detail/:id'
          element={
              <PublicPortalPage>
                <PredictionEventDetail />
              </PublicPortalPage>
          }
        /> */}
      </>
    )
  }

  return (
    <Routes>
      {PublicPageRoutes()}
      {DashboardPageRoutes()}
      <Route path='*' element={<Navigate to='/' />} />
    </Routes>
  )
}
