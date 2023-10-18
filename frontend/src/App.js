import React from 'react'
import { MuiThemeProvider } from '@material-ui/core/styles'
import { BrowserRouter } from 'react-router-dom'
import light from './themes/light'
import AppRoutes from './routes'
import history from './services/history'
import { AuthProvider } from './contexts/AuthContext.js'
import { QueryClient, QueryClientProvider } from 'react-query'
import { PredictionEventsProvider } from './contexts/PredictionContext'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MuiThemeProvider theme={light}>
        <AuthProvider>
          <PredictionEventsProvider>
            <BrowserRouter history={history}>
              <AppRoutes />
            </BrowserRouter>
          </PredictionEventsProvider>
        </AuthProvider>
      </MuiThemeProvider>
    </QueryClientProvider>
  )
}

export default App
