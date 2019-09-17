import React, { useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import { Grid, Card, CardHeader, makeStyles } from '@material-ui/core';


const useStyles = makeStyles((theme) => ({

  card: {
    marginBottom: 10,
  }
}));



function AstrometryRun({ setTitle, match: { params } }) {

  const classes = useStyles();

  useEffect(() => {
    setTitle("Astrometry Run");
  }, []);



  const runId = params ? params.id : "id";

  return (

    <div>

      <Grid container spacing={2}>

        <Grid item sm={4} xl={4}>
          <Card>
            <CardHeader
              title={`Astrometry - ${runId} `}
            />
          </Card>


        </Grid>
        <Grid item sm={4} xl={4}>
          <Card className={classes.card}>
            <CardHeader
              title={"Execution Statistics  "}
            />
          </Card>

          <Card>
            <CardHeader
              title={"Execution Time  "}
            />
          </Card>


        </Grid>

      </Grid>



      <Grid container spacing={2}>

        <Grid item sm={12} xl={12}>
          <Card className={classes.card}>
            <CardHeader
              title={"Asteroids"}
            />
          </Card>
        </Grid>

      </Grid>

    </div >








  );
};

export default withRouter(AstrometryRun);

