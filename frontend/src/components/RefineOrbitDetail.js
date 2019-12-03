import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';
import {
  Grid, Card, makeStyles, CardHeader, CardContent,
} from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import clsx from 'clsx';
import DescriptionIcon from '@material-ui/icons/Description';
import ListIcon from '@material-ui/icons/List';
import BugIcon from '@material-ui/icons/BugReport';
import Toolbar from '@material-ui/core/Toolbar';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import moment from 'moment';
import CustomList from './utils/CustomList';
import {
  getOrbitRunById,
  getOrbitRunTimeProfile,
  getAsteroids,
  getAsteroidLog,
} from '../api/Orbit';
import { Donut, TimeProfile } from './utils/CustomChart';
import CustomTable from './utils/CustomTable';
import CustomDialog from './utils/CustomDialog';
import CustomLog from './utils/CustomLog';

const useStyles = makeStyles((theme) => ({
  button: {
    margin: theme.spacing(1),
  },
  buttonIcon: {
    margin: '0 2px',
  },
  btn: {
    textTransform: 'none',
    padding: '1px 5px',
    width: '7em',
    minHeight: '1em',
    display: 'block',
    textAlign: 'center',
    lineHeight: '2',
    boxShadow: `0px 1px 5px 0px rgba(0, 0, 0, 0.2),
    0px 2px 2px 0px rgba(0, 0, 0, 0.14),
    0px 3px 1px -2px rgba(0, 0, 0, 0.12)`,
    borderRadius: '4px',
    boxSizing: 'border-box',
  },
  btnSuccess: {
    backgroundColor: '#009900',
    color: '#fff',
  },
  btnFailure: {
    backgroundColor: '#ff1a1a',
    color: '#fff',
  },
  btnRunning: {
    backgroundColor: '#0099ff',
    color: '#000',
  },
  btnNotExecuted: {
    backgroundColor: '#ABA6A2',
    color: '#fff',
  },
  btnWarning: {
    backgroundColor: '#D79F15',
    color: '#FFF',
  },
  block: {
    marginBottom: 15,
  },
  iconDetail: {
    fontSize: 18,
  },
  logToolbar: {
    backgroundColor: '#F1F2F5',
    color: '#454545',
  },
  logBody: {
    backgroundColor: '#1D4455',
    color: '#FFFFFF',
  },
  tableWrapper: {
    maxWidth: '100%',
  },
  toggleButtonTableWrapper: {
    textAlign: 'right',
    width: '100%',
    display: 'block',
  },
}));


