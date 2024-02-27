import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { PublicPageRoutes } from './public_page'
import { DashboardPageRoutes } from './dashboard'

export default function AppRoutes() {
  return (
    <Routes>
      {PublicPageRoutes()}
      {DashboardPageRoutes()}
      <Route path='*' element={<Navigate to='/' />} />
    </Routes>
  )
}
