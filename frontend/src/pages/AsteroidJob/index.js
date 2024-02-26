import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import AsteroidJobHistory from './AsteroidJobHistory'

function AsteroidJob() {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <AsteroidJobHistory></AsteroidJobHistory>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default AsteroidJob
