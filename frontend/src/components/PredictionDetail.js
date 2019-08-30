import React from 'react';
import {
  Grid, Toolbar, makeStyles, Card, CardHeader, CardContent, Button,
} from '@material-ui/core';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import { withRouter } from 'react-router-dom';
import List from './ListStats';

const useStyles = makeStyles({
  div: {
    marginTop: 0,
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
    fontSize: 9,
  },
});

function PredictionDetail() {
  const classes = useStyles();

  const handleBackButtonClick = () => 'back';
  // const handleBackButtonClick = () => props.history;
  // console.log('Go Back');
  // console.log(props.history)


  const listStats = [
    { name: 'Process', value: 'xxxxxxxx', className: 'classes.firstListText' },
    { name: 'Owner', value: 'xxxxxxxx', className: 'classes.secondListText' },
    { name: 'Start', value: 'xxxxxxxx', className: 'classes.thirdListText' },
    { name: 'Execution', value: 'xxxxxxxx', className: 'classes.forthListText' },
    { name: 'Asteroids', value: 'xxxxxxxx', className: 'classes.fifthListText' },
    { name: 'Occultations', value: 'xxxxxxxx', className: 'classes.sixthListText' },
  ];

  return (
    <div>
      <Toolbar>
        <Button onClick={handleBackButtonClick}>
          <ArrowBackIosIcon className={classes.arrowBack}> </ArrowBackIosIcon>
          Back
        </Button>
      </Toolbar>
      <div className={classes.div}>
        <Grid container spacing={2}>
          <Grid item lg={4} xl={3}>
            <Card className={classes.card}>
              <CardHeader
                title={(
                  <span className={classes.headerTitle}>Summary</span>)}
                className={classes.cardHeader}
              />
              <CardContent>
                <List status="TOP" data={listStats} />
              </CardContent>
            </Card>

          </Grid>
          <Grid item lg={4} xl={3}>
            <Card className={classes.card}>
              <CardHeader
                title={(
                  <span className={classes.headerTitle}>Status</span>)}
                className={classes.cardHeader}
              />
              <CardContent>
                Status
              </CardContent>
            </Card>

          </Grid>
          <Grid item lg={4} xl={3}>
            <Card className={classes.card}>
              <CardHeader
                title={(
                  <span className={classes.headerTitle}>Execution Time</span>)}
                className={classes.cardHeader}
              />
              <CardContent>
                Execution Time
              </CardContent>
            </Card>

          </Grid>
        </Grid>

        <Grid container>
          <Grid item lg={12} xl={12}>
            <Card className={classes.card}>
              <CardHeader
                title={(<span className={classes.headerTitle}>Asteroids</span>)}
                className={classes.cardHeader}
              />
              <CardContent>
                Asteroids details list (TABLE)
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container>
          <Grid item lg={12} xl={12}>
            <Card>
              <CardHeader
                title={(<span className={classes.headerTitle}>Time Profile</span>)}
                className={classes.cardHeader}
              />

              <CardContent>
                Time Profile
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </div>
    </div>
  );
}

export default withRouter(PredictionDetail);
