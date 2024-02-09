import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

import Dashboard from '../pages/Dashboard'
// import Skybot from '../pages/Skybot'
// import SkybotDetail from '../pages/Skybot/Detail'
// import SkybotAsteroid from '../pages/Skybot/Asteroid'
// import SkybotStatistics from '../pages/Skybot/Statistics'
// import OrbitTrace from '../pages/OrbitTrace/'
// import DesManagement from '../pages/DesManagement'

import PredictOccultation from '../pages/PredictOccultation'
import PredictDetail from '../pages/PredictOccultation/Detail'
import PredictionAsteroid from '../pages/PredictOccultation/Asteroid'


import Home from '../pages/LandingPage/Home'
import { useAuth } from '../contexts/AuthContext.js'
import Header from '../components/LandingPage/Header'
import Footer from '../components/LandingPage/Footer'
import PersistentDrawerLeft from '../components/Drawer'
// import OrbitTraceDetail from '../pages/OrbitTrace/Detail'
// import OrbitTraceAsteroid from '../pages/OrbitTrace/Asteroid'
import PublicHeader from '../pages/PublicPortal/Header/index'
import PublicHome from '../pages/PublicPortal/Home'
import PublicAboutUs from '../pages/PublicPortal/AboutUs/index'
import PublicDocumentation from '../pages/PublicPortal/documentation/index'
import PublicContact from '../pages/PublicPortal/Contact/index'
import FooterSupporters from '../pages/PublicPortal/Footer/FooterSupporters'

import PredictionEvents from '../pages/PredictionEvents/index'
import PredictionEventDetail from '../pages/PredictionEvents/Detail'

import AsteroidJob from '../pages/AsteroidJob/index'
import AsteroidJobDetail from '../pages/AsteroidJob/AsteroidJobDetail'

import { PublicPageRoutes } from './public_page'
import { DashboardPageRoutes } from './dashboard'

