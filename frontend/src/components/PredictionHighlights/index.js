import React from 'react'
import Grid from '@material-ui/core/Grid'
import UniqueAsteroids from '../UniqueAsteroids/index'
import MonthlyForecast from '../MonthlyForecast/index'
import WeeklyForecast from '../WeeklyForecast/index'
import useStyles from './styles'

export default function PredictionHighlights() {
    const classes = useStyles()

    return (
        <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
                <div className={classes.highlight}>
                    <UniqueAsteroids />
                </div>
            </Grid>
            <Grid item xs={12} sm={4}>
                <div className={classes.highlight}>
                    <WeeklyForecast />
                </div>
            </Grid>
            <Grid item xs={12} sm={4}>
                <div className={classes.highlight}>
                    <MonthlyForecast />
                </div>
            </Grid>
        </Grid>
    )
}
