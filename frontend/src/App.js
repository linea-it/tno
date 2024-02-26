import React, { useState, useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '@mui/styles'
import lightTheme from './themes/light'
import darkTheme from './themes/dark'
import AppRoutes from './routes/index'
import { AuthProvider } from './contexts/AuthContext.js'
import { QueryClient, QueryClientProvider } from 'react-query'
import { PredictionEventsProvider } from './contexts/PredictionContext'
import './assets/css/index.css'

const queryClient = new QueryClient()

function App() {
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




              <AppRoutes toggleTheme={toggleTheme} darkMode={darkMode} />
            </BrowserRouter>
          </PredictionEventsProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
