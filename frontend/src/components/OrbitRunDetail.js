import React, { useEffect, useState } from 'react';
import { Grid, Card, makeStyles, CardHeader, CardContent } from '@material-ui/core';
import List from './ListStats';


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

  const listStats = [

    //note: This string "classes.xxx" is related to the classname.
    //Itś being passed by props to the listStats component. 
    //classes.xxx means the object classes that is a class style on
    //ListStats component

    { name: 'Process', value: "xxxxxxxx", className: "classes.firstListText" },
    { name: 'Owner', value: "xxxxxxxx", className: "classes.secondListText" },
    { name: 'Start', value: "xxxxxxxx", className: "classes.thirdListText" },
    { name: 'Execution', value: "xxxxxxxx", className: "classes.forthListText" },
    { name: 'Asteroids', value: "xxxxxxxx", className: "classes.fifthListText" },

  ]


  return (
    <div>
      <div className={classes.div}>
        <Grid container spacing={2}>
          <Grid item lg={4} xl={3}>
            <Card className={classes.card}>
              <CardHeader className={classes.CardHeader}
                title={(
                  <span className={classes.headerTitle} >
                    Refine Orbit {/* Be sure: Here put the number of the run*/}
                  </span>
                )}
              />

              <CardContent>
                <List status={"Good"} data={listStats} />
              </CardContent>
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

              <CardContent>
               Asteroids detail list (Table)
              </CardContent>
            </Card>
          </Grid>
        </Grid>


      </div>
    </div>
  );
}