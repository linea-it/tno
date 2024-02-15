import React from 'react'
import { ThemeProvider } from '@mui/styles';
import { BrowserRouter } from 'react-router-dom'
import light from './themes/light'
import history from './services/history'
import { AuthProvider } from './contexts/AuthContext.js'
import { QueryClient, QueryClientProvider } from 'react-query'
import { PredictionEventsProvider } from './contexts/PredictionContext'
import DashboardRoutes from './routes/dashboard'
const queryClient = new QueryClient()
function DashboardApp() {

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={light}>
        <AuthProvider>
          <PredictionEventsProvider>
            <BrowserRouter history={history}>
              <DashboardRoutes />
            </BrowserRouter>
          </PredictionEventsProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default DashboardApp
