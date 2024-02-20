import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import PublicHeader from '../pages/PublicPortal/Header/index'
import PublicHome from '../pages/PublicPortal/Home'
import PublicAboutUs from '../pages/PublicPortal/AboutUs/index'
import PublicDocumentation from '../pages/PublicPortal/documentation/index'
import PublicContact from '../pages/PublicPortal/Contact/index'
import FooterSupporters from '../pages/PublicPortal/Footer/FooterSupporters'
import PredictionEventDetail from '../pages/PredictionEvents/Detail'

const PublicPortalPage = ({ children, toggleTheme, darkMode }) => {
  return (
    <>
      <PublicHeader toggleTheme={toggleTheme} darkMode={darkMode} />
      {children}
      <FooterSupporters />
    </>
  )
}

export function PublicPageRoutes({ toggleTheme, darkMode }) {
  return (
    <>
      {/* Public Portal Layout*/}
      <Route
        isHomePage
        exact
        path='/'
        element={
          <PublicPortalPage toggleTheme={toggleTheme} darkMode={darkMode}>
            <PublicHome />
          </PublicPortalPage>
        }
      />
      <Route
        exact
        path='/prediction-event-detail/:id'
        element={
          <PublicPortalPage toggleTheme={toggleTheme} darkMode={darkMode}>
            <PredictionEventDetail />
          </PublicPortalPage>
        }
      />

      <Route
        isHomePage
        exact
        path='/about-us'
        element={
          <PublicPortalPage toggleTheme={toggleTheme} darkMode={darkMode}>
            <PublicAboutUs />
          </PublicPortalPage>
        }
      />
      <Route
        isHomePage
        exact
        path='/contact-us'
        element={
          <PublicPortalPage toggleTheme={toggleTheme} darkMode={darkMode}>
            <PublicContact />
          </PublicPortalPage>
        }
      />
      <Route
        isHomePage
        exact
        path='/documentation'
        element={
          <PublicPortalPage toggleTheme={toggleTheme} darkMode={darkMode}>
            <PublicDocumentation />
          </PublicPortalPage>
        }
      />
      {/* Landing Page Layout*/}
      <Route
        isHomePage
        exact
        path='/'
        element={
          <PublicPortalPage toggleTheme={toggleTheme} darkMode={darkMode}>
            <PublicHome />
          </PublicPortalPage>
        }
      />
    </>
  )
}

export default function PublicRoutes({ toggleTheme, darkMode }) {
  return (
    <Routes>
      <PublicPageRoutes toggleTheme={toggleTheme} darkMode={darkMode} />
      <Route path='*' element={<Navigate to='/' />} />
    </Routes>
  )
}
