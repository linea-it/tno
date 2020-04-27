import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Grid,
  Card,
  CardHeader,
  CardContent,
  Icon,
  Button,
} from '@material-ui/core';
import { withRouter } from 'react-router';
import moment from 'moment';
import List from '../../components/List';
import Table from '../../components/Table';
import Donut from '../../components/Chart/Donut';
import ColumnStatus from '../../components/Table/ColumnStatus';
import {
  getSkybotRunById,
  getStatistic,
  getSkybotRunResults,
  stopSkybotRunById,
} from '../../services/api/Skybot';

function SkybotDetail({ setTitle, match, history }) {
  const { id } = match.params;
  const [skybotRunDetailList, setSkybotRunDetailList] = useState([]);
  const [timeProfile, setTimeProfile] = useState([]);
  const [skybotDetailTableData, setSkybotDetailTableData] = useState([]);
  const [
    skybotDetailTableTotalCount,
    setSkybotDetailTableTotalCount,
  ] = useState(0);
  const [currentSkybotRunStatus, setCurrentSkybotRunStatus] = useState('');

  const skybotDetailTableColumns = [
    {
      name: 'ccd_time',
      title: 'Details',
      width: 100,
      icon: <i className="fas fa-info-circle" />,
      action: (row) => history.push(`/skybot/${id}/asteroid/${row.expnum}`),
      align: 'center',
      sortingEnabled: false,
    },
    {
      name: 'status',
      title: 'Status',
      align: 'center',
      sortingEnabled: false,
      customElement: (row) => (
        <ColumnStatus status={row.status} title={row.error_msg} />
      ),
      width: 140,
    },
    {
      name: 'expnum',
      title: 'Exp Num',
      sortingEnabled: false,
      width: 100,
      align: 'right',
      headerTooltip: 'Exposure Number',
    },
    {
      name: 'band',
      title: 'Band',
      sortingEnabled: false,
      width: 70,
      align: 'center',
    },
    {
      name: 'date_obs',
      title: 'Obs Date',
      sortingEnabled: false,
      customElement: (el) => (
        <span>
          {el.date_obs ? moment(el.date_obs).format('YYYY-MM-DD') : ''}
        </span>
      ),
      headerTooltip: 'Observation Date',
      align: 'center',
    },
    {
      name: 'execution_time',
      title: 'Exec Time ',
      headerTooltip: 'Execution time',
      sortingEnabled: false,
      width: 150,
      align: 'right',
    },
    {
      name: 'count_rows',
      title: 'Skybot Rows',
      sortingEnabled: false,
      align: 'right',
    },
    {
      name: 'created',
      title: 'Created',
      sortingEnabled: false,
      align: 'right',
    },
    {
      name: 'updated',
      title: 'Updated',
      sortingEnabled: false,
      width: 100,
      align: 'right',
    },
    {
      name: 'ccd_count_rows',
      title: 'Inside CCD',
      sortingEnabled: false,
      width: 100,
      align: 'right',
      headerTooltip: 'Objects inside CCD',
    },
  ];

  const handleBackNavigation = () => history.push('/skybot');

  const loadSkybotDetailSummary = () => {
    getSkybotRunById({ id }).then((res) => {
      setCurrentSkybotRunStatus(res.status);
      setSkybotRunDetailList([
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
          value: res.start,
        },
        {
          title: 'Execution',
          value: res.h_execution_time,
        },
        {
          title: 'Pointings',
          value: res.exposure,
        },
        {
          title: 'Type',
          value: res.type_run,
        },
      ]);
    });
  };

  const loadSkybotDetailExecutionTime = () => {
    getStatistic({ id }).then((res) => {
      setTimeProfile([
        {
          name: 'Download ',
          value: res.download_time,
        },
        {
          name: 'Import',
          value: res.import_time,
        },
        {
          name: 'Associate CCD',
          value: res.ccd_time,
        },
      ]);
    });
  };

  const loadSkybotDetailTableData = ({ currentPage, pageSize }) => {
    getSkybotRunResults({
      id,
      page: currentPage + 1,
      pageSize,
    }).then((res) => {
      setSkybotDetailTableTotalCount(res.totalCount);
      setSkybotDetailTableData(res.data);
    });
  };

  const clearData = () => {
    setTimeProfile([]);
    setSkybotDetailTableData([]);
    setSkybotDetailTableTotalCount(0);
  };

  const handleStopRun = () => {
    stopSkybotRunById(id).then(() => {
      clearData();
      loadSkybotDetailSummary();
      loadSkybotDetailExecutionTime();
      loadSkybotDetailTableData({ currentPage: 0, pageSize: 10 });
    });
  };

  useEffect(() => {
    setTitle('Skybot Run');
    loadSkybotDetailSummary();
    loadSkybotDetailExecutionTime();
  }, []);

  return (
    <>
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
                <Icon className="fas fa-undo" />
                <span>Back</span>
              </Button>
            </Grid>
            {currentSkybotRunStatus === 'running' ? (
              <Grid item>
                <Button
                  variant="contained"
                  color="secondary"
                  title="Stop"
                  onClick={handleStopRun}
                >
                  <Icon className="fas fa-stop" />
                  <span>Stop</span>
                </Button>
              </Grid>
            ) : null}
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Card>
                <CardHeader title="Summary" />
                <CardContent>
                  <List data={skybotRunDetailList} />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={8}>
              <Card>
                <CardHeader title="Execution Time" />
                <CardContent>
                  <Donut data={timeProfile} height={315} />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Card>
                <CardHeader title="Skybot Results by Pointings" />
                <CardContent>
                  <Table
                    columns={skybotDetailTableColumns}
                    data={skybotDetailTableData}
                    totalCount={skybotDetailTableTotalCount}
                    loadData={loadSkybotDetailTableData}
                    hasSearching={false}
                    loading
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}

SkybotDetail.propTypes = {
  setTitle: PropTypes.func.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};

export default withRouter(SkybotDetail);
