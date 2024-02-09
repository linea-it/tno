import React from 'react'
import { ThemeProvider } from '@mui/styles';
import { BrowserRouter } from 'react-router-dom'
import light from './themes/light'
// import AppRoutes from './routes'
import history from './services/history'
import { AuthProvider } from './contexts/AuthContext.js'
import { QueryClient, QueryClientProvider } from 'react-query'
import { PredictionEventsProvider } from './contexts/PredictionContext'
import PublicRoutes from './routes/public_page'

const queryClient = new QueryClient()
function PublicApp() {

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={light}>
        <AuthProvider>
          <PredictionEventsProvider>
            <BrowserRouter history={history}>
              {/* <AppRoutes /> */}
              <PublicRoutes />
            </BrowserRouter>
          </PredictionEventsProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default PublicApp
