import React from 'react'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import PredictionEventsFilter from '../../../components/PredictionEventsFilter/index'
import PredictionEventsDataGrid from '../../../components/PredictionEventsDataGrid/index'
import PredictionHighlights from '../../../components/PredictionHighlights/index'
import PublicBanner from '../Banner/index';
import Container from '@mui/material/Container'

function Main() {

  return (
    <>
      <PublicBanner />
      <Container maxWidth="lg">
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
