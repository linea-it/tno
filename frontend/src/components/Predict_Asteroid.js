import React, { useState, useEffect, useLayoutEffect } from 'react';
import { makeStyles, Grid, CardHeader, Card, CardContent } from '@material-ui/core';





const useStyles = makeStyles(theme => ({
  div: {
    marginTop: 20,
  },
  headerTitle: {
    color: '#34465d',
    fontSize: 16,
    fontWeight: 'bold',

  },
  card: {
    marginBottom: 20
  },
  cardHeader: {
    backgroundColor: 'rgb(248, 249, 252)',
    borderBottom: '1px solid rgb(227, 230, 240)',
    paddingTop: 5,
    paddingBottom: 5,
  },

  globeCard: {
    // marginRight: 'none',
  },

}));


export default function PredictAsteroid() {


  const classes = useStyles();

  return (
    <div>
      <div className={classes.div}>
        <Grid container spacing={2}>
          <Grid item lg={4} xl={3} >
            <Card className={classes.card}>
              <CardHeader className={classes.cardHeader}
                title={(<span className={classes.headerTitle}>Asteroid Name - Number</span>)}
              />
              <CardContent>
                Asteroids specs
              </CardContent>
            </Card>
          </Grid>

          <Grid item lg={4} xl={3} >
            <Card className={classes.card}>
              <CardHeader className={classes.cardHeader}
                title={(<span className={classes.headerTitle}>Info</span>)}
              />
              <CardContent>
                Info About Asteroids
              </CardContent>
            </Card>
          </Grid>

          <Grid item lg={4} xl={3} >
            <Card className={classes.card}>
              <CardHeader className={classes.cardHeader}
                title={(<span className={classes.headerTitle}>Times</span>)}
              />
              <CardContent>
                Info About Times
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container>
          <Grid item lg={12} xl={12} >
            <Card className={classes.card}>
              <CardHeader className={classes.cardHeader}
                title={(<span className={classes.headerTitle}>Occultations</span>)}
              />
              <CardContent>
                Occultations list (TABLE)

              </CardContent>
            </Card>
          </Grid>
        </Grid>


        <Grid container  >
          <Grid item lg={6} xl={6} >
            <Card className={classes.globeCard}>

              <CardContent>
                Globe Image with coordinates

              </CardContent>
            </Card>
          </Grid>

          <Grid item lg={6} xl={6} >
            <Card className={classes.globeCard}>

              <CardContent>
                Description of the globe

              </CardContent>
            </Card>
          </Grid>
        </Grid>





        <Grid container>
          <Grid item lg={12} xl={12} >
            <Card className={classes.card}>
              <CardHeader className={classes.cardHeader}
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

};