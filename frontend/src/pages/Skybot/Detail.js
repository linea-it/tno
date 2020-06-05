import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Grid,
  Card,
  CardHeader,
  CardContent,
  Icon,
  Button,
  Chip,
  Typography,
} from '@material-ui/core';
import { useParams, useHistory } from 'react-router-dom';
import moment from 'moment';
import List from '../../components/List';
import Table from '../../components/Table';
import Donut from '../../components/Chart/Donut';
import ColumnStatus from '../../components/Table/ColumnStatus';
import Progress from '../../components/Progress';
import {
  getSkybotResult,
  getSkybotRunById,
  getSkybotProgress,
} from '../../services/api/Skybot';
import useInterval from '../../hooks/useInterval';

function SkybotDetail({ setTitle }) {
  const { id } = useParams();
  const history = useHistory();
  const [summary, setSummary] = useState([]);
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
  const [loadProgress, setLoadProgress] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  const handleBackNavigation = () => history.push('/skybot');

  useEffect(() => {
    setTitle('Skybot Run');
  }, [setTitle]);

  useEffect(() => {
    getSkybotProgress(id).then((data) => setProgress(data));
  }, [loadProgress]);

  useEffect(() => {
    getSkybotRunById({ id }).then((res) => {
      setSummary([
        {
          title: 'Status',
          value: () => (
            <ColumnStatus status={res.status} title={res.error_msg} />
          ),
        },
        {
          title: 'Owner',
          value: res.owner,
        },
        {
          title: 'Start',
          value: moment(res.start).format('YYYY-MM-DD HH:mm:ss'),
        },
        {
          title: 'Execution',
          value: res.execution_time ? res.execution_time.split('.')[0] : 0,
        },
        {
          title: 'Exposures',
          value: res.exposures,
        },
      ]);
    });
  }, [loadProgress]);

  const tableColumns = [
    {
      name: 'ccds',
      title: 'Details',
      width: 110,
      customElement: (row) => {
        if (row.ccds === 0) {
          return <span>-</span>;
        }
        return (
          <Button
            onClick={() =>
              history.push(
                `/data-preparation/des/skybot/${id}/asteroid/${row.id}`
              )
            }
          >
            <i className="fas fa-info-circle" />
          </Button>
        );
      },
      align: 'center',
    },
    {
      name: 'id',
      title: 'Exposure',
      width: 120,
      align: 'center',
    },
    {
      name: 'success',
      title: 'Status',
      align: 'center',

      customElement: (row) => (
        <ColumnStatus status={row.success ? 'success' : 'failure'} />
      ),
      width: 130,
    },
    {
      name: 'positions',
      title: 'Positions',
    },
    {
      name: 'date_obs',
      title: 'Observation Date',

      customElement: (el) => (
        <span>
          {el.date_obs ? moment(el.date_obs).format('YYYY-MM-DD') : ''}
        </span>
      ),
      width: 150,
    },
    {
      name: 'inside_ccd',
      title: 'Inside CCD',
    },
    {
      name: 'outside_ccd',
      title: 'Outside CCD',
    },
  ];

  const loadData = ({ pageSize, currentPage }) => {
    getSkybotResult({ id, pageSize, currentPage }).then((res) => {
      setTableData(res.results);
      setTotalCount(res.count);
    });
  };

  const formatSeconds = (value) =>
    moment().startOf('day').seconds(value).format('HH:mm:ss');

  useEffect(() => {
    loadData();
  }, []);

  useInterval(() => {
    if (
      progress.request.status !== 'completed' ||
      progress.loaddata.status !== 'completed'
    ) {
      setLoadProgress((prevState) => !prevState);
    }
  }, [10000]);

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
      <Grid item xs={12}>
        <Grid container spacing={3} direction="column">
          <Grid item>
            <Progress
              title="Retrieving data from Skybot"
              variant="determinate"
              label={`${progress.request.exposures} exposures`}
              total={progress.request.exposures}
              current={progress.request.current}
            />
            {progress.request.status !== 'completed' ? (
              <Grid container spacing="2">
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
                    label={`Estimate: ${formatSeconds(
                      progress.request.time_estimate
                    )}`}
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
            ) : null}
          </Grid>
          <Grid item>
            <Progress
              title="Importing positions to database"
              variant="determinate"
              label={`${progress.loaddata.exposures} exposures`}
              total={progress.loaddata.exposures}
              current={progress.loaddata.current}
            />
            {progress.loaddata.status !== 'completed' ? (
              <Grid container spacing="2">
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
                    label={`Estimate: ${formatSeconds(
                      progress.loaddata.time_estimate
                    )}`}
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
            ) : null}
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Grid container alignItems="stretch" spacing={2}>
          <Grid item xs={4}>
            <Card>
              <CardHeader title="Summary" />
              <CardContent>
                <List data={summary} />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={8}>
            <Card>
              <CardHeader title="Execution Time" />
              <CardContent>
                <Donut data={[]} height={300} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Card>
              <CardHeader title="Skybot Results" />
              <CardContent>
                <Table
                  columns={tableColumns}
                  data={tableData}
                  loadData={loadData}
                  totalCount={totalCount}
                  loading
                  hasSearching={false}
                  hasSorting={false}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}

SkybotDetail.propTypes = {
  setTitle: PropTypes.func.isRequired,
};

export default SkybotDetail;
