import{ useState, useContext } from 'react';
import Grid from '@mui/material/Grid'
import { PredictionEventsContext, PredictionEventsProvider } from '../../contexts/PredictionContext';

import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import PredictionEventsDataGrid from './partials/EventsDataGrid';
import PredictionEventsFilter from './partials/EventsFilter';

function PredictionEvents() {

  const {filterOptions} = useContext(PredictionEventsContext)

  return (
    
    <Grid>
      <Grid container spacing={3}>
        <Grid item xs={12}>
        <Card>
          {/* <CardHeader
            title={"Prediction Events"}
            titleTypographyProps={{ variant: 'h6', fontSize: '1rem', }}/> */}
          <CardContent>
            <PredictionEventsFilter />
          </CardContent>
        </Card>
        </Grid>
        <Grid item xs={12}>
          <Card>
          {/* <CardHeader
            title={filterOptions?.date_time_start}
            titleTypographyProps={{ variant: 'h6', fontSize: '1rem', }}/> */}
          <CardContent sx={{minHeight: 500}}>
            <PredictionEventsDataGrid />
          </CardContent>
        </Card>
        </Grid>        
      </Grid>
    </Grid>
  )
}

export default PredictionEvents