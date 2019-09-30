import React, { useEffect, useLayoutEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { Grid, Card, CardHeader, makeStyles } from '@material-ui/core';
import ListStat from './utils/CustomList';
import { Donut } from './utils/CustomChart';
import { getPraiaRunById } from '../api/Praia';


const useStyles = makeStyles((theme) => ({

  card: {
    marginBottom: 10,
  }
}));



function AstrometryRun({ setTitle, match: { params } }) {

  const classes = useStyles();


  const [runData, setRunData] = useState({});


  useEffect(() => {
    setTitle("Astrometry Run");
  }, []);



  const runId = params.id ? params.id : "2";



  useLayoutEffect(() => {


    getPraiaRunById({ id: runId }).then((res) => {

      setRunData(res.data);
      console.log(res.data);

    });

  }, [])





  const listStatus = [
    { title: "Status", value: runData.status },
    { title: "Process", value: runData.id },
    { title: "Process Name", value: runData.input_displayname },
    { title: "Owner", value: runData.owner },
    { title: "Start", value: runData.h_time },
    { title: "Execution", value: runData.h_execution_time },
    { title: "Asteroids", value: runData.count_objects },
    { title: "Reference Catalog", value: runData.catalog_name },
  ]


  const donutDataStatist = [
    { name: "Success", value: 12 },
    { name: "Warning", value: 5 },
    { name: "Failure", value: 0 },
    { name: "Not Executed", value: 20 },
    { name: "Running/Idle", value: 8 },
  ]



  const donutDataExecutionTime = [
    { name: "Ccd Images", value: 2 },
    { name: "Bsp_Jpl", value: 4 },
    { name: "Catalog", value: 5 },
    { name: "Astrometry", value: 7 },
  ];



  return (

    <div>

      <Grid container spacing={2}>

        <Grid item xs={12} md={6} xl={4}>
          <Card>
            <CardHeader
              title={`Astrometry - ${runId} `}
            />

            <ListStat
              data={listStatus}
            >

            </ListStat>

          </Card>


        </Grid>

        <Grid item xs={12} md={6} xl={4}>
          <Card className={classes.card}>
            <CardHeader
              title={"Execution Statistics  "}
            />

            <Donut

              data={donutDataStatist}
            >

            </Donut>

          </Card>


        </Grid >

        <Grid item xs={12} md={6} xl={4}>
          <Card className={classes.card}>
            <CardHeader
              title={"Execution Statistics  "}
            />

            <Donut

              data={donutDataExecutionTime}
            >

            </Donut>

          </Card>


        </Grid >

      </Grid >


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

