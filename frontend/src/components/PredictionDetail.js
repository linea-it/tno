import React, { useState, useEffect } from 'react';
import { Grid, Toolbar, makeStyles, Card, CardHeader, Button } from '@material-ui/core';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackRounded';
import { withRouter } from 'react-router-dom';



const useStyles = makeStyles(theme => ({

    div: {
        marginTop: '20px',
    },
    card: {
        marginBottom: 20,
    },
    headerTitle: {
        color: '#34465d',
        fontSize: 16,
        fontWeight: 'bold',

    },
    cardHeader: {
        backgroundColor: 'rgb(248, 249, 252)',
        borderBottom: '1px solid rgb(227, 230, 240)',
        paddingTop: 5,
        paddingBottom: 5,

    },

    arrowBack: {
        fontSize: 14,
    },


}));



function PredictionDetail(props) {

    const classes = useStyles();

    const handleBackButtonClick = () => {
        console.log("Go Back");
        console.log(props.history);
        // console.log(props.history.goBack());
    };

    return (

        <div>
            <Toolbar>
                <ArrowBackIosIcon className={classes.arrowBack}> </ArrowBackIosIcon>
                <Button onClick={handleBackButtonClick} > Back </Button>
            </Toolbar>
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

export default withRouter(PredictionDetail);