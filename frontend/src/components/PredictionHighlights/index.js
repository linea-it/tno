import React, { useState, useEffect } from 'react'
import { Card, CardContent, Grid, Typography } from '@material-ui/core'
import useStyles from './styles'

function PredictionHighlights() {
    const classes = useStyles()
    const [predictionData, setPredictionData] = useState(null)

    useEffect(() => {
        fetch('http://localhost/api/occultations/highlights/')
            .then(response => response.json())
            .then(data => setPredictionData(data))
            .catch(error => console.error('Error when fetching data:', error))
    }, [])

    if (!predictionData) {
        return <p>Loading data...</p>
    }

    return (
        <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
                <Card className={classes.card}>
                    <CardContent className={classes.content}>
                        <Typography variant="h6" className={classes.title}>
                            1
                        </Typography>
                        <Typography>Count: {predictionData.count}</Typography>
                        <Typography>Unique Asteroids: {predictionData.unique_asteroids}</Typography>
                        <Typography>Earliest: {predictionData.earliest}</Typography>
                        <Typography>Latest: {predictionData.latest}</Typography>
                    </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
                <Card className={classes.card}>
                    <CardContent className={classes.content}>
                        <Typography variant="h6" className={classes.title}>
                            2
                        </Typography>
                        <Typography>Today Count: {predictionData.today_count}</Typography>
                        <Typography>Week Count: {predictionData.week_count}</Typography>
                        <Typography>Next Week Count: {predictionData.next_week_count}</Typography>
                    </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
                <Card className={classes.card}>
                    <CardContent className={classes.content}>
                        <Typography variant="h6" className={classes.title}>
                            3
                        </Typography>
                        <Typography>Month Count: {predictionData.month_count}</Typography>
                        <Typography>Next Month Count: {predictionData.next_month_count}</Typography>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    )
}

export default PredictionHighlights
