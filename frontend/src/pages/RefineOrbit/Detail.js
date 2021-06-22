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
import useStyles from './styles';
import PlaceholderJPG from '../OrbitTracer/example.jpg';

function RefineOrbitDetail() {
  const { id } = useParams();
  const { setTitle } = useTitle();
  const history = useHistory();
  const classes = useStyles();

  const [refineOrbitJob, setRefineOrbitJob] = useState({});
  const [summaryExecution, setSummaryExecution] = useState([]);
  const [summaryResults, setSummaryResults] = useState([]);

  useEffect(() => {
    setTitle('Refine Orbit');
  }, []);

  useEffect(() => {
    setRefineOrbitJob({
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
    if (Object.keys(refineOrbitJob).length > 0) {
      setSummaryExecution([
        {
          title: 'Status',
          value: () => (
            <ColumnStatus
              status={refineOrbitJob.status}
              title={refineOrbitJob.error_msg}
              align="right"
            />
          ),
        },
        {
          title: 'Owner',
          value: refineOrbitJob.owner,
        },
        {
          title: 'Job ID',
          value: id,
        },
        {
          title: 'Start Date',
          value: moment(refineOrbitJob.date_initial).format('YYYY-MM-DD'),
        },
        {
          title: 'End Date',
          value: moment(refineOrbitJob.date_final).format('YYYY-MM-DD'),
        },
        {
          title: 'Start',
          value: moment(refineOrbitJob.start).format('YYYY-MM-DD HH:mm:ss'),
        },
        {
          title: 'Finish',
          value: refineOrbitJob.finish
            ? moment(refineOrbitJob.finish).format('YYYY-MM-DD HH:mm:ss')
            : '-',
        },
        {
          title: 'Estimated Time',
          value: refineOrbitJob.estimated_execution_time
            ? refineOrbitJob.estimated_execution_time.split('.')[0]
            : 0,
        },
        {
          title: 'Execution Time',
          value: refineOrbitJob.execution_time
            ? refineOrbitJob.execution_time.split('.')[0]
            : 0,
        },
      ]);

      setSummaryResults([
        {
          title: '# Nights',
          value: refineOrbitJob.nights,
        },
        {
          title: '# Exposures Analyzed',
          value: refineOrbitJob.exposures,
        },
        {
          title: '# CCDs Analyzed',
          value: refineOrbitJob.ccds,
        },
        {
          title: '# SSOs',
          value: refineOrbitJob.asteroids,
        },
        {
          title: '# Observations',
          value: refineOrbitJob.positions,
        },
        {
          title: '# Exposures with SSOs',
          value: refineOrbitJob.exposures_with_asteroid,
        },
        {
          title: '# CCDs with SSOs',
          value: refineOrbitJob.ccds_with_asteroid,
        },
      ]);
    }
  }, [refineOrbitJob]);

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
      name: 'bsp',
      title: 'BSP',
      customElement: (row) =>
        row.bsp ? (
          <SuccessIcon style={{ color: '#009900' }} fontSize="small" />
        ) : (
          <FailureIcon color="error" fontSize="small" />
        ),
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
      bsp: true,
      diagram: true,
    },
    {
      id: 2,
      object: '2014 TX995',
      number: '351813',
      class: 'Trojan',
      bsp: true,
      diagram: false,
    },
    {
      id: 3,
      object: '2002 AX56',
      number: '613183',
      class: 'Main Belt',
      bsp: true,
      diagram: false,
    },
    {
      id: 4,
      object: '2004 RX48',
      number: '',
      class: 'AMOR',
      bsp: false,
      diagram: true,
    },
    {
      id: 5,
      object: '2016 OZ45',
      number: '381318',
      class: 'KBO',
      bsp: true,
      diagram: false,
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

      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title="Summary Execution" />
          <CardContent>
            <List data={summaryExecution} />
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title="Summary Results" />
          <CardContent>
            <List data={summaryResults} />
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Card>
          <CardHeader title="Results" />
          <CardContent>
            <Grid
              container
              spacing={2}
              justify="center"
              className={classes.gridTable}
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
          <CardHeader title="Occultation Map" />
          <CardContent>
            <Grid container spacing={2} direction="column" alignItems="center">
              <Grid container item justify="flex-end">
                <Button variant="contained" color="primary">
                  Download Map
                </Button>
              </Grid>
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
  );
}

export default RefineOrbitDetail;
