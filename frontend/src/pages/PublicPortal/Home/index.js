import React from 'react'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import PredictionEventsFilter from '../../../components/PredictionEventsFilter/index'
import PredictionEventsDataGrid from '../../../components/PredictionEventsDataGrid/index'
import PredictionHighlights from '../../../components/PredictionHighlights/index'
import PublicBanner from '../Banner/index';

function Main() {

  return (
    <>
      <PublicBanner />
      <PredictionHighlights />
      <Box mt={3} ml={8} mr={8}>
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
    </>
  )
}

export default Main
