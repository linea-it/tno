import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import PublicHeader from '../components/PublicPortal/Header/index'
import PublicHome from '../pages/PublicPortal/Home'
import PublicAboutUs from '../pages/PublicPortal/AboutUs/index'
import PublicDocumentation from '../pages/PublicPortal/documentation/index'
import PublicContact from '../pages/PublicPortal/Contact/index'
import FooterSupporte from '../components/PublicPortal/Footer/FooterSupporters'
import PredictionEventDetail from '../pages/PredictionEvents/Detail'


export default function PublicRoutes() {

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
      </>
    )
  }

  return (
    <Routes>
      {PublicPageRoutes()}
      <Route path='*' element={<Navigate to='/' />} />
    </Routes>
  )
}
