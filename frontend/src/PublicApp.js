import React, { useState, useEffect } from 'react'
import { ThemeProvider } from '@mui/styles'
import { BrowserRouter } from 'react-router-dom'
import lightTheme from './themes/light'
import darkTheme from './themes/dark'
import { AuthProvider } from './contexts/AuthContext.js'
import { QueryClient, QueryClientProvider } from 'react-query'
import { PredictionEventsProvider } from './contexts/PredictionContext'
import PublicRoutes from './routes/public_page'

const queryClient = new QueryClient()

function PublicApp() {
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const darkModePreference = localStorage.getItem('darkMode')
    setDarkMode(darkModePreference === '1')
  }, [])

  const toggleTheme = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    localStorage.setItem('darkMode', newDarkMode ? '1' : '0')
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
        <AuthProvider>
          <PredictionEventsProvider>
            <BrowserRouter>
              <PublicRoutes toggleTheme={toggleTheme} darkMode={darkMode} />
            </BrowserRouter>
          </PredictionEventsProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default PublicApp
