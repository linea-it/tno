import{ useState, useContext } from 'react';
import Grid from '@mui/material/Grid'
import { PredictionEventsContext, PredictionEventsProvider } from '../../contexts/PredictionContext';

import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import PredictionEventsFilter from '../../components/PredictionEventsFilter/index';
import PredictionEventsDataGrid from '../../components/PredictionEventsDataGrid/index';


function PredictionEvents() {

  const {queryOptions} = useContext(PredictionEventsContext)

    return (
    
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
  )
}

export default PredictionEvents