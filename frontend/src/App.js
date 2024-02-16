import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import light from './themes/light'
import AppRoutes from './routes'
import history from './services/history'
import { AuthProvider } from './contexts/AuthContext.js'
import { QueryClient, QueryClientProvider } from 'react-query'
import { PredictionEventsProvider } from './contexts/PredictionContext'
import { ThemeProvider } from '@mui/styles'
import './assets/css/index.css'

const queryClient = new QueryClient()
function App() {

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={light}>
        <AuthProvider>
          <PredictionEventsProvider>
            <BrowserRouter history={history}>
              <AppRoutes />
            </BrowserRouter>
          </PredictionEventsProvider>
        </AuthProvider>
      </ThemeProvider >
    </QueryClientProvider>
  )
}

export default App
