import React from 'react'
import Grid from '@material-ui/core/Grid'
import MapsStats from '../../components/MapsStats/index'
function Dashboard() {

  return (
    <Grid container spacing={2} alignItems='stretch'>
      <Grid item xs={12} md={3}>
        Teste 1
      </Grid>
      <Grid item xs={12} md={3}>
        Teste 2
      </Grid>
      <Grid item xs={12} md={3}>
        Teste 3
      </Grid>
      <Grid item xs={12} md={3}>
        <MapsStats />
      </Grid>
    </Grid>
  )
}

export default Dashboard
