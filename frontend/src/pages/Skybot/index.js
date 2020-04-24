import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import clsx from 'clsx';
import {
  Card, CardHeader, CardContent, Typography, makeStyles, CircularProgress,
} from '@material-ui/core';
import Button from '@material-ui/core/Button';
import MenuItem from '@material-ui/core/MenuItem';
import Label from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import SnackBar from '@material-ui/core/Snackbar';
import Slide from '@material-ui/core/Slide';
import moment from 'moment';
import Skeleton from '@material-ui/lab/Skeleton';
import { SizeMe } from 'react-sizeme';
import createPlotlyComponent from 'react-plotly.js/factory';
import Plotly from 'plotly.js';
import {
  createSkybotRun, getSkybotRunList, getSkybotRunEstimate, getExposuresByPeriod,
} from '../../services/api/Skybot';
import Table from '../../components/helpers/CustomTable';
import CustomColumnStatus from '../../components/helpers/CustomColumnStatus';


const useStyles = makeStyles((theme) => ({
  typography: {
    marginBottom: 15,
  },
  runButton: {
    marginTop: theme.spacing(1) + 4,
    width: '30%',
    marginLeft: '70%',
  },
  dialogButton: {
    marginRight: '4%',
    marginBottom: '2%',
    float: 'right',
    width: '15%',
  },
  dateSet: {
    marginTop: 30,
  },
  progress: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
  iconDetail: {
    fontSize: 18,
  },
  logToolbar: {
    backgroundColor: '#F1F2F5',
    color: '#454545',
  },
  noExposureMessage: {
    position: 'absolute',
    fontSize: 22,
    textTransform: 'uppercase',
    top: '50%',
    transform: 'translateY(-50%)',
    left: 0,
    right: 0,
    textAlign: 'center',
  },
  runEstimateText: {
    fontSize: 18,
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
    textAlign: 'justify',
  },
}));


