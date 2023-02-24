import React from 'react'
import Grid from '@material-ui/core/Grid'
function OrbitTrace() {
  return (
    <>
      <Grid container spacing={2} alignItems='stretch'>
        <Grid item xs={12} md={4} lg={3}>
          <Grid container direction='column' spacing={2}>
            Submit Orbit Trace Pipeline
          </Grid>
        </Grid>
      </Grid>
    </>
  )
}

export default OrbitTrace
