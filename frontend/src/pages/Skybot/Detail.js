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
  CircularProgress,
} from '@material-ui/core';
import { useParams, useHistory } from 'react-router-dom';
import moment from 'moment';
import { InfoOutlined as InfoOutlinedIcon } from '@material-ui/icons';
import List from '../../components/List';
import Table from '../../components/Table';
// import SkybotTimeProfile from '../../components/Chart/SkybotTimeProfile';
import ColumnStatus from '../../components/Table/ColumnStatus';
import Progress from '../../components/Progress';
import {
  getSkybotResultById,
  getSkybotRunById,
  getSkybotProgress,
  // getSkybotTimeProfile,
} from '../../services/api/Skybot';
import useInterval from '../../hooks/useInterval';
import useStyles from './styles';

function SkybotDetail({ setTitle }) {
  const { id } = useParams();
  const history = useHistory();
  const classes = useStyles();
  const [status, setStatus] = useState(0);
  const [summary, setSummary] = useState([]);
  // const [timeProfile, setTimeProfile] = useState({
  //   requests: [],
  //   loaddata: [],
  // });
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
  const [hasCircularProgress, setHasCircularProgress] = useState(true);

  // Initiating totalCount as null so that it passes the conditional rendering
  // , in case of nor exposure, and calls the function loadData.
  const [totalCount, setTotalCount] = useState(null);

  const handleBackNavigation = () => history.goBack();

  useEffect(() => {
    setTitle('Skybot');
  }, [setTitle]);

  useEffect(() => {
    setHasCircularProgress(false);
    getSkybotProgress(id).then((data) => {
      setProgress(data);
      setHasCircularProgress(true);
    });
  }, [loadProgress]);

  useEffect(() => {
    getSkybotRunById({ id }).then((res) => {
      setStatus(res.status);
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

  // useEffect(() => {
  //   if (
  //     progress.request.status === 'completed' &&
  //     progress.loaddata.status === 'completed'
  //   ) {
  //     getSkybotTimeProfile(id).then((res) => {
  //       const { requests, loaddata } = res;
  //       if (res.success) {
  //         setTimeProfile({
  //           requests: requests.map((request) => ({
  //             [res.columns[0]]: request[0],
  //             [res.columns[1]]: request[1],
  //             [res.columns[2]]: request[2],
  //             [res.columns[3]]: request[3],
  //             [res.columns[4]]: request[4],
  //           })),

  //           loaddata: loaddata.map((request) => ({
  //             [res.columns[0]]: request[0],
  //             [res.columns[1]]: request[1],
  //             [res.columns[2]]: request[2],
  //             [res.columns[3]]: request[3],
  //             [res.columns[4]]: request[4],
  //           })),
  //         });
  //       }
  //     });
  //   }
  // }, [id, progress]);

  const tableColumns = [
    {
      name: 'job',
      title: 'Details',
      width: 110,
      customElement: (row) => {
        if (row.positions === 0) {
          return <span>-</span>;
        }
        return (
          <Button
            onClick={() =>
              history.push(`/data-preparation/des/skybot/asteroid/${row.id}`)
            }
          >
            <InfoOutlinedIcon />
          </Button>
        );
      },
      sortingEnabled: false,
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
      name: 'id',
      title: 'ID',
      width: 120,
      align: 'center',
    },
    {
      name: 'exposure',
      title: 'Exposure',
      width: 120,
      align: 'center',
    },
    {
      name: 'positions',
      title: 'Positions',
    },
    {
      name: 'inside_ccd',
      title: 'Inside CCD',
    },
    {
      name: 'outside_ccd',
      title: 'Outside CCD',
    },
    {
      name: 'execution_time',
      title: 'Execution Time',
      width: 150,
      customElement: (row) =>
        row.execution_time ? row.execution_time.split('.')[0] : '-',
    },
  ];

  const loadData = ({ currentPage, pageSize, sorting }) => {
    // Current Page count starts at 0, but the endpoint expects the 1 as the first index:
    const page = currentPage + 1;
    const ordering = `${sorting[0].direction === 'desc' ? '-' : ''}${
      sorting[0].columnName
    }`;

    getSkybotResultById({ id, page, pageSize, ordering }).then((res) => {
      setTableData(res.results);
      setTotalCount(res.count);
    });
  };

  const formatSeconds = (value) =>
    moment().startOf('day').seconds(value).format('HH:mm:ss');

  useInterval(() => {
    if (
      ![3, 4, 5, 6].includes(status) ||
      progress.request.status !== 'completed' ||
      progress.loaddata.status !== 'completed'
    ) {
      setLoadProgress((prevState) => !prevState);
    }
  }, [10000]);

  useEffect(() => {
    console.log('hasCircularProgress', hasCircularProgress);
    console.log(
      '![3, 4, 5, 6].includes(status)',
      ![3, 4, 5, 6].includes(status)
    );
    console.log(
      'status',
      hasCircularProgress || ![3, 4, 5, 6].includes(status)
    );
  }, [status, hasCircularProgress]);

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
      {totalCount === 0 ? (
        <Grid item xs={12}>
          <Typography variant="h6">
            No exposure was found or all exposures were already executed in this
            period.
          </Typography>
        </Grid>
      ) : (
        <>
          <Grid item xs={12}>
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
                      title="Retrieving data from Skybot"
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
                  </Grid>
                  {hasCircularProgress && ![3, 4, 5, 6].includes(status) ? (
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

          {
            // Completed, Failed, Aborted and Stopped Statuses:
            ![3, 4, 5, 6].includes(status) ||
            progress.request.status !== 'completed' ||
            progress.loaddata.status !== 'completed' ? null : (
              <>
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
                    {/* <Grid item xs={8}>
                      <Card>
                        <CardHeader title="Execution Time" />
                        <CardContent>
                          <SkybotTimeProfile data={timeProfile} />
                        </CardContent>
                      </Card>
                    </Grid> */}
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
                            totalCount={totalCount || 0}
                            hasSearching={false}
                            defaultSorting={[
                              { columnName: 'id', direction: 'asc' },
                            ]}
                            // hasSorting={false}
                            hasColumnVisibility={false}
                            hasToolbar={false}
                          />
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Grid>
              </>
            )
          }
        </>
      )}
    </Grid>
  );
}

SkybotDetail.propTypes = {
  setTitle: PropTypes.func.isRequired,
};

export default SkybotDetail;
