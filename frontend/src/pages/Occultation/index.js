import React from 'react'
import Grid from '@material-ui/core/Grid'
function Occultation() {
  return (
    <>
      <Grid container spacing={2} alignItems='stretch'>
        <Grid item xs={12} md={4} lg={3}>
          <Grid container direction='column' spacing={2}>
            List with all Occultation Results
          </Grid>
        </Grid>
      </Grid>
    </>
  )
}

export default Occultation