function useInterval(callback, delay) {
  const savedCallback = useRef();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  // eslint-disable-next-line consistent-return
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

function Skybot({ setTitle, history }) {
  const [selectRunValue, setSelectRunValue] = useState('period');
  const [initialDate, setInitialDate] = useState(null);
  const [finalDate, setFinalDate] = useState(null);
  const [errorDatePicker, setErrorDatePicker] = useState(false);
  const [tablePage, setTablePage] = useState(1);
  const [tablePageSize, setTablePageSize] = useState(10);
  const [totalSize, setTotalSize] = useState(0);
  const [sortField] = useState('-start');
  const [sortOrder] = useState(0);
  const [tableData, setTableData] = useState([]);
  const pageSizes = [5, 10, 15];
  const [disabledRunButton, setDisabledRunButton] = useState(true);
  const [disabledInitialDate, setDisabledInitialDate] = useState(true);
  const [disabledFinalDate, setDisabledFinalDate] = useState(true);
  const [loading, setLoading] = useState(false);
  const [snackBarVisible, setSnackBarVisible] = useState(false);
  const [snackBarPosition] = useState({
    vertical: 'bottom',
    horizontal: 'right',
  });
  const [snackBarTransition, setSnackBarTransition] = useState(undefined);
  const [runEstimate, setRunEstimate] = useState({});
  const [exposuresByPeriod, setExposuresByPeriod] = useState([]);
  const [exposuresPlotHeight, setExposuresPlotHeight] = useState([]);
  const [exposurePlotLoading, setExposurePlotLoading] = useState({
    loading: false,
    hasData: true,
  });
  const [reload, setReload] = useState(true);

  const classes = useStyles();

  useEffect(() => {
    setTitle('Skybot Run');
    loadData();
  }, []);

  useEffect(() => {
    if (errorDatePicker) {
      setDisabledRunButton(true);
    }
  }, [errorDatePicker]);

  useEffect(() => {
    setExposuresByPeriod([]);
    setRunEstimate({});
    if (initialDate) {
      setDisabledFinalDate(false);
    }

    if ((initialDate && finalDate) && (!errorDatePicker)) {
      setExposurePlotLoading({
        loading: true,
        hasData: false,
      });

      // Get the time estimate and amount of exposures based on period, before running:
      getSkybotRunEstimate(
        moment(initialDate).format('YYYY-MM-DD'),
        moment(finalDate).format('YYYY-MM-DD'),
      ).then((res) => setRunEstimate(res));

      getExposuresByPeriod(
        moment(initialDate).format('YYYY-MM-DD'),
        moment(finalDate).format('YYYY-MM-DD'),
      ).then((res) => {
        setExposurePlotLoading({
          loading: false,
          hasData: res.rows.length > 0,
        });
        setExposuresByPeriod(res.rows);
      });
      setDisabledRunButton(false);
    }

    if (!initialDate || initialDate.toString() === 'Invalid Date') {
      setDisabledRunButton(true);
      setDisabledFinalDate(true);
    }

    if (!finalDate || finalDate.toString() === 'Invalid Date') {
      setDisabledRunButton(true);
    }
  }, [initialDate, finalDate]);


  useEffect(() => {
    setRunEstimate({});
    setExposuresByPeriod([]);
    if (selectRunValue === 'all') {
      setExposurePlotLoading({
        loading: true,
        hasData: false,
      });
      setRunEstimate({});
      setDisabledInitialDate(true);
      setDisabledFinalDate(true);
      getSkybotRunEstimate().then((res) => setRunEstimate(res));
      getExposuresByPeriod().then((res) => {
        setExposurePlotLoading({
          loading: false,
          hasData: res.rows.length > 0,
        });
        setExposuresByPeriod(res.rows);
      });
      setDisabledRunButton(false);
    }

    if (selectRunValue === 'period') {
      setExposurePlotLoading({
        loading: false,
        hasData: true,
      });
      setDisabledInitialDate(false);
      setDisabledRunButton(true);
      setInitialDate(null);
      setFinalDate(null);
    }
  }, [selectRunValue]);


  const loadData = (event) => {
    let page = null;
    let pageSize = null;

    if (event) {
      page = event.currentPage + 1;
      pageSize = event.pageSize;
      setTablePage(page);
      setTablePageSize(event.pageSize);
    } else {
      page = tablePage;
      pageSize = tablePageSize;
    }

    getSkybotRunList({
      page, pageSize, sortField, sortOrder,
    })
      .then((res) => {
        const { data } = res;
        setTableData(data.results);
        setTotalSize(data.count);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleSubmit = () => {
    createSkybotRun(
      {
        type_run: selectRunValue,
        date_initial: initialDate,
        date_final: finalDate,
      },
    ).then(() => {
      loadData();
      setDisabledRunButton(false);
    });
  };

  const handleSelectRunClick = () => {
    switch (selectRunValue) {
      case 'all':
        setDisabledRunButton(true);
        setLoading(true);
        handleSubmit();
        break;
      case 'period':
        setSnackBarVisible(true);
        setSnackBarTransition(() => transitionSnackBar);
        setDisabledRunButton(true);
        setLoading(true);
        handleSubmit();
        break;
    }
  };

  const loadMenuItems = () => {
    const options = [
      { id: 1, title: 'All Pointings', value: 'all' },
      { id: 2, title: 'By Period', value: 'period' },
    ];

    return options.map((el, i) => (
      <MenuItem
        key={el.id}
        value={el.value}
        title={el.title}
      >
        {el.title}
      </MenuItem>
    ));
  };

  const tableColumns = [
    {
      name: 'id',
      title: 'Details',
      width: 110,
      icon: <i className={clsx(`fas fa-info-circle ${classes.iconDetail}`)} />,
      action: (row) => history.push(`/skybot/${row.id}`),
      align: 'center',
      sortingEnabled: false,
    },
    {
      name: 'status',
      title: 'Status',
      width: 140,
      align: 'center',
      customElement: (row) => <CustomColumnStatus status={row.status} title={row.error_msg} />,
    },
    {
      name: 'owner', title: 'Owner', width: 140, align: 'left',
    },
    {
      name: 'date_initial',
      title: 'Initial Date',
      width: 100,
      align: 'left',
      customElement: (row) => (
        <span>
          {row.date_initial ? moment(row.date_initial).format('YYYY-MM-DD') : ''}
        </span>
      ),
    },
    {
      name: 'date_final',
      title: 'Final Date',
      width: 100,
      align: 'left',
      customElement: (row) => (
        <span>
          {row.date_final ? moment(row.date_final).format('YYYY-MM-DD') : ''}
        </span>
      ),
    },
    {
      name: 'type_run', title: 'Run Type', width: 100, align: 'center',
    },
    {
      name: 'start', title: 'Start', width: 200, align: 'center',
    },
    {
      name: 'type_run', title: 'Type', width: 120, align: 'center',
    },
    {
      name: 'rows', title: 'Rows', width: 100, align: 'right',
    },
    {
      name: 'h_execution_time',
      title: 'Exec Time',
      width: 150,
      align: 'center',
      headerTooltip: 'Execution time',
    },
  ];


  const transitionSnackBar = (props) => <Slide {...props} direction="left" />;

  const { vertical, horizontal } = snackBarPosition;

  const handleFinalDateError = (error) => {
    const currentDateMessage = 'Date should not be after current date';
    const initialDateMessage = 'Date should not be before initial date';

    if (error.trim() === currentDateMessage.trim()
      || error.trim() === initialDateMessage.trim()) {
      setErrorDatePicker(true);
      setFinalDate(null);
    } else {
      setErrorDatePicker(false);
    }
  };

  const Plot = createPlotlyComponent(Plotly);

  const toHHMMSS = (time) => {
    const secNum = parseInt(time, 10);
    let hours = Math.floor(secNum / 3600);
    let minutes = Math.floor((secNum - (hours * 3600)) / 60);
    let seconds = secNum - (hours * 3600) - (minutes * 60);

    if (hours < 10) { hours = `0${hours}`; }
    if (minutes < 10) { minutes = `0${minutes}`; }
    if (seconds < 10) { seconds = `0${seconds}`; }
    return `${hours}:${minutes}:${seconds}`;
  };

  useInterval(() => {
    setReload(!reload);
  }, [30000]);

  return (
    <Grid>
      <Grid container spacing={2}>
        <Grid item xs={12} lg={4} xl={3}>
          <Card>
            <CardHeader
              title="SkyBot Run"
            />
            <CardContent style={{ height: exposuresPlotHeight }}>
              <Typography className={classes.typography}>Identification of CCDs with objects.</Typography>
              <FormControl fullWidth>
                <Label>Select the type of submission</Label>
                <Select
                  value={selectRunValue}
                  onChange={(event) => {
                    if (event.target.value === 'all') {
                      setInitialDate(null);
                      setFinalDate(null);
                    }
                    setSelectRunValue(event.target.value);
                  }}
                >
                  {loadMenuItems()}
                </Select>

                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <KeyboardDatePicker
                    disableFuture
                    disabled={disabledInitialDate}
                    className={classes.dateSet}
                    format="yyyy-MM-dd"
                    label="Initial Date"
                    value={initialDate}
                    onChange={(date) => { setInitialDate(date); }}
                    maxDateMessage="Date should not be after current date"
                  />
                  <KeyboardDatePicker
                    disableFuture
                    disabled={disabledFinalDate}
                    className={classes.dateSet}
                    format="yyyy-MM-dd"
                    label="Final Date"
                    value={finalDate}
                    minDate={initialDate}
                    minDateMessage=" Date should not be before initial date"
                    maxDateMessage="Date should not be after current date"
                    onChange={(date) => setFinalDate(date)}
                    onError={handleFinalDateError}
                  />
                </MuiPickersUtilsProvider>
                {runEstimate.exposures && runEstimate.exposures !== 0 ? (
                  <>
                    <span className={classes.runEstimateText}>
                      {`The average time execution for one exposure is ${toHHMMSS(runEstimate.time_per_exposure)}`}
                    </span>
                    <span className={classes.runEstimateText}>
                      {`The estimate time for identifying all of the CCDs with objects is ${toHHMMSS(runEstimate.estimate)}`}
                    </span>
                  </>
                ) : null}
                <Button
                  variant="contained"
                  color="primary"
                  className={classes.runButton}
                  disabled={disabledRunButton}
                  onClick={handleSelectRunClick}
                >
                  Submit
                  {loading
                    ? (
                      <CircularProgress
                        color="primary"
                        className={classes.progress}
                        size={24}
                      />
                    )
                    : null}
                </Button>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} lg={8} xl={9}>
          <Card>
            <CardHeader
              title="Unique Exposures By Period"
            />
            <SizeMe monitorHeight>
              {({ size }) => {
                setExposuresPlotHeight(size.height);
                return (
                  <CardContent>
                    {exposuresByPeriod.length > 0 ? (
                      <Plot
                        data={[{
                          x: exposuresByPeriod.map((rows) => rows.date_obs),
                          y: exposuresByPeriod.map((rows) => rows.exposures),
                          type: 'bar',
                          name: `${runEstimate.exposures} exposures`,
                          showlegend: true,
                          fixedrange: true,
                          hoverinfo: 'y',
                        }]}
                        className={classes.plotWrapper}
                        layout={{
                          hovermode: 'closest',
                          autosize: true,
                          bargap: 0.05,
                          bargroupgap: 0.2,
                          xaxis: { title: 'Period' },
                          yaxis: { title: 'Exposures' },
                        }}
                        config={{
                          scrollZoom: true,
                          displaylogo: false,
                          responsive: true,
                        }}
                      />
                    ) : (
                      <>
                        <Skeleton height={440} />
                        {exposurePlotLoading.loading ? (
                          <CircularProgress
                            color="primary"
                            className={classes.progress}
                            size={24}
                          />
                        ) : null}
                        {exposurePlotLoading.loading === false
                          && exposurePlotLoading.hasData === false ? (
                            <span className={classes.noExposureMessage}>
                              No exposure was found in this period
                            </span>
                          ) : null}
                      </>
                    )}
                  </CardContent>
                );
              }}
            </SizeMe>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="History"
            />
            <CardContent>
              <Table
                columns={tableColumns}
                data={tableData}
                loadData={loadData}
                pageSizes={pageSizes}
                hasSearching={false}
                hasPagination
                hasColumnVisibility={false}
                hasToolbar={false}
                reload={reload}
                totalCount={totalSize}
                loading
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <SnackBar
        open={snackBarVisible}
        autoHideDuration={3500}
        TransitionComponent={snackBarTransition}
        anchorOrigin={{ vertical, horizontal }}
        message="Executing... Check progress on history table ."
        onClose={() => setSnackBarVisible(false)}
      />
    </Grid>
  );
}

Skybot.propTypes = {
  setTitle: PropTypes.func.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};

export default withRouter(Skybot);
