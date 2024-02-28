import Grid from '@mui/material/Grid'
import PredictonJobsHistory from './PredictionJobsHistory'
import PredictionJobForm from './PredictionJobForm'
function PredictionJobs() {
  return (
    <Grid container spacing={3} sx={{ minWidth: 'lg' }}>
      <Grid item xs={12}>
        <PredictionJobForm />
      </Grid>
      <Grid item xs={12}>
        <PredictonJobsHistory />
      </Grid>
    </Grid>
  )
}

export default PredictionJobs
