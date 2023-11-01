import React from 'react'
import Grid from '@mui/material/Grid'
import MapsStats from '../../components/MapsStats/index'
import UniqueAsteroids from '../../components/UniqueAsteroids/index'
import WeeklyForecast from '../../components/WeeklyForecast/index'
import MonthlyForecast from '../../components/MonthlyForecast/index'
function Dashboard() {

  return (
    <Grid container spacing={2} alignItems='stretch'>
      <Grid item xs={12} md={3}>
        <UniqueAsteroids />
      </Grid>
      <Grid item xs={12} md={3}>
        <WeeklyForecast />
      </Grid>
      <Grid item xs={12} md={3}>
        <MonthlyForecast />
      </Grid>
      <Grid item xs={12} md={3}>
        <MapsStats />
      </Grid>
    </Grid>
  )
}

export default Dashboard
