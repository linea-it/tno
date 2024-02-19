import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

import Dashboard from '../pages/Dashboard'
import Skybot from '../pages/Skybot'
import SkybotDetail from '../pages/Skybot/Detail'
import SkybotAsteroid from '../pages/Skybot/Asteroid'
import SkybotStatistics from '../pages/Skybot/Statistics'
import OrbitTrace from '../pages/OrbitTrace/'
import DesManagement from '../pages/DesManagement'

import PredictOccultation from '../pages/PredictOccultation'
import PredictDetail from '../pages/PredictOccultation/Detail'
import PredictionAsteroid from '../pages/PredictOccultation/Asteroid'

import { useAuth } from '../contexts/AuthContext.js'
import Header from '../components/LandingPage/Header'
import Footer from '../components/LandingPage/Footer'
import PersistentDrawerLeft from '../components/Drawer'
import OrbitTraceDetail from '../pages/OrbitTrace/Detail'
import OrbitTraceAsteroid from '../pages/OrbitTrace/Asteroid'
import PredictionEvents from '../pages/PredictionEvents/index'

import AsteroidJob from '../pages/AsteroidJob/index'
import AsteroidJobDetail from '../pages/AsteroidJob/AsteroidJobDetail'
import Home from '../pages/LandingPage/Home'

export function DashboardPageRoutes() {
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
        <PrivateRoute auth={{ isAuthenticated }}>
          <PersistentDrawerLeft>{children}</PersistentDrawerLeft>
        </PrivateRoute>
      </>
    )
  }

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
      <Route
        isPrivate
        exact
        path='/dashboard/asteroid_job'
        element={
          <DashboardPage>
            <AsteroidJob />
          </DashboardPage>
        }
      />
      <Route
        isPrivate
        exact
        path='/dashboard/asteroid_job/:id'
        element={
          <DashboardPage>
            <AsteroidJobDetail />
          </DashboardPage>
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

export default function DashboardRoutes() {
  return (
    <Routes>
      {DashboardPageRoutes()}
      <Route path='*' element={<Navigate to='/dashboard/' />} />
    </Routes>
  )
}
