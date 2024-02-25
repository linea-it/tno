import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import PublicHeader from '../pages/PublicPortal/Header/index'
import PublicHome from '../pages/PublicPortal/Home'
import PublicAboutUs from '../pages/PublicPortal/AboutUs/index'
import PublicDocumentation from '../pages/PublicPortal/documentation/index'
import PublicContact from '../pages/PublicPortal/Contact/index'
import FooterSupporters from '../pages/PublicPortal/Footer/FooterSupporters'
import PredictionEventDetail from '../pages/PredictionEvents/Detail'
import Container from '@mui/material/Container'


const PublicPortalPage = ({ children}) => {
  return (
    <>
      <PublicHeader />
      <Container maxWidth="lg">
        {children}
      </Container>
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
        path='/documentation'
        element={
          <PublicPortalPage>
            <PublicDocumentation />
          </PublicPortalPage>
        }
      />
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
