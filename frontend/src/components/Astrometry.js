import React, { useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import { Card, CardHeader } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';



const useStyles = makeStyles((theme) => ({
  cardHeader: {

  },


}));


function Astrometry({ setTitle }) {

  const classes = useStyles();

  useEffect(() => {
    setTitle("Astrometry");
  }, []);


  return (
    <div>
      <Grid container spacing={2}>

        <Grid item sm={6} xl={5}>
          <Card>

            <CardHeader
              className={classes.cardHeader}
              title={"Execute"}
            />
          </Card>


        </Grid>


      </Grid>

      <Grid container spacing={2}>

        <Grid item sm={6} xl={5}>
          <Card>

            <CardHeader
              className={classes.cardHeader}
              title={"History"}
            />
          </Card>


        </Grid>




      </Grid>

    </div>

  );

};

export default withRouter(Astrometry);








