import React from 'react';
import {
  makeStyles, Grid, CardHeader, Card, CardContent,
} from '@material-ui/core';
import clsx from 'clsx';

const useStyles = makeStyles({

});


export default function PredictAsteroid() {
  const classes = useStyles();

  return (
    <div>
      <div className={classes.div}>
        <Grid container spacing={2}>
          <Grid item lg={4} xl={3}>
            <Card className={classes.card}>
              <CardHeader
                className={classes.cardHeader}
                title={(<span className={classes.headerTitle}>Asteroid Name - Number</span>)}
              />
              <CardContent>
                Asteroids specs
              </CardContent>
            </Card>
          </Grid>

          <Grid item lg={4} xl={3}>
            <Card className={classes.card}>
              <CardHeader
                className={classes.cardHeader}
                title={(<span className={classes.headerTitle}>Info</span>)}
              />
              <CardContent>
                Info About Asteroids
              </CardContent>
            </Card>
          </Grid>

          <Grid item lg={4} xl={3}>
            <Card className={classes.card}>
              <CardHeader
                className={classes.cardHeader}
                title={(<span className={classes.headerTitle}>Times</span>)}
              />
              <CardContent>
                Info About Times
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container>
          <Grid item lg={12} xl={12}>
            <Card className={classes.card}>
              <CardHeader
                className={classes.cardHeader}
                title={(<span className={classes.headerTitle}>Occultations</span>)}
              />
              <CardContent>
                Occultations list (TABLE)

              </CardContent>
            </Card>
          </Grid>
        </Grid>


        <Grid container>
          <Grid item lg={6} xl={6}>
            <Card className={clsx(classes.card, classes.globeCard)}>

              <CardContent>
                Globe Image with coordinates

              </CardContent>
            </Card>
          </Grid>

          <Grid item lg={6} xl={6}>
            <Card className={classes.card}>

              <CardContent>
                Description of the globe

              </CardContent>
            </Card>
          </Grid>
        </Grid>


        <Grid container>
          <Grid item lg={12} xl={12}>
            <Card className={classes.card}>
              <CardHeader
                className={classes.cardHeader}
                title={(<span className={classes.headerTitle}>Catalog</span>)}
              />
              <CardContent>
                Two images side by side - Neighborhood Stars and Asteroid Orbit
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </div>
    </div>
  );
}