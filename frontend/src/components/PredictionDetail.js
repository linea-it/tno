import React, { useState, useEffect } from 'react';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';



const useStyles = makeStyles(theme => ({

    div: {
        marginTop: '20px',
    },
    card: {
        marginBottom: 20,
    },
    headerTitle: {
        color: '#34465d',
        fontSize: 14,
        fontWeight: 'bold',

    },
    cardHeader: {
        backgroundColor: 'rgb(248, 249, 252)',
        borderBottom: '1px solid rgb(227, 230, 240)',
        paddingTop: 5,
        paddingBottom: 5,

    },


}));



function PredictionDetail() {

    const classes = useStyles();

    return (

        <div>
            <div className={classes.div}>
                <Grid container spacing={2}>
                    <Grid item sm={3} xs={3} lg={3} xl={2}>
                        <Card className={classes.card}>
                            <CardHeader
                                title={(
                                    <span className={classes.headerTitle}>Summary</span>)}
                                className={classes.cardHeader}
                            />
                        </Card>

                    </Grid>
                    <Grid item sm={3} xs={3} lg={3} xl={2}>
                        <Card className={classes.card}>
                            <CardHeader
                                title={(
                                    <span className={classes.headerTitle}>Status</span>)}
                                className={classes.cardHeader}
                            />
                        </Card>

                    </Grid>
                    <Grid item sm={3} xs={3} lg={3} xl={2}>
                        <Card className={classes.card}>
                            <CardHeader
                                title={(
                                    <span className={classes.headerTitle}>Execution Time</span>)}
                                className={classes.cardHeader}
                            />
                        </Card>

                    </Grid>
                </Grid>

                <Grid container >
                    <Grid item lg={12} xl={12}>
                        <Card className={classes.card}>
                            <CardHeader
                                title={(<span className={classes.headerTitle}>Asteroids</span>)}
                                className={classes.cardHeader}
                            />
                        </Card>
                    </Grid>
                </Grid>

                <Grid container >
                    <Grid item lg={12} xl={12}>
                        <Card>
                            <CardHeader
                                title={(<span className={classes.headerTitle}>Time Profile</span>)}
                                className={classes.cardHeader}
                            />
                        </Card>
                    </Grid>
                </Grid>

            </div>

            <div>


            </div>

            <div>


            </div>
        </div >
    );
}

export default PredictionDetail;