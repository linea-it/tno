import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import {
  Grid,
  Button,
  Icon,
  Typography,
  Card,
  CardHeader,
  CardContent,
  Chip,
  CircularProgress,
} from '@material-ui/core';
import {
  CheckCircle as SuccessIcon,
  Cancel as FailureIcon,
  PieChart as PieChartIcon,
} from '@material-ui/icons';
import moment from 'moment';
import Table from '../../components/Table';
import { useTitle } from '../../contexts/title';
import List from '../../components/List';
import ColumnStatus from '../../components/Table/ColumnStatus';
import Progress from '../../components/Progress';
import useStyles from './styles';
import PlaceholderJPG from './example.jpg';

function OrbitTracerDetail() {
  const { id } = useParams();
  const { setTitle } = useTitle();
  const history = useHistory();
  const classes = useStyles();

  const [orbitTracerJob, setOrbitTracerJob] = useState({});
  const [summaryExecution, setSummaryExecution] = useState([]);
  const [summaryResults, setSummaryResults] = useState([]);
  const [progress, setProgress] = useState({
    request: {
      status: 'completed',
      exposures: 0,
      current: 0,
      average_time: 0,
      time_estimate: 0,
    },
    loaddata: {
      status: 'completed',
      exposures: 0,
      current: 0,
      average_time: 0,
      time_estimate: 0,
    },
  });
  const [hasCircularProgress, setHasCircularProgress] = useState(true);

  useEffect(() => {
    setTitle('Orbit Tracer');
  }, []);

  useEffect(() => {
    setOrbitTracerJob({
      status: 3,
      error_msg: '',
      owner: 'mfreitas',
      date_initial: '2021-03-26T17:05:52.277584Z',
      date_final: '2021-03-26T23:05:52.277584Z',
      start: '2021-03-26T17:05:52.277584Z',
      finish: '2021-03-26T23:05:52.277584Z',
      estimated_execution_time: '01:05:52.277584Z',
      execution_time: '07:12:04.588550',
      nights: 7,
      exposures: 49,
      ccds: 2989,
      asteroids: 91,
      positions: 461,
      exposures_with_asteroid: 27,
      ccds_with_asteroid: 199,
    });
  }, []);

  useEffect(() => {
    if (Object.keys(orbitTracerJob).length > 0) {
      setSummaryExecution([
        {
          title: 'Status',
          value: () => (
            <ColumnStatus
              status={orbitTracerJob.status}
              title={orbitTracerJob.error_msg}
              align="right"
            />
          ),
        },
        {
          title: 'Owner',
          value: orbitTracerJob.owner,
        },
        {
          title: 'Job ID',
          value: id,
        },
        {
          title: 'Start Date',
          value: moment(orbitTracerJob.date_initial).format('YYYY-MM-DD'),
        },
        {
          title: 'End Date',
          value: moment(orbitTracerJob.date_final).format('YYYY-MM-DD'),
        },
        {
          title: 'Start',
          value: moment(orbitTracerJob.start).format('YYYY-MM-DD HH:mm:ss'),
        },
        {
          title: 'Finish',
          value: orbitTracerJob.finish
            ? moment(orbitTracerJob.finish).format('YYYY-MM-DD HH:mm:ss')
            : '-',
        },
        {
          title: 'Estimated Time',
          value: orbitTracerJob.estimated_execution_time
            ? orbitTracerJob.estimated_execution_time.split('.')[0]
            : 0,
        },
        {
          title: 'Execution Time',
          value: orbitTracerJob.execution_time
            ? orbitTracerJob.execution_time.split('.')[0]
            : 0,
        },
      ]);

      setSummaryResults([
        {
          title: '# Nights',
          value: orbitTracerJob.nights,
        },
        {
          title: '# Exposures Analyzed',
          value: orbitTracerJob.exposures,
        },
        {
          title: '# CCDs Analyzed',
          value: orbitTracerJob.ccds,
        },
        {
          title: '# SSOs',
          value: orbitTracerJob.asteroids,
        },
        {
          title: '# Observations',
          value: orbitTracerJob.positions,
        },
        {
          title: '# Exposures with SSOs',
          value: orbitTracerJob.exposures_with_asteroid,
        },
        {
          title: '# CCDs with SSOs',
          value: orbitTracerJob.ccds_with_asteroid,
        },
      ]);
    }
  }, [orbitTracerJob]);

  const handleBackNavigation = () => history.goBack();

  const tableColumns = [
    {
      name: 'object',
      title: 'Object',
      width: 130,
    },
    {
      name: 'number',
      title: 'Number',
      width: 150,
    },
    {
      name: 'class',
      title: 'Class',
      width: 150,
      align: 'center',
    },
    {
      name: 'csv',
      title: 'CSV',
      customElement: (row) =>
        row.csv ? (
          <SuccessIcon style={{ color: '#009900' }} fontSize="small" />
        ) : (
          <FailureIcon color="error" fontSize="small" />
        ),
      align: 'center',
    },
    {
      name: 'bsp',
      title: 'BSP',
      customElement: (row) =>
        row.bsp ? (
          <SuccessIcon style={{ color: '#009900' }} fontSize="small" />
        ) : (
          <FailureIcon color="error" fontSize="small" />
        ),
      align: 'center',
    },
    {
      name: 'pos_file',
      title: 'Pos File',
      customElement: (row) =>
        row.pos_file ? (
          <SuccessIcon style={{ color: '#009900' }} fontSize="small" />
        ) : (
          <FailureIcon color="error" fontSize="small" />
        ),
      align: 'center',
    },
    {
      name: 'diagram',
      title: 'Diagram',
      customElement: (row) =>
        row.diagram ? <PieChartIcon color="primary" fontSize="small" /> : '-',
      align: 'center',
    },
  ];

  const tableData = [
    {
      id: 1,
      object: '2013 TV158',
      number: '',
      class: 'KBO',
      csv: true,
      bsp: true,
      pos_file: true,
      diagram: true,
    },
    {
      id: 2,
      object: '2014 TX995',
      number: '351813',
      class: 'M BELT',
      csv: false,
      bsp: true,
      pos_file: false,
      diagram: false,
    },
    {
      id: 3,
      object: '2002 AX56',
      number: '613183',
      class: 'TROJAN',
      csv: true,
      bsp: false,
      pos_file: false,
      diagram: false,
    },
    {
      id: 4,
      object: '2004 RX48',
      number: '',
      class: 'AMOR',
      csv: true,
      bsp: true,
      pos_file: true,
      diagram: true,
    },
    {
      id: 5,
      object: '2016 OZ45',
      number: '381318',
      class: 'KBO',
      csv: true,
      bsp: true,
      pos_file: false,
      diagram: true,
    },
  ];

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Grid container alignItems="center" spacing={2}>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              title="Back"
              onClick={handleBackNavigation}
            >
              <Icon className="fas fa-undo" fontSize="inherit" />
              <Typography variant="button" style={{ margin: '0 5px' }}>
                Back
              </Typography>
            </Button>
          </Grid>
        </Grid>
      </Grid>

      <Grid item xs={12} md={5} xl={3}>
        <Card>
          <CardHeader title="Summary Execution" />
          <CardContent>
            <List data={summaryExecution} />
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={7} xl={9}>
        <Card>
          <CardHeader title="Progress" />
          <CardContent>
            <Grid
              container
              spacing={3}
              direction="column"
              className={classes.progressWrapper}
            >
              <Grid item>
                <Progress
                  title="Retrieving data"
                  variant="determinate"
                  label={`${progress.request.exposures} exposures`}
                  total={progress.request.exposures}
                  current={progress.request.current}
                />
                <Grid container spacing={2}>
                  <Grid item>
                    <Chip
                      label={`Average: ${progress.request.average_time.toFixed(
                        2
                      )}s`}
                      color="primary"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item>
                    <Chip
                      label={`Time Left: ${progress.request.time_estimate}`}
                      color="primary"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item>
                    <Chip
                      label={`Progress: ${progress.request.current}/${progress.request.exposures}`}
                      color="primary"
                      variant="outlined"
                    />
                  </Grid>
                </Grid>
              </Grid>

              <Grid item>
                <Progress
                  title="Importing positions to database"
                  variant="determinate"
                  label={`${progress.loaddata.exposures} exposures`}
                  total={progress.loaddata.exposures}
                  current={progress.loaddata.current}
                />
                <Grid container spacing={2}>
                  <Grid item>
                    <Chip
                      label={`Average: ${progress.loaddata.average_time.toFixed(
                        2
                      )}s`}
                      color="primary"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item>
                    <Chip
                      label={`Time Left: ${moment
                        .duration(progress.loaddata.time_estimate)
                        .add(moment.duration(progress.request.time_estimate))}`}
                      color="primary"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item>
                    <Chip
                      label={`Progress: ${progress.loaddata.current}/${progress.loaddata.exposures}`}
                      color="primary"
                      variant="outlined"
                    />
                  </Grid>
                </Grid>
              </Grid>
              {hasCircularProgress && [1, 2].includes(orbitTracerJob.status) ? (
                <CircularProgress
                  className={classes.circularProgress}
                  disableShrink
                  size={20}
                />
              ) : null}
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Grid container alignItems="stretch" spacing={2}>
          <Grid item xs={12} md={5} xl={3}>
            <Card>
              <CardHeader title="Summary Results" />
              <CardContent>
                <List data={summaryResults} />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={7} xl={9}>
            <Card>
              <CardHeader title="Results" />
              <CardContent>
                <Grid
                  container
                  spacing={2}
                  className={classes.gridTable}
                  justify="center"
                >
                  <Grid item className={classes.gridTableRow}>
                    <Table
                      columns={tableColumns}
                      data={tableData}
                      totalCount={0}
                      hasSearching={false}
                      // hasSorting={false}
                      hasColumnVisibility={false}
                      hasToolbar={false}
                      hasRowNumberer
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card>
              <CardHeader title="Orbit" />
              <CardContent>
                <Grid container spacing={2} justify="center">
                  <Grid item>
                    <img
                      src={PlaceholderJPG}
                      alt="Placeholder Result"
                      style={{ maxWidth: '100%' }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}

export default OrbitTracerDetail;
