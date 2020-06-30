import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { useHistory } from 'react-router-dom';
import {
  Grid,
  Card,
  CardHeader,
  CardContent,
  ButtonGroup,
  Button,
  FormControl,
  MenuItem,
  Select,
  InputLabel,
  Typography,
  Snackbar,
} from '@material-ui/core';
import createPlotlyComponent from 'react-plotly.js/factory';
import Plotly from 'plotly.js';
import { InfoOutlined as InfoOutlinedIcon } from '@material-ui/icons';
import Table from '../../components/Table';
import ColumnStatus from '../../components/Table/ColumnStatus';
import DateRangePicker from '../../components/Date/DateRangePicker';
import useInterval from '../../hooks/useInterval';
import {
  createSkybotRun,
  getSkybotRunList,
  getExposuresByPeriod,
  getExecutedNightsByPeriod,
} from '../../services/api/Skybot';
import CalendarHeatmap from '../../components/Chart/CalendarHeatmap';
import CalendarExecutedNight from '../../components/Chart/CalendarExecutedNight';
import useStyles from './styles';

function Skybot({ setTitle }) {
  const history = useHistory();
  const classes = useStyles();
  const [totalCount, setTotalCount] = useState(0);
  const [tableData, setTableData] = useState([]);
  const [disableSubmit, setDisableSubmit] = useState(true);
  const [reload, setReload] = useState(true);
  const [exposuresByPeriod, setExposuresByPeriod] = useState([]);
  const [executedNightsByPeriod, setExecutedNightsByPeriod] = useState([]);
  const [selectedDate, setSelectedDate] = useState(['', '']);
  const [chartType, setChartType] = useState(1);
  const [selectedDateYears, setSelectedDateYears] = useState([]);
  const [currentSelectedDateYear, setCurrentSelectedDateYear] = useState('');
  const [currentYearExposures, setCurrentYearExposures] = useState([]);
  const [currentYearExecutedNights, setCurrentYearExecutedNights] = useState(
    []
  );
  const [hasRunningFeedback, setHasRunningFeedback] = useState(false);

  useEffect(() => {
    setTitle('Skybot');
  }, [setTitle]);

  const handleSelectPeriodClick = () => {
    setExposuresByPeriod([]);
    setExecutedNightsByPeriod([]);
    setSelectedDateYears([]);
    setCurrentSelectedDateYear('');
    setCurrentYearExposures([]);
    setCurrentYearExecutedNights([]);

    getExecutedNightsByPeriod(
      moment(selectedDate[0]).format('YYYY-MM-DD'),
      moment(selectedDate[1]).format('YYYY-MM-DD')
    ).then((res) => {
      setExecutedNightsByPeriod(res);
    });

    getExposuresByPeriod(
      moment(selectedDate[0]).format('YYYY-MM-DD'),
      moment(selectedDate[1]).format('YYYY-MM-DD')
    ).then((res) => {
      const selectedYears = res
        .map((year) => moment(year.date).format('YYYY'))
        .filter((year, i, yearArr) => yearArr.indexOf(year) === i);

      setSelectedDateYears(selectedYears);
      setCurrentSelectedDateYear(selectedYears[0]);

      setExposuresByPeriod(res);
    });

    setDisableSubmit(false);
  };

  useEffect(() => {
    if (
      chartType !== 0 &&
      currentSelectedDateYear !== '' &&
      exposuresByPeriod.length > 0 &&
      executedNightsByPeriod.length > 0
    ) {
      const exposures = exposuresByPeriod.filter(
        (exposure) =>
          moment(exposure.date).format('YYYY') === currentSelectedDateYear
      );

      const nights = executedNightsByPeriod.filter(
        (exposure) =>
          moment(exposure.date).format('YYYY') === currentSelectedDateYear
      );

      setCurrentYearExposures(exposures);
      setCurrentYearExecutedNights(nights);
    }
  }, [
    exposuresByPeriod,
    executedNightsByPeriod,
    currentSelectedDateYear,
    chartType,
  ]);

  const loadData = ({ sorting, pageSize, currentPage }) => {
    getSkybotRunList({
      page: currentPage + 1,
      pageSize,
      ordering: sorting,
    }).then((res) => {
      const { data } = res;

      setTableData(data.results);
      setTotalCount(data.count);
    });
  };

  const handleSubmit = () => {
    createSkybotRun({
      date_initial: selectedDate[0],
      date_final: selectedDate.length === 1 ? selectedDate[0] : selectedDate[1],
    })
      .then((response) => {
        const { id } = response.data;

        const hasStatusRunning =
          tableData.filter((row) => row.status === 2).length > 0;

        if (hasStatusRunning) {
          setHasRunningFeedback(true);
          setReload((prevState) => !prevState);
        } else {
          history.push(`/data-preparation/des/skybot/${id}`);
        }
      })
      .catch(() => {
        setReload((prevState) => !prevState);
        setDisableSubmit(false);
      });
  };

  const handleSubmitJob = () => {
    setDisableSubmit(true);

    handleSubmit();
  };

  const tableColumns = [
    {
      name: 'results',
      title: 'Details',
      width: 110,
      customElement: (row) => (
        <Button
          onClick={() => history.push(`/data-preparation/des/skybot/${row.id}`)}
        >
          <InfoOutlinedIcon />
        </Button>
      ),
      align: 'center',
      sortingEnabled: false,
    },
    {
      name: 'status',
      title: 'Status',
      width: 150,
      customElement: (row) => (
        <ColumnStatus status={row.status} title={row.error_msg} />
      ),
    },
    {
      name: 'id',
      title: 'ID',
    },
    {
      name: 'owner',
      title: 'Owner',
      width: 180,
    },
    {
      name: 'date_initial',
      title: 'Initial Date',
      width: 130,
      customElement: (row) => (
        <span title={moment(row.start).format('HH:mm:ss')}>
          {row.date_initial}
        </span>
      ),
    },
    {
      name: 'date_final',
      title: 'Final Date',
      width: 130,
      customElement: (row) => (
        <span title={moment(row.finish).format('HH:mm:ss')}>
          {row.date_final}
        </span>
      ),
    },
    {
      name: 'start',
      title: 'Start Date',
      width: 130,
      customElement: (row) => (
        <span title={moment(row.start).format('HH:mm:ss')}>
          {moment(row.start).format('YYYY-MM-DD')}
        </span>
      ),
    },
    {
      name: 'execution_time',
      title: 'Execution Time',
      width: 150,
      headerTooltip: 'Execution time',
      align: 'center',
      customElement: (row) =>
        row.execution_time ? row.execution_time.split('.')[0] : null,
    },
    {
      name: 'exposures',
      title: 'Exposures',
      width: 100,
    },
  ];

  const Plot = createPlotlyComponent(Plotly);

  // Reload data if we have any Skybot job running,
  // so we can follow its progress in real time.
  useInterval(() => {
    const hasStatusRunning =
      tableData.filter((row) => row.status === 2).length > 0;

    if (hasStatusRunning) {
      setReload(!reload);
    }
  }, 10000);

  const handleChangeChartType = (e) => {
    setChartType(Number(e.target.value));
  };

  const renderExposurePlot = () => {
    if (exposuresByPeriod.length > 0) {
      return (
        <Grid container spacing={2} alignItems="stretch">
          <Grid item>
            <FormControl variant="outlined" className={classes.formControl}>
              <InputLabel>Chart Type</InputLabel>
              <Select
                label="Chart Type"
                value={chartType}
                onChange={handleChangeChartType}
              >
                <MenuItem value={0}>Bars</MenuItem>
                <MenuItem value={1}>Calendar</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          {chartType === 1 && selectedDateYears.length > 1 ? (
            <Grid item>
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
            </Grid>
          ) : null}
          <Grid item xs={12}>
            {chartType === 0 ? (
              <Plot
                data={[
                  {
                    x: exposuresByPeriod.map((rows) => rows.date),
                    y: exposuresByPeriod.map((rows) => rows.count),
                    type: 'bar',
                    name: `${exposuresByPeriod.reduce(
                      (a, b) => a + (b.count || 0),
                      0
                    )} exposures`,
                    showlegend: true,
                    fixedrange: true,
                    hoverinfo: 'y',
                  },
                ]}
                layout={{
                  hovermode: 'closest',
                  height: 465,
                  margin: {
                    t: 30,
                    b: 20,
                  },
                  autosize: true,
                  bargap: 0.05,
                  bargroupgap: 0.2,
                  xaxis: { title: 'Period' },
                  yaxis: { title: 'Exposures' },
                }}
                config={{
                  scrollZoom: false,
                  displaylogo: false,
                  responsive: true,
                }}
              />
            ) : null}
            {chartType === 1 ? (
              <>
                <CalendarExecutedNight data={currentYearExecutedNights} />
                <CalendarHeatmap data={currentYearExposures} />
              </>
            ) : null}
          </Grid>
        </Grid>
      );
    }
    return null;
  };

  return (
    <>
      <Grid container spacing={2} alignItems="stretch">
        <Grid item xs={12} md={6} lg={4} xl={3}>
          <Grid container direction="column" spacing={2}>
            <Grid item>
              <Card>
                <CardHeader title="Skybot Run" />
                <CardContent>
                  <Grid container spacing={2} alignItems="stretch">
                    <Grid item xs={12}>
                      <DateRangePicker
                        // First day of Skybot:
                        minDate={new Date('2012-11-10 04:09')}
                        maxDate={new Date('2019-02-28 00:00')}
                        selectedDate={selectedDate}
                        setSelectedDate={setSelectedDate}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={handleSelectPeriodClick}
                      >
                        Select
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            <Grid item>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Click here to submit a job on the selected period
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    disabled={disableSubmit}
                    onClick={handleSubmitJob}
                  >
                    Submit
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12} md={6} lg={8} xl={9}>
          <Card>
            <CardHeader title="Exposures By Period" />
            <CardContent>{renderExposurePlot()}</CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader title="History" />
            <CardContent>
              <Table
                columns={tableColumns}
                data={tableData}
                loadData={loadData}
                hasSearching={false}
                hasPagination
                hasColumnVisibility={false}
                hasToolbar={false}
                reload={reload}
                totalCount={totalCount}
                defaultSorting={[{ columnName: 'id', direction: 'asc' }]}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Snackbar
        open={hasRunningFeedback}
        autoHideDuration={5000}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        message="There's already a job running, so your job is currently idle."
        onClose={() => setHasRunningFeedback(false)}
      />
    </>
  );
}

Skybot.propTypes = {
  setTitle: PropTypes.func.isRequired,
};

export default Skybot;
