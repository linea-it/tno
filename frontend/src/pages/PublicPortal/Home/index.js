import React, { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import PredictionEventsFilter from '../../../components/PredictionEventsFilter/index'
import PredictionEventsDataGrid from '../../../components/PredictionEventsDataGrid/index'
import PredictionHighlights from '../../../components/PredictionHighlights/index'
import PublicBanner from '../Banner/index'
import Container from '@mui/material/Container'
import { whichEnvironment } from '../../../services/api/Auth'
import AlertEnvironment from '../../../components/AlertEnvironment/index'

function Main() {
  const [isDev, setIsDev] = useState(false)

  useEffect(() => {
    whichEnvironment()
      .then((res) => {
        setIsDev(res.is_dev)
      })
      .catch(() => {
        // isDev permanece false — banner de ambiente não exibido
      })
  }, [])

  return (
    <>
      {isDev && <AlertEnvironment />}
      <PublicBanner />
      <Container maxWidth='lg' sx={{ mt: 3 }}>
        <PredictionHighlights />
        <Box sx={{ mt: 3 }}>
          <PredictionEventsFilter />
          <Box sx={{ mt: 2 }}>
            {isDev && <AlertEnvironment />}
            <PredictionEventsDataGrid />
          </Box>
        </Box>
      </Container>
    </>
  )
}

export default Main