export default function AppRoutes() {
  const { isAuthenticated, signIn } = useAuth()

  // const PrivateRoute = ({ auth: { isAuthenticated }, children }) => {
  //   return isAuthenticated ? children : signIn()
  // }

  // const LandingPage = ({ children }) => {
  //   return (
  //     <>
  //       <Header />
  //       {children}
  //       <Footer />
  //     </>
  //   )
  // }

  // const PublicPortalPage = ({ children }) => {
  //   return (
  //     <>
  //       <PublicHeader />
  //       {children}
  //       <FooterSupporters />
  //     </>
  //   )
  // }



  // const PublicPageRoutes = () => {
  //   return (
  //     <>
  //       {/* Public Portal  Layout*/}
  //       <Route
  //         isHomePage
  //         exact
  //         path='/'
  //         element={
  //           <PublicPortalPage>
  //             <PublicHome />
  //           </PublicPortalPage>
  //         }
  //       />
  //       <Route
  //         exact
  //         path='/prediction-event-detail/:id'
  //         element={
  //           <PublicPortalPage>
  //             <PredictionEventDetail />
  //           </PublicPortalPage>
  //         }
  //       />

  //       <Route
  //         isHomePage
  //         exact
  //         path='/about-us'
  //         element={
  //           <PublicPortalPage>
  //             <PublicAboutUs />
  //           </PublicPortalPage>
  //         }
  //       />
  //       <Route
  //         isHomePage
  //         exact
  //         path='/contact-us'
  //         element={
  //           <PublicPortalPage>
  //             <PublicContact />
  //           </PublicPortalPage>
  //         }
  //       />
  //       <Route
  //         isHomePage
  //         exact
  //         path='/documentation'
  //         element={
  //           <PublicPortalPage>
  //             <PublicDocumentation />
  //           </PublicPortalPage>
  //         }
  //       />
  //       {/* Landing Page  Layout*/}
  //       <Route
  //         isHomePage
  //         exact
  //         path='/'
  //         element={
  //           <PublicPortalPage>
  //             <PublicHome />
  //           </PublicPortalPage>
  //         }
  //       />
  //       <Route
  //         isHomePage
  //         exact
  //         path='/dashboard'
  //         element={
  //           <LandingPage>
  //             <Home />
  //           </LandingPage>
  //         }
  //       />
  //     </>
  //   )
  // }

  // const DashboardPage = ({ children }) => {
  //   return (
  //     <>
  //       <PrivateRoute auth={{ isAuthenticated }}>
  //         <PersistentDrawerLeft>{children}</PersistentDrawerLeft>
  //       </PrivateRoute>
  //     </>
  //   )
  // }

  // const DashboardPageRoutes = () => {
  //   return (
  //     <>
  //       {/* Dashboard  Layout*/}
  //       <Route
  //         isHomePage
  //         isPrivate
  //         exact
  //         path='/dashboard/stats'
  //         element={
  //           <DashboardPage>
  //             <Dashboard />
  //           </DashboardPage>
  //         }
  //       />
  //       {/* <Route
  //         isPrivate
  //         exact
  //         path='/dashboard/data-preparation/des/discovery'
  //         element={
  //             <DashboardPage>
  //               <Skybot />
  //             </DashboardPage>
  //         }
  //       />
  //       <Route
  //         isPrivate
  //         exact
  //         path='/dashboard/data-preparation/des/discovery/:id'
  //         element={
  //             <DashboardPage>
  //               <SkybotDetail />
  //             </DashboardPage>
  //         }
  //       />
  //       <Route
  //         isPrivate
  //         exact
  //         path='/dashboard/data-preparation/des/statistics'
  //         element={
  //             <DashboardPage>
  //               <SkybotStatistics />
  //             </DashboardPage>
  //         }
  //       />
  //       <Route
  //         isPrivate
  //         exact
  //         path='/dashboard/data-preparation/des/orbittrace-detail/:id'
  //         element={
  //             <DashboardPage>
  //               <OrbitTraceDetail />
  //             </DashboardPage>
  //         }
  //       />
  //       <Route
  //         isPrivate
  //         exact
  //         path='/dashboard/data-preparation/des/discovery/asteroid/:id'
  //         element={
  //             <DashboardPage>
  //               <SkybotAsteroid />
  //             </DashboardPage>
  //         }
  //       />
  //       <Route
  //         isPrivate
  //         exact
  //         path='/dashboard/data-preparation/des/orbittrace/asteroid/:id'
  //         element={
  //             <DashboardPage>
  //               <OrbitTraceAsteroid />
  //             </DashboardPage>
  //         }
  //       />
  //       <Route
  //         isPrivate
  //         exact
  //         path='/dashboard/data-preparation/des/orbittrace'
  //         element={
  //             <DashboardPage>
  //               <OrbitTrace />
  //             </DashboardPage>
  //         }
  //       />
  //       <Route
  //         isPrivate
  //         exact
  //         path='/dashboard/data-preparation/des/management'
  //         element={
  //             <DashboardPage>
  //               <DesManagement />
  //             </DashboardPage>
  //         }
  //       />
  //       <Route
  //         isPrivate
  //         exact
  //         path='/dashboard/data-preparation/des/management'
  //         element={
  //             <DashboardPage>
  //               <DesManagement />
  //             </DashboardPage>
  //         }
  //       /> */}
  //       <Route
  //         isPrivate
  //         exact
  //         path='/dashboard/prediction-of-occultation'
  //         element={
  //           <DashboardPage>
  //             <PredictOccultation />
  //           </DashboardPage>
  //         }
  //       />
  //       <Route
  //         isPrivate
  //         exact
  //         path='/dashboard/data-preparation/predict-detail/:id'
  //         element={
  //           <DashboardPage>
  //             <PredictDetail />
  //           </DashboardPage>
  //         }
  //       />
  //       <Route
  //         isPrivate
  //         exact
  //         path='/dashboard/data-preparation/predict-asteroid/:id'
  //         element={
  //           <DashboardPage>
  //             <PredictionAsteroid />
  //           </DashboardPage>
  //         }
  //       />
  //       <Route
  //         isPrivate
  //         exact
  //         path='/dashboard/occultation'
  //         element={
  //           <DashboardPage>
  //             <PredictionEvents />
  //           </DashboardPage>
  //         }
  //       />
  //       <Route
  //         isPrivate
  //         exact
  //         path='/dashboard/asteroid_job'
  //         element={
  //           <DashboardPage>
  //             <AsteroidJob />
  //           </DashboardPage>
  //         }
  //       />
  //       <Route
  //         isPrivate
  //         exact
  //         path='/dashboard/asteroid_job/:id'
  //         element={
  //           <DashboardPage>
  //             <AsteroidJobDetail />
  //           </DashboardPage>
  //         }
  //       />
  //     </>
  //   )
  // }

  return (
    <Routes>
      {PublicPageRoutes()}
      {DashboardPageRoutes()}
      <Route path='*' element={<Navigate to='/' />} />
    </Routes>
  )
}
