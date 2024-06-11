import React, { useEffect, useState } from 'react'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
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
        // TODO: Aviso de erro
      })
  }, [])

  return (
    <>
      {isDev && <AlertEnvironment />}
      <PublicBanner />
      <Container maxWidth='lg'>
        <PredictionHighlights />
        <Box mt={3}>
          <Grid>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <PredictionEventsFilter />
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                {isDev && <AlertEnvironment />}
                <PredictionEventsDataGrid />
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </>
  )
}

export default Main
