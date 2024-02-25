import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import PredictionEventsFilter from '../../components/PredictionEventsFilter/index'
import PredictionEventsDataGrid from '../../components/PredictionEventsDataGrid/index'

function PredictionEvents() {
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
