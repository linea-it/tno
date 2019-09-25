import React, { useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import { Grid, Card, CardHeader, makeStyles } from '@material-ui/core';
import ListStat from './utils/CustomList';
import { Donut } from './utils/CustomChart';


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



  const listStatus = [
    { title: "Status", value: "value" },
    { title: "Process", value: "value" },
    { title: "Process Name", value: "value" },
    { title: "Owner", value: "value" },
    { title: "Start", value: "value" },
    { title: "Execution", value: "value" },
    { title: "Asteroids", value: "value" },
    { title: "Reference Catalog", value: "value" },
  ]


  const donutDataStatist = [
    { name: "Success", value: " value" },
    { name: "Warning", value: " value" },
    { name: "Failure", value: " value" },
    { name: "Not Executed", value: " value" },
    { name: "Running/Idle", value: " value" },
  ]

  const donutColorsStatistic = [
    '#1D3747', '#305D78', '#89C8F7', '#A8D7FF', '#A8D7FF'
  ];


  const donutDataExecutionTime = [
    { name: "Ccd Images", value: "value" },
    { name: "Bsp_Jpl", value: "value" },
    { name: "Catalog", value: "value" },
    { name: "Astrometry", value: "value" },
  ];

  const donutColorExecutionTime = [
    '#1D3747', '#305D78', '#89C8F7', '#A8D7FF'
  ];

  return (

    <div>

      <Grid container spacing={6}>

        <Grid item sm={4} xl={4}>
          <Card>
            <CardHeader
              title={`Astrometry - ${runId} `}
            />
            <ListStat
              list={listStatus}
            >

            </ListStat>

          </Card>


        </Grid>
        <Grid item sm={4} xl={4}>
          <Card className={classes.card}>
            <CardHeader
              title={"Execution Statistics  "}
            />

            <Donut
              data={donutDataStatist}
              fill={donutColorsStatistic}
            >

            </Donut>

          </Card>

          <Card>
            <CardHeader
              title={"Execution Time  "}
            />

            <Donut
              data={donutDataExecutionTime}
              fill={donutColorExecutionTime}
            >

            </Donut>


          </Card>


        </Grid>

      </Grid>



      <Grid container spacing={6}>

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

