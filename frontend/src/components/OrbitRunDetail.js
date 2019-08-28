import React, { useEffect, useState } from 'react';
import { Grid, Card, makeStyles, CardHeader } from '@material-ui/core';


const useStyles = makeStyles(theme => ({
    div: {
        marginTop: '20px',
    },
    card: {
        marginTop: '10px',
    },
    headerTitle: {
        color: '#34465d',
        fontSize: 16,
        fontWeight: 'bold',
    },
    CardHeader: {
        backgroundColor: 'rgb(248, 249, 252)',
        borderBottom: '1px solid rgb(227, 230, 240)',
        paddingTop: 5,
        paddingBottom: 5,
    }

}));


export default function OrbitRunDetail() {

    const classes = useStyles();

    return (
        <div>
            <div className={classes.div}>
                <Grid container spacing={2}>
                    <Grid item lg={4} xl={3}>
                        <Card className={classes.card}>
                            <CardHeader className={classes.CardHeader}
                                title={(
                                    <span className={classes.headerTitle} >
                                        Refine Orbit
                                    </span>
                                )}
                            />
                        </Card>
                    </Grid>


                    <Grid item lg={4} xl={3}>
                        <Card className={classes.card}>
                            <CardHeader className={classes.CardHeader}
                                title={(
                                    <span className={classes.headerTitle} >
                                        Execution Statistics
                                    </span>
                                )}
                            />
                        </Card>

                        <Card className={classes.card}>
                            <CardHeader className={classes.CardHeader}
                                title={(
                                    <span className={classes.headerTitle} >
                                        Step Stats
                                    </span>
                                )}
                            />
                        </Card>
                    </Grid>

                    <Grid item lg={4} xl={3}>
                        <Card className={classes.card}>
                            <CardHeader className={classes.CardHeader}
                                title={(
                                    <span className={classes.headerTitle} >
                                        Execution Time
                                    </span>
                                )}
                            />
                        </Card>


                    </Grid>


                </Grid>

                <Grid container >
                    <Grid item lg={12} xl={12}>
                        <Card className={classes.card}>
                            <CardHeader className={classes.CardHeader}
                                title={(
                                    <span className={classes.headerTitle}>
                                        Asteroids
                                     </span>
                                )}
                            />
                        </Card>
                    </Grid>
                </Grid>


            </div>
        </div>
    );
}