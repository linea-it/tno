import React, { useEffect, useLayoutEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { Grid, Card, CardHeader, makeStyles } from '@material-ui/core';
import ListStat from './utils/CustomList';
import { Donut } from './utils/CustomChart';
import Table from './utils/CustomTable';
import { getPraiaRunById, getExecutionTimeById, getAsteroidStatus, getAsteroids } from '../api/Praia';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({

  card: {
    marginBottom: 10,
  },

  btn: {
    textTransform: 'none',
    padding: '1px 5px',
    width: '7em',
    minHeight: '1em',
    display: 'block',
    textAlign: 'center',
    lineHeight: '2',
    boxShadow: `0px 1px 5px 0px rgba(0, 0, 0, 0.2),
    0px 2px 2px 0px rgba(0, 0, 0, 0.14),
    0px 3px 1px -2px rgba(0, 0, 0, 0.12)`,
    borderRadius: '4px',
    boxSizing: 'border-box',
  },
  btnSuccess: {
    backgroundColor: 'green',
    color: '#fff',
  },
  btnFailure: {
    backgroundColor: 'red',
    color: '#fff',
  },
  btnRunning: {
    backgroundColor: '#ffba01',
    color: '#000',
  },
  btnNotExecuted: {
    backgroundColor: '#ABA6A2',
    color: '#fff',
  },
  btnWarning: {
    backgroundColor: '#D79F15',
    color: '#FFF',
  },

}));

function AstrometryRun({ setTitle, match: { params } }) {

  const classes = useStyles();

  const [list, setList] = useState([]);
  const [execution_time, setExecutionTime] = useState({});
  const [execution_stats, setExecutionStats] = useState({});
  const [tableData, setTableData] = useState();

  useEffect(() => {
    setTitle("Astrometry Run");

  }, []);

  const runId = params.id;

  const loadPraiaRun = () => {
    getPraiaRunById({ id: runId }).then((res) => {

      const data = res.data;

      setList([
        {
          title: 'Status',
          value: () => {
            if (data.status === 'failure') {
              return (
                <span
                  className={clsx(classes.btn, classes.btnFailure)}
                  title={data.error_msg}
                >
                  Failure
                </span>
              );
            }
            if (data.status === 'running') {
              return (
                <span
                  className={clsx(classes.btn, classes.btnRunning)}
                  title={data.error_msg}
                >
                  Running
                </span>
              );
            }
            if (data.status === 'not_executed') {
              return (
                <span
                  className={clsx(classes.btn, classes.btnNotExecuted)}
                  title={data.error_msg}
                >
                  Not Executed
                </span>
              );
            }
            if (data.status === 'warning') {
              return (
                <span
                  className={clsx(classes.btn, classes.btnWarning)}
                  title={data.error_msg}
                >
                  Warning
                </span>
              );
            }

            return (
              <span
                className={clsx(classes.btn, classes.btnSuccess)}
                title={data.status}
              >
                Success
              </span>
            );
          }
        },
        { title: "Process", value: data.id },
        { title: "Process Name", value: data.input_displayname },
        { title: "Owner", value: data.owner },
        { title: "Start", value: data.h_time },
        { title: "Execution", value: data.h_execution_time },
        { title: "Asteroids", value: data.count_objects },
        { title: "Reference Catalog", value: data.catalog_name },
      ]);
    });
  }

  const loadExecutionTime = () => {

    getExecutionTimeById({ id: params.id }).then((res) => {
      setExecutionTime(res.data.execution_time);

    });

  };

  const loadExecutionStatistics = () => {
    getAsteroidStatus({ id: params.id }).then((res) => {
      setExecutionStats(res.data.status);
    });
  };


  const loadTableData = () => {
    console.log("Table Data");
  };

  useLayoutEffect(() => {

    loadPraiaRun();
    loadExecutionTime();
    loadExecutionStatistics();
    loadTableData();

  }, [])

  const donutDataStatist = [
    { name: "Success", value: execution_stats.success },
    { name: "Warning", value: execution_stats.warning },
    { name: "Failure", value: execution_stats.failure },
    { name: "Not Executed", value: execution_stats.not_executed },
    { name: "Running/Idle", value: "0" },
  ];

  const donutDataExecutionTime = [
    { name: "Ccd Images", value: execution_time.ccd_images },
    { name: "Bsp_Jpl", value: execution_time.bsp_jpl },
    { name: "Catalog", value: execution_time.catalog },
    { name: "Astrometry", value: execution_time.astrometry },
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
              data={list}
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
              title={"Execution Time  "}
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
            {/* <Table >
            </Table> */}

          </Card>
        </Grid>
      </Grid>
    </div >
  );
};

export default withRouter(AstrometryRun);

