import React from 'react'
import PublicBanner from '../../../components/PublicPortal/Banner/index'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import PredictionEventsFilter from '../../../components/PredictionEventsFilter/index'
import PredictionEventsDataGrid from '../../../components/PredictionEventsDataGrid/index'

function Main() {

  return (
    <>
      <PublicBanner />
      <Box mt={3} ml={8} mr={8}>
        <Grid>
          <Grid container spacing={3}>
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
