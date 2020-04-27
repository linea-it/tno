import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';
import moment from 'moment';
import {
  Grid,
  Card,
  CardHeader,
  Icon,
  Toolbar,
  Button,
  CardContent,
} from '@material-ui/core';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import {
  Description as DescriptionIcon,
  List as ListIcon,
  BugReport as BugReportIcon,
} from '@material-ui/icons';
import List from '../../components/List';
import Donut from '../../components/Chart/Donut';
import TimeProfile from '../../components/Chart/TimeProfile';
import Table from '../../components/Table';
import Dialog from '../../components/Dialog';
import Log from '../../components/Log';
import ColumnStatus from '../../components/Table/ColumnStatus';
import {
  getOrbitRunById,
  getOrbitRunTimeProfile,
  getAsteroids,
  getAsteroidLog,
} from '../../services/api/Orbit';

function RefineOrbitDetail({ history, match, setTitle }) {
  const { id } = match.params;
  const [listTitle, setListTitle] = useState([]);
  const [list, setList] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [timeProfile, setTimeProfile] = useState([]);
  const [donutData, setDonutData] = useState([]);
  const [asteroidLog, setAsteroidLog] = useState({
    visible: false,
    data: [],
  });
  const [toggleButton, setToggleButton] = useState(0);
  const pageSizes = [5, 10, 15];
  const columnsList = [
    {
      name: 'id',
      title: 'Details',
      width: 100,
      icon: <Icon className="fas fa-info-circle" />,
      action: (el) => history.push(`/refine-orbit/asteroid/${el.id}`),
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
      align: 'right',
    },
    {
      name: 'h_execution_time',
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
    },
    {
      name: 'orbit_run',
      title: ' ',
      width: 100,
      icon: <DescriptionIcon />,
      action: (el) => {
        getAsteroidLog({ id: el.id }).then((res) => {
          if (res.success) {
            setAsteroidLog({
              visible: !asteroidLog.visible,
              data: res.lines,
            });
          } else {
            setAsteroidLog({
              visible: !asteroidLog.visible,
              data: [res.msg],
            });
          }
        });
      },
      align: 'center',
    },
  ];

  const columnsBug = [
    columnsList[0],
    columnsList[1],
    columnsList[2],
    columnsList[3],
    {
      name: 'error_msg',
      title: 'Error Message',
      width: 260,
    },
    columnsList[4],
    columnsList[5],
  ];

  useEffect(() => {
    setTitle('Refine Orbit');
    getOrbitRunById({ id }).then((data) => {
      setListTitle(data.input_displayname);
      setList([
        {
          title: 'Status',
          value: () => (
            <ColumnStatus status={data.status} title={data.error_msg} />
          ),
        },
        {
          title: 'Process',
          value: data.proccess_displayname,
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
      ]);

      setDonutData([
        { name: 'Success', value: data.count_success, color: '#009900' },
        { name: 'Warning', value: data.count_warning, color: '#D79F15' },
        { name: 'Failure', value: data.count_failed, color: '#ff1a1a' },
        {
          name: 'Not Executed',
          value: data.count_not_executed,
          color: '#ABA6A2',
        },
      ]);
    });
    getOrbitRunTimeProfile({ id }).then((res) => setTimeProfile(res));
  }, []);

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
      filters: [
        {
          property: 'orbit_run',
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

  const handleDialogClose = () => setAsteroidLog({ visible: false, data: [] });

  const handleBackNavigation = () => history.push('/refine-orbit');

  const handleToggleButton = (e, value) => setToggleButton(value);

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
        <Grid item xs={12} md={6} xl={timeProfile.length > 0 ? 4 : 6}>
          <Card>
            <CardHeader title={listTitle} />
            <CardContent>
              <List data={list} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} xl={timeProfile.length > 0 ? 4 : 6}>
          <Card>
            <CardHeader title="Execution Statistics" />
            <CardContent>
              <Donut width={400} height={315} data={donutData} />
            </CardContent>
          </Card>
        </Grid>

        {timeProfile.length > 0 ? (
          <Grid item xs={12} xl={4}>
            <Card>
              <CardHeader title="Execution Time" />
              <CardContent>
                <TimeProfile height={315} data={timeProfile} />
              </CardContent>
            </Card>
          </Grid>
        ) : null}
      </Grid>

      <Grid container spacing={2}>
        <Grid item lg={12}>
          <Card>
            <CardHeader title="Asteroids" />
            <CardContent>
              <Toolbar>
                <ToggleButtonGroup
                  value={toggleButton}
                  onChange={handleToggleButton}
                  exclusive
                >
                  <ToggleButton value={0}>
                    <ListIcon />
                  </ToggleButton>
                  <ToggleButton value={1}>
                    <BugReportIcon />
                  </ToggleButton>
                </ToggleButtonGroup>
              </Toolbar>
              <Table
                columns={toggleButton === 0 ? columnsList : columnsBug}
                data={tableData}
                loadData={loadTableData}
                pageSizes={pageSizes}
                totalCount={totalCount}
                defaultSorting={[{ columnName: 'name', direction: 'desc' }]}
                hasResizing={false}
                loading
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Dialog
        maxWidth="md"
        visible={asteroidLog.visible}
        setVisible={handleDialogClose}
        title="NIMA Log"
        content={<Log data={asteroidLog.data} />}
      />
    </>
  );
}

RefineOrbitDetail.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  setTitle: PropTypes.func.isRequired,
};

export default withRouter(RefineOrbitDetail);
