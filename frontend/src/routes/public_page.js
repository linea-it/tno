import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import PublicHeader from '../pages/PublicPortal/Header/index'
import PublicHome from '../pages/PublicPortal/Home'
import PublicAboutUs from '../pages/PublicPortal/AboutUs/index'
// import PublicDocumentation from '../pages/PublicPortal/Documentation/index'
import PublicContact from '../pages/PublicPortal/Contact/index'
import FooterSupporters from '../pages/PublicPortal/Footer/FooterSupporters'
import PredictionEventDetail from '../pages/PredictionEvents/Detail'
import NewsletterSettings from '../pages/PublicPortal/Newsletter/NewsletterSettings'
import EventFilterDetail from '../pages/PublicPortal/Newsletter/EventFilterDetail'
import PublicLogin from '../pages/PublicPortal/Login'

const PublicPortalPage = ({ children }) => {
  return (
    <>
      <PublicHeader />
      {children}
      <FooterSupporters />
    </>
  )
}

export function PublicPageRoutes() {
  return (
    <>
      {/* Public Portal Layout*/}
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
        path='/newsletter_settings'
        element={
          <PublicPortalPage>
            <NewsletterSettings />
          </PublicPortalPage>
        }
      />
      <Route
        isHomePage
        exact
        path='/new_event_filter/'
        element={
          <PublicPortalPage>
            <EventFilterDetail />
          </PublicPortalPage>
        }
      />
      <Route
        isHomePage
        exact
        path='/event_filter_detail/:id'
        element={
          <PublicPortalPage>
            <EventFilterDetail />
          </PublicPortalPage>
        }
      />

      <Route exact path='/login/' element={<PublicLogin />} />
    </>
  )
}

export default function PublicRoutes() {
  return (
    <Routes>
      <PublicPageRoutes />
      <Route path='*' element={<Navigate to='/' />} />
    </Routes>
  )
}
