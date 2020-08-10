import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Grid,
  Card,
  CardHeader,
  CardContent,
  Icon,
  Button,
  ButtonGroup,
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
import CalendarExecutedNight from '../../components/Chart/CalendarExecutedNight';
import {
  getSkybotResultById,
  getSkybotRunById,
  getSkybotProgress,
  cancelSkybotJobById,
  getExecutedNightsByPeriod,
  getDynclassAsteroids,
  // getSkybotTimeProfile,
} from '../../services/api/Skybot';
import useInterval from '../../hooks/useInterval';
import useStyles from './styles';

function SkybotDetail({ setTitle }) {
  const { id } = useParams();
  const history = useHistory();
  const classes = useStyles();
  const [status, setStatus] = useState(0);
  const [summaryExecution, setSummaryExecution] = useState([]);
  const [summaryResults, setSummaryResults] = useState([]);
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
  const [isJobCanceled, setIsJobCanceled] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [hasCircularProgress, setHasCircularProgress] = useState(true);

  // Initiating totalCount as null so that it passes the conditional rendering,
  // in case of nor exposure, and calls the function loadData.
  const [totalCount, setTotalCount] = useState(null);

  const [executedDate, setExecutedDate] = useState(['', '']);
  const [executedNightsByPeriod, setExecutedNightsByPeriod] = useState([]);
  const [currentYearExecutedNights, setCurrentYearExecutedNights] = useState(
    []
  );

  const [currentSelectedDateYear, setCurrentSelectedDateYear] = useState('');
  const [selectedDateYears, setSelectedDateYears] = useState([]);

  const [dynclassAsteroids, setDynclassAsteroids] = useState([]);

  const handleBackNavigation = () => history.goBack();

  useEffect(() => {
    setTitle('Skybot');
  }, [setTitle]);

  useEffect(() => {
    getSkybotProgress(id)
      .then((data) => {
        setProgress(data);
        setHasCircularProgress(false);
      })
      .catch(() => {
        setHasCircularProgress(true);
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
      name: 'id',
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
      name: 'exposure',
      title: 'Exposure #',
    },
    {
      name: 'positions',
      title: '# Identifications',
    },
    {
      name: 'inside_ccd',
      title: '# SSOs In CCDs',
    },
    {
      name: 'outside_ccd',
      title: '# SSOs Out CCDs',
    },
    {
      name: 'execution_time',
      title: 'Execution Time',
      width: 150,
      customElement: (row) =>
        row.execution_time ? row.execution_time.split('.')[0] : '-',
    },
  ];

  const dynclassAsteroidsColumns = [
    {
      name: 'dynclass',
      title: 'Dynamic Class',
      width: 200,
      sortingEnabled: false,
    },
    {
      name: 'asteroids',
      title: '# SSOs',
      width: 200,
      sortingEnabled: false,
    },
    {
      name: 'positions',
      title: '# Observations',
      width: 200,
      sortingEnabled: false,
    },
    {
      name: 'ccds',
      title: '# CCDs',
      width: 200,
      sortingEnabled: false,
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

  useEffect(() => {
    getSkybotRunById({ id }).then((res) => {
      setStatus(res.status);
      setSummaryExecution([
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
          title: 'Execution Date',
          value: `${moment(res.date_initial).format('YYYY-MM-DD')} / ${moment(
            res.date_final
          ).format('YYYY-MM-DD')}`,
        },
        {
          title: 'Start',
          value: moment(res.start).format('YYYY-MM-DD HH:mm:ss'),
        },
        {
          title: 'Finish',
          value: res.finish
            ? moment(res.finish).format('YYYY-MM-DD HH:mm:ss')
            : '-',
        },
        {
          title: 'Execution',
          value: res.execution_time ? res.execution_time.split('.')[0] : 0,
        },
      ]);

      setSummaryResults([
        {
          title: '# Nights',
          value: res.nights,
        },
        {
          title: '# CCDs Analyzed',
          value: res.ccds,
        },
        {
          title: '# SSOs',
          value: res.asteroids,
        },
        {
          title: '# Observations',
          value: res.positions,
        },
        {
          title: '# CCDs with SSOs',
          value: res.ccds_with_asteroid,
        },
      ]);

      setExecutedDate([res.date_initial, res.date_final]);
    });
    loadData({
      currentPage: 0,
      pageSize: 10,
      sorting: [{ columnName: 'id', direction: 'asc' }],
    });
  }, [loadProgress]);

  useEffect(() => {
    getDynclassAsteroids(id).then((res) => {
      setDynclassAsteroids(res);
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

  const formatSeconds = (value) =>
    moment().startOf('day').seconds(value).format('HH:mm:ss');

  useInterval(() => {
    if ([1, 2].includes(status)) {
      setLoadProgress((prevState) => !prevState);
    }
  }, [5000]);

  const handleStopRun = () => {
    cancelSkybotJobById(id).then(() => {
      setIsJobCanceled(true);
      setLoadProgress((prevState) => !prevState);
    });
  };

  useEffect(() => {
    if (executedDate[0] !== '' && executedDate[1] !== '') {
      getExecutedNightsByPeriod(
        moment(executedDate[0]).format('YYYY-MM-DD'),
        moment(executedDate[1]).format('YYYY-MM-DD')
      ).then((res) => {
        const selectedYears = res
          .map((year) => moment(year.date).format('YYYY'))
          .filter((year, i, yearArr) => yearArr.indexOf(year) === i);

        setSelectedDateYears(selectedYears);
        setCurrentSelectedDateYear(selectedYears[0]);

        setExecutedNightsByPeriod(res);
      });
    }
  }, [executedDate]);

  useEffect(() => {
    if (executedNightsByPeriod.length > 0) {
      const nights = executedNightsByPeriod.filter(
        (exposure) =>
          moment(exposure.date).format('YYYY') === currentSelectedDateYear
      );

      setCurrentYearExecutedNights(nights);
    }
  }, [executedNightsByPeriod, currentSelectedDateYear]);

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
          {[1, 2].includes(status) ? (
            <Grid item>
              <Button
                variant="contained"
                color="secondary"
                title="Abort"
                onClick={handleStopRun}
                disabled={isJobCanceled}
              >
                {isJobCanceled ? (
                  <CircularProgress size={15} color="secondary" />
                ) : (
                  <Icon className="fas fa-stop" fontSize="inherit" />
                )}
                <Typography variant="button" style={{ margin: '0 5px' }}>
                  Abort
                </Typography>
              </Button>
            </Grid>
          ) : null}
        </Grid>
      </Grid>
      {totalCount === 0 && ![1, 2].includes(status) ? (
        <Grid item xs={12}>
          <Typography variant="h6">
            No exposure was found or all exposures were already executed in this
            period.
          </Typography>
        </Grid>
      ) : (
        <>
          <Grid item xs={12} md={5} lg={3}>
            <Card>
              <CardHeader title="Summary Execution" />
              <CardContent>
                <List data={summaryExecution} />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={7} lg={9}>
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
                            moment
                              .duration(progress.loaddata.time_estimate)
                              .add(
                                moment.duration(progress.request.time_estimate)
                              )
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
                  {hasCircularProgress && [1, 2].includes(status) ? (
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
              <Grid item xs={12} md={4} lg={3}>
                <Card>
                  <CardHeader title="Summary Results" />
                  <CardContent>
                    <List data={summaryResults} />
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={8} lg={9}>
                <Card>
                  <CardHeader title="Executed Nights" />
                  <CardContent>
                    <Grid
                      container
                      spacing={2}
                      direction="column"
                      className={classes.gridTable}
                    >
                      <Grid item>
                        {selectedDateYears.length > 1 ? (
                          <ButtonGroup
                            variant="contained"
                            color="primary"
                            className={classes.buttonGroupYear}
                          >
                            {selectedDateYears.map((year) => (
                              <Button
                                key={year}
                                onClick={() => setCurrentSelectedDateYear(year)}
                                disabled={currentSelectedDateYear === year}
                              >
                                {year}
                              </Button>
                            ))}
                          </ButtonGroup>
                        ) : null}
                      </Grid>
                      <Grid item className={classes.gridTableRow}>
                        <CalendarExecutedNight
                          data={currentYearExecutedNights}
                        />
                      </Grid>
                    </Grid>
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

          {
            // Idle and Running Statuses:
            ![1, 2].includes(status) ? (
              <>
                <Grid item xs={12}>
                  {/* <Grid item xs={12} sm={8}>
                      <Card>
                        <CardHeader title="Execution Time" />
                        <CardContent>
                          <SkybotTimeProfile data={timeProfile} />
                        </CardContent>
                      </Card>
                    </Grid> */}
                </Grid>
                <Grid item xs={12}>
                  <Card>
                    <CardHeader title="Summary Dynamic Class" />
                    <CardContent>
                      <Table
                        columns={dynclassAsteroidsColumns}
                        data={dynclassAsteroids}
                        totalCount={dynclassAsteroids.length}
                        hasSearching={false}
                        hasPagination={false}
                        // hasSorting={false}
                        // defaultSorting={[{ columnName: 'dynclass', direction: 'asc' }]}
                        hasColumnVisibility={false}
                        hasToolbar={false}
                        remote={false}
                        loading
                      />
                    </CardContent>
                  </Card>
                </Grid>
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
                        // hasSorting={false}
                        hasColumnVisibility={false}
                        hasToolbar={false}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              </>
            ) : null
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