function RefineOrbitDetail({ history, match, setTitle }) {
  const classes = useStyles();

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
      icon: <Icon className={clsx(`fas fa-info-circle ${classes.iconDetail}`)} />,
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
      customElement: (row) => {
        if (row.status === 'failure') {
          return (
            <span
              className={clsx(classes.btn, classes.btnFailure)}
              title={row.error_msg}
            >
              Failure
            </span>
          );
        } if (row.status === 'running') {
          return (
            <span
              className={clsx(classes.btn, classes.btnRunning)}
              title={row.status}
            >
              Running
            </span>
          );
        } if (row.status === 'not_executed') {
          return (
            <span
              className={clsx(classes.btn, classes.btnNotExecuted)}
              title={row.error_msg}
            >
              Not Executed
            </span>
          );
        } if (row.status === 'warning') {
          return (
            <span
              className={clsx(classes.btn, classes.btnWarning)}
              title={row.error_msg ? row.error_msg : 'Warning'}
            >
              Warning
            </span>
          );
        }

        return (
          <span
            className={clsx(classes.btn, classes.btnSuccess)}
            title={row.status}
          >
            Success
          </span>
        );
      },
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
      title: 'Execution Time',
      align: 'center',
      customElement: (row) => (
        <span>
          {row.execution_time ? moment.utc(row.execution_time * 1000).format('HH:mm:ss') : ""}
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
          value: () => {
            if (data.status === 'failure') {
              return (
                <span
                  className={clsx(classes.btn, classes.btnFailure)}
                  title={data.error_msg}
                >
                  Failure
                </span>
              );
            } if (data.status === 'running') {
              return (
                <span
                  className={clsx(classes.btn, classes.btnRunning)}
                  title={data.status}
                >
                  Running
                </span>
              );
            } if (data.status === 'not_executed') {
              return (
                <span
                  className={clsx(classes.btn, classes.btnNotExecuted)}
                  title={data.error_msg}
                >
                  Not Executed
                </span>
              );
            } if (data.status === 'warning') {
              return (
                <span
                  className={clsx(classes.btn, classes.btnWarning)}
                  title={data.error_msg ? data.error_msg : 'Warning'}
                >
                  Warning
                </span>
              );
            }

            return (
              <span
                className={clsx(classes.btn, classes.btnSuccess)}
                title={data.status}
              >
                Success
              </span>
            );
          },
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
        { name: 'Not Executed', value: data.count_not_executed, color: '#ABA6A2' },
      ]);
    });
    getOrbitRunTimeProfile({ id }).then((res) => setTimeProfile(res));
  }, []);

  const loadTableData = async ({
    sorting, pageSize, currentPage, filter, searchValue,
  }) => {
    const ordering = sorting[0].direction === 'desc' ? `-${sorting[0].columnName}` : sorting[0].columnName;
    const asteroids = await getAsteroids({
      ordering,
      pageSize,
      page: currentPage !== 0 ? currentPage + 1 : 1,
      filters: [{
        property: 'orbit_run',
        value: id,
      }, ...filter],
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
      <Grid
        container
        justify="space-between"
        alignItems="center"
        spacing={2}
      >
        <Grid item xs={12} md={4}>
          <Button
            variant="contained"
            color="primary"
            title="Back"
            className={classes.button}
            onClick={handleBackNavigation}
          >
            <Icon className={clsx('fas', 'fa-undo', classes.buttonIcon)} />
            <span>Back</span>
          </Button>
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6} xl={timeProfile.length > 0 ? 4 : 6} className={classes.block}>
          <Card>
            <CardHeader title={listTitle} />
            <CardContent>
              <CustomList data={list} />
            </CardContent>
          </Card>
        </Grid>


        <Grid item xs={12} md={6} xl={timeProfile.length > 0 ? 4 : 6} className={classes.block}>
          <Card>
            <CardHeader title="Execution Statistics" />
            <CardContent>
              <Donut
                width={400}
                height={315}
                data={donutData}
              />
            </CardContent>
          </Card>
        </Grid>

        {timeProfile.length > 0 ? (
          <Grid item xs={12} xl={4} className={classes.block}>
            <Card>
              <CardHeader
                title="Execution Time"
              />
              <CardContent>
                <TimeProfile
                  height={315}
                  data={timeProfile}
                />
              </CardContent>
            </Card>
          </Grid>
        ) : null}
      </Grid>

      <Grid container spacing={2}>
        <Grid item lg={12} className={clsx(classes.block, classes.tableWrapper)}>
          <Card>
            <CardHeader title="Asteroids" />
            <CardContent>
              <Toolbar>
                <ToggleButtonGroup
                  className={classes.toggleButtonTableWrapper}
                  value={toggleButton}
                  onChange={handleToggleButton}
                  exclusive
                >
                  <ToggleButton
                    value={0}
                  >
                    <ListIcon />
                  </ToggleButton>
                  <ToggleButton
                    value={1}
                  >
                    <BugIcon />
                  </ToggleButton>
                </ToggleButtonGroup>
              </Toolbar>
              <CustomTable
                columns={toggleButton === 0 ? columnsList : columnsBug}
                data={tableData}
                loadData={loadTableData}
                pageSizes={pageSizes}
                totalCount={totalCount}
                defaultSorting={[{ columnName: 'name', direction: 'desc' }]}
                hasResizing={false}
                loading={true}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <CustomDialog
        maxWidth="md"
        visible={asteroidLog.visible}
        setVisible={handleDialogClose}
        title="NIMA Log"
        content={<CustomLog data={asteroidLog.data} />}
        headerStyle={classes.logToolbar}
        bodyStyle={classes.logBody}
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
