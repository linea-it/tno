import React, { useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import { Grid, Card } from '@material-ui/core';



function AstrometryRun({ setTitle }) {


  useEffect(() => {
    setTitle("Astrometry Run");
  }, []);


  return (

    <div>

      <Grid container>

        <Grid item>
          <Card>

          </Card>

        </Grid>

      </Grid>



      <Grid container>

        <Grid item>

        </Grid>

      </Grid>

    </div>








  );
};

export default withRouter(AstrometryRun);

