import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { useParams, useHistory } from 'react-router-dom';
import {
  Grid,
  Card,
  CardHeader,
  CardContent,
  Button,
  Icon,
  Tooltip,
  Toolbar,
} from '@material-ui/core';
import {
  List as ListIcon,
  BugReport as BugReportIcon,
} from '@material-ui/icons';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import List from '../../components/List';
import Table from '../../components/Table';
import Dialog from '../../components/Dialog';
import Log from '../../components/Log';
import ColumnStatus from '../../components/Table/ColumnStatus';
import Donut from '../../components/Chart/Donut';
import TimeProfile from '../../components/Chart/TimeProfile';
import {
  getPredictionRunById,
  getTimeProfile,
  getAsteroids,
} from '../../services/api/Prediction';

function PredictionOccultationDetail({ setTitle }) {
  const { id } = useParams();
  const history = useHistory();
  const [list, setList] = useState([]);
  const [statusDonutData, setStatusDonutData] = useState([]);
  const [executionTimeDonutData, setExecutionTimeDonutData] = useState([]);
  const [timeProfile, setTimeProfile] = useState({});
  const [tableData, setTableData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [toolButton, setToolButton] = useState('list');
  const [dialog, setDialog] = useState({
    content: [],
    visible: false,
    title: '',
  });

  const tableListArray = [
    {
      name: 'id',
      title: 'Details',
      width: 100,
      sortingEnabled: false,
      icon: (
        <Tooltip title="Details">
          <Icon className="fas fa-info-circle" />
        </Tooltip>
      ),
      action: (el) =>
        history.push(`/prediction-of-occultation/asteroid/${el.id}`),
      align: 'center',
    },
    {
      name: 'status',
      title: 'Status',
      width: 140,
      align: 'center',
      sortingEnabled: false,
      customElement: (row) => (
        <ColumnStatus status={row.status} title={row.error_msg} />
      ),
    },
    {
      name: 'name',
      title: 'Name',
      width: 180,
    },
    {
      name: 'number',
      title: 'Number',
      width: 140,
      sortingEnabled: false,
      align: 'right',
    },
    {
      name: 'occultations',
      title: 'Occultations',
      width: 140,
      align: 'right',
      sortingEnabled: false,
    },
    {
      name: 'execution_time',
      title: 'Exec Time',
      headerTooltip: 'Execution time',
      align: 'center',
      customElement: (row) => (
        <span>
          {row.execution_time
            ? moment.utc(row.execution_time * 1000).format('HH:mm:ss')
            : ''}
        </span>
      ),
      width: 140,
      sortingEnabled: false,
    },
  ];

  const [columnsTable, setColumnsTable] = useState(tableListArray);

  useEffect(() => {
    setTitle('Prediction of Occultations');
  }, [setTitle]);

  useEffect(() => {
    getPredictionRunById({ id }).then((data) => {
      setList([
        {
          title: 'Status',
          value: () => (
            <ColumnStatus status={data.status} title={data.error_msg} />
          ),
        },
        {
          title: 'Process',
          value: data.process_displayname,
        },
        {
          title: 'Owner',
          value: data.owner,
        },
        {
          title: 'Start',
          value: data.h_time,
        },
        {
          title: 'Execution',
          value: data.h_execution_time,
        },
        {
          title: 'Asteroids',
          value: data.count_objects,
        },
        {
          title: 'Occultations',
          value: data.occultations,
        },
      ]);

      setStatusDonutData([
        { name: 'Success', value: data.count_success, color: '#009900' },
        { name: 'Warning', value: data.count_warning, color: '#D79F15' },
        { name: 'Failure', value: data.count_failed, color: '#ff1a1a' },
        {
          name: 'Not Executed',
          value: data.count_not_executed,
          color: '#ABA6A2',
        },
      ]);

      setExecutionTimeDonutData([
        {
          name: 'Dates',
          value: Math.round(moment.duration(data.execution_dates).asSeconds()),
        },
        {
          name: 'Ephemeris',
          value: Math.round(
            moment.duration(data.execution_ephemeris).asSeconds()
          ),
        },
        {
          name: 'Gaia',
          value: Math.round(
            moment.duration(data.execution_catalog).asSeconds()
          ),
        },
        {
          name: 'Search Candidates',
          value: Math.round(
            moment.duration(data.execution_search_candidate).asSeconds()
          ),
        },
        {
          name: 'Maps',
          value: Math.round(moment.duration(data.execution_maps).asSeconds()),
        },
        {
          name: 'Register',
          value: Math.round(
            moment.duration(data.execution_register).asSeconds()
          ),
        },
      ]);
    });

    getTimeProfile({ id }).then((res) => {
      setTimeProfile(res);
    });
  }, [setTitle, id]);

  const bugLogArray = [
    {
      name: 'id',
      title: 'Details',
      width: 100,
      icon: (
        <Tooltip title="Details">
          <Icon className="fas fa-info-circle" />
        </Tooltip>
      ),
      action: (el) =>
        history.push(`/prediction-of-occultation/asteroid/${el.id}`),
      align: 'center',
      sortingEnabled: false,
    },
    {
      name: 'status',
      title: 'Status',
      width: 140,
      align: 'center',
      sortingEnabled: false,
      customElement: (row) => (
        <ColumnStatus status={row.status} title={row.error_msg} />
      ),
    },
    {
      name: 'name',
      title: 'Name',
      width: 180,
    },
    {
      name: 'number',
      title: 'Number',
      width: 140,
      sortingEnabled: false,
    },
    {
      name: 'error_msg',
      title: 'Error Message',
      width: 350,
      sortingEnabled: false,
    },
  ];

  const loadTableData = async ({
    sorting,
    pageSize,
    currentPage,
    filter,
    searchValue,
  }) => {
    const ordering =
      sorting[0].direction === 'desc'
        ? `-${sorting[0].columnName}`
        : sorting[0].columnName;

    const asteroids = await getAsteroids({
      ordering,
      pageSize,
      page: currentPage !== 0 ? currentPage + 1 : 1,
      // filters: [{
      //   property: 'orbit_run',
      //   value: id,
      // }].concat(filters),
      filters: [
        {
          property: 'predict_run',
          value: id,
        },
        ...filter,
      ],
      search: searchValue,
    });

    if (asteroids && asteroids.results) {
      setTableData(asteroids.results);
      setTotalCount(asteroids.count);
    }
  };

  const handleBackNavigation = () => history.push('/prediction-of-occultation');

  const handleChangeToolButton = (event, value) => {
    const columnToggleValue =
      value === 'list'
        ? setColumnsTable(tableListArray)
        : setColumnsTable(bugLogArray);
    setToolButton(columnToggleValue);
  };

  return (
    <>
      <Grid container justify="space-between" alignItems="center" spacing={2}>
        <Grid item xs={12} md={4}>
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
      </Grid>
      <Grid container spacing={2}>
        <Grid item xs={12} lg={6}>
          <Card>
            <CardHeader title="Summary" />
            <CardContent>
              <List data={list} />
            </CardContent>
          </Card>
        </Grid>
        {Object.entries(timeProfile).length > 0 ? (
          <Grid item xs={12} md={9}>
            <Card>
              <CardHeader title="Time Profile" />
              <CardContent>
                <TimeProfile width={773} height={363} data={timeProfile} />
              </CardContent>
            </Card>
          </Grid>
        ) : null}
      </Grid>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Status" />
            <CardContent>
              <Donut data={statusDonutData} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Execution Time" />
            <CardContent>
              <Donut data={executionTimeDonutData} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Asteroids" />
            <CardContent>
              <Toolbar>
                <ToggleButtonGroup
                  value={toolButton}
                  onChange={handleChangeToolButton}
                  exclusive
                >
                  <ToggleButton value="list">
                    <ListIcon />
                  </ToggleButton>
                  <ToggleButton value="bugLog">
                    <BugReportIcon />
                  </ToggleButton>
                </ToggleButtonGroup>
              </Toolbar>
              <Table
                columns={columnsTable}
                data={tableData}
                loadData={loadTableData}
                totalCount={totalCount}
                defaultSorting={[{ columnName: 'name', direction: 'desc' }]}
                hasResizing={false}
                reload
              />
            </CardContent>
          </Card>
        </Grid>
        <Dialog
          visible={dialog.visible}
          title={dialog.title}
          content={<Log data={dialog.content} />}
          setVisible={() =>
            setDialog({ visible: false, content: [], title: ' ' })
          }
        />
      </Grid>
    </>
  );
}

PredictionOccultationDetail.propTypes = {
  setTitle: PropTypes.func.isRequired,
};

export default PredictionOccultationDetail;
