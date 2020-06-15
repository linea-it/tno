import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { useHistory } from 'react-router-dom';
import {
  Grid,
  Card,
  CardHeader,
  CardContent,
  CircularProgress,
  Button,
  Snackbar,
  Slide,
} from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
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
} from '../../services/api/Skybot';
import CalendarHeatmap from '../../components/Chart/CalendarHeatmap';

function Skybot({ setTitle }) {
  const history = useHistory();
  const [totalCount, setTotalCount] = useState(0);
  const [tableData, setTableData] = useState([]);
  const [disableSubmit, setDisableSubmit] = useState(true);
  const [loading, setLoading] = useState(false);
  const [snackBarVisible, setSnackBarVisible] = useState(false);
  const [snackBarPosition] = useState({
    vertical: 'bottom',
    horizontal: 'right',
  });
  const [snackBarTransition, setSnackBarTransition] = useState(undefined);
  const [exposuresByPeriod, setExposuresByPeriod] = useState([]);
  const [exposurePlotLoading, setExposurePlotLoading] = useState({
    loading: false,
    hasData: true,
  });
  const [reload, setReload] = useState(true);
  const [selectedDate, setSelectedDate] = useState([
    '2012-11-10',
    '2012-12-10',
  ]);

  useEffect(() => {
    setTitle('Skybot');
  }, [setTitle]);

  useEffect(() => {
    setExposuresByPeriod([]);

    if (selectedDate[0] && selectedDate[1]) {
      setExposurePlotLoading({
        loading: true,
        hasData: false,
      });

      getExposuresByPeriod(
        moment(selectedDate[0]).format('YYYY-MM-DD'),
        moment(selectedDate[1]).format('YYYY-MM-DD')
      ).then((res) => {
        setExposurePlotLoading({
          loading: false,
          hasData: res.length > 0,
        });
        setExposuresByPeriod(res);
      });

      setDisableSubmit(false);
    }

    if (!selectedDate[0]) {
      setDisableSubmit(true);
    }

    if (!selectedDate[1]) {
      setDisableSubmit(true);
    }
  }, [selectedDate]);

  const loadData = ({ sorting, pageSize, currentPage }) => {
    getSkybotRunList({
      page: currentPage + 1,
      pageSize,
      ordering: sorting,
    })
      .then((res) => {
        const { data } = res;
        setTableData(data.results);
        setTotalCount(data.count);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleSubmit = () => {
    createSkybotRun({
      date_initial: selectedDate[0],
      date_final: selectedDate.length === 1 ? selectedDate[0] : selectedDate[1],
    })
      .then((response) => {
        const { id } = response.data;

        history.push(`/data-preparation/des/skybot/${id}`);
      })
      .catch(() => {
        setReload((prevState) => !prevState);
        setDisableSubmit(false);
      });
  };

  const transitionSnackBar = (props) => <Slide {...props} direction="left" />;

  const handleSelectRunClick = () => {
    setSnackBarVisible(true);
    setSnackBarTransition(() => transitionSnackBar);
    setDisableSubmit(true);
    setLoading(true);
    handleSubmit();
  };

  const tableColumns = [
    {
      name: 'id',
      title: 'Details',
      width: 110,
      icon: <InfoOutlinedIcon />,
      action: (row) => history.push(`/data-preparation/des/skybot/${row.id}`),
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
      name: 'owner',
      title: 'Owner',
      width: 180,
      align: 'left',
    },
    {
      name: 'date_initial',
      title: 'Initial Date',
      width: 130,
      align: 'left',
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
      align: 'left',
      customElement: (row) => (
        <span title={moment(row.finish).format('HH:mm:ss')}>
          {row.date_final}
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

  const { vertical, horizontal } = snackBarPosition;

  const Plot = createPlotlyComponent(Plotly);

  // Reload data if we have any Skybot job running,
  // so we can follow its progress in real time.
  useInterval(() => {
    const hasStatusRunning =
      tableData.filter((row) => row.status === 'running').length > 0;

    if (hasStatusRunning) {
      setReload(!reload);
    }
  }, 30000);

  const renderExposurePlot = () => {
    if (exposuresByPeriod.length > 0) {
      return (
        <>
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
          <CalendarHeatmap data={exposuresByPeriod} />
        </>
      );
    }
    return (
      <>
        <Skeleton variant="rect" animation={false} height={440} />
        {/* {exposurePlotLoading.loading ? (
          <CircularProgress color="primary" size={24} />
        ) : null} */}
        {exposurePlotLoading.loading === false &&
        exposurePlotLoading.hasData === false ? (
          <span>No exposure was found in this period</span>
        ) : null}
      </>
    );
  };

  return (
    <Grid>
      <Grid container spacing={2} alignItems="stretch">
        <Grid item xs={12} md={6} lg={4} xl={3}>
          <Card>
            <CardHeader title="Skybot Run" />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <DateRangePicker
                    // First day of Skybot:
                    minDate={new Date('2012-11-10 04:09')}
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    disabled={disableSubmit}
                    onClick={handleSelectRunClick}
                  >
                    Submit
                    {loading ? (
                      <CircularProgress color="primary" size={24} />
                    ) : null}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={8} xl={9}>
          <Card>
            <CardHeader title="Unique Exposures By Period" />
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
                loading
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Snackbar
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
};

export default Skybot;
