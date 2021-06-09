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
import { PieChart as PieChartIcon } from '@material-ui/icons';
import moment from 'moment';
import Table from '../../components/Table';
import { useTitle } from '../../contexts/title';
import List from '../../components/List';
import ColumnStatus from '../../components/Table/ColumnStatus';
import useStyles from './styles';
import PlaceholderJPG from '../OrbitTracer/example.jpg';

function PredictionOccultationDetail() {
  const { id } = useParams();
  const { setTitle } = useTitle();
  const history = useHistory();
  const classes = useStyles();

  const [predictionJob, setPredictionJob] = useState({});
  const [summaryExecution, setSummaryExecution] = useState([]);
  const [summaryResults, setSummaryResults] = useState([]);

  useEffect(() => {
    setTitle('Prediction of Occultation');
  }, []);

  useEffect(() => {
    setPredictionJob({
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
    if (Object.keys(predictionJob).length > 0) {
      setSummaryExecution([
        {
          title: 'Status',
          value: () => (
            <ColumnStatus
              status={predictionJob.status}
              title={predictionJob.error_msg}
              align="right"
            />
          ),
        },
        {
          title: 'Owner',
          value: predictionJob.owner,
        },
        {
          title: 'Job ID',
          value: id,
        },
        {
          title: 'Start Date',
          value: moment(predictionJob.date_initial).format('YYYY-MM-DD'),
        },
        {
          title: 'End Date',
          value: moment(predictionJob.date_final).format('YYYY-MM-DD'),
        },
        {
          title: 'Start',
          value: moment(predictionJob.start).format('YYYY-MM-DD HH:mm:ss'),
        },
        {
          title: 'Finish',
          value: predictionJob.finish
            ? moment(predictionJob.finish).format('YYYY-MM-DD HH:mm:ss')
            : '-',
        },
        {
          title: 'Estimated Time',
          value: predictionJob.estimated_execution_time
            ? predictionJob.estimated_execution_time.split('.')[0]
            : 0,
        },
        {
          title: 'Execution Time',
          value: predictionJob.execution_time
            ? predictionJob.execution_time.split('.')[0]
            : 0,
        },
      ]);

      setSummaryResults([
        {
          title: '# Nights',
          value: predictionJob.nights,
        },
        {
          title: '# Exposures Analyzed',
          value: predictionJob.exposures,
        },
        {
          title: '# CCDs Analyzed',
          value: predictionJob.ccds,
        },
        {
          title: '# SSOs',
          value: predictionJob.asteroids,
        },
        {
          title: '# Observations',
          value: predictionJob.positions,
        },
        {
          title: '# Exposures with SSOs',
          value: predictionJob.exposures_with_asteroid,
        },
        {
          title: '# CCDs with SSOs',
          value: predictionJob.ccds_with_asteroid,
        },
      ]);
    }
  }, [predictionJob]);

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
      name: 'lat_lon',
      title: 'Lat/Lon',
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
      lat_lon: '__/__',
      diagram: true,
    },
    {
      id: 2,
      object: '2014 TX995',
      number: '351813',
      class: 'M BELT',
      lat_lon: '__/__',
      diagram: false,
    },
    {
      id: 3,
      object: '2002 AX56',
      number: '613183',
      class: 'TROJAN',
      lat_lon: '__/__',
      diagram: false,
    },
    {
      id: 4,
      object: '2004 RX48',
      number: '',
      class: 'AMOR',
      lat_lon: '__/__',
      diagram: true,
    },
    {
      id: 5,
      object: '2016 OZ45',
      number: '381318',
      class: 'KBO',
      lat_lon: '__/__',
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

export default PredictionOccultationDetail;
