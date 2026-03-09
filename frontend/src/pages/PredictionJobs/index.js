import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import PredictonJobsHistory from './PredictionJobsHistory'
import PredictionJobForm from './PredictionJobForm'

function PredictionJobs() {
  return (
    <Box sx={{ width: '100%', minWidth: 0, px: { xs: 1, sm: 0 }, pb: 2 }}>
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ minWidth: 0 }}>
        <Grid item xs={12}>
          <PredictionJobForm />
        </Grid>
        <Grid item xs={12} sx={{ minWidth: 0, overflow: 'hidden' }}>
          <PredictonJobsHistory />
        </Grid>
      </Grid>
    </Box>
  )
}

export default PredictionJobs
