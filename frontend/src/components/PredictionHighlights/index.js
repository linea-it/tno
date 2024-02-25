import React from 'react'
import Grid from '@mui/material/Grid'
import UniqueAsteroids from '../UniqueAsteroids/index'
import MonthlyForecast from '../MonthlyForecast/index'
import WeeklyForecast from '../WeeklyForecast/index'

function PredictionHighlights() {
  return (
    <Grid
      container
      spacing={2}
      sx={{
        paddingLeft: '65px',
        paddingRight: '69px',
        borderRadius: 8,
        marginTop: '20px'
      }}
    >
      <Grid item xs={12} sm={4}>
        <UniqueAsteroids />
      </Grid>
      <Grid item xs={12} sm={4}>
        <WeeklyForecast />
      </Grid>
      <Grid item xs={12} sm={4}>
        <MonthlyForecast />
      </Grid>
    </Grid>
  )
}

export default PredictionHighlights
