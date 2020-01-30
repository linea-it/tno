import React, { useEffect, useRef, useState } from 'react';
import { withRouter } from 'react-router-dom';
import {
  Grid, Card, CardHeader, makeStyles,
} from '@material-ui/core';
import clsx from 'clsx';
import Toolbar from '@material-ui/core/Toolbar';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import ListIcon from '@material-ui/icons/List';
import BugIcon from '@material-ui/icons/BugReport';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import DescriptionIcon from '@material-ui/icons/Description';
import Tooltip from '@material-ui/core/Tooltip';
import Button from '@material-ui/core/Button';
import PropTypes from 'prop-types';
import CustomLog from './utils/CustomLog';
import CustomDialog from './utils/CustomDialog';
import {
  readCondorFile, getPraiaRunById, getExecutionTimeById, getAsteroidStatus, getAsteroids,
} from '../api/Praia';
import CustomTable from './utils/CustomTable';
import { Donut } from './utils/CustomChart';
import ListStat from './utils/CustomList';
import Stepper from './AstrometryStepper';
import CustomColumnStatus from './utils/CustomColumnStatus';

const useStyles = makeStyles((theme) => ({
  card: {
    marginBottom: 10,
  },
  backIcon: {
    marginRight: 10,
  },
  icon: {
    marginLeft: '92%',
  },
  backButton: {
    margin: theme.spacing(1),
  },
  iconDetail: {
    fontSize: 18,
  },
  dialogBodyStyle: {
    backgroundColor: '#1D4455',
    color: '#FFFFFF',
    border: 'none',
    height: 600,
    width: 600,
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

function AstrometryDetail({ history, setTitle, match: { params } }) {
  const classes = useStyles();

  const [list, setList] = useState([]);
  const [executionTime, setExecutionTime] = useState(null);
  const [executionStats, setExecutionStats] = useState(null);
  const [donutDataStatist, setDonutDataStatist] = useState([]);
  const [donutDataExecutionTime, setDonutDataExecutionTime] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [toggleBug, setToggleBug] = useState('list');
  const [runData, setRunData] = useState();
  const [dialog, setDialog] = useState({
    visible: false,
    content: [],
    title: '',
  });
  const [totalCount, setTotalCount] = useState(0);
  const [reload, setReload] = useState(true);

  const runId = params.id;

  const loadPraiaRun = () => {
    getPraiaRunById({ id: runId }).then((res) => {
      const data = res;
      setRunData(res);
      setList([
        {
          title: 'Status',
          value: () => <CustomColumnStatus status={data.status} title={data.error_msg} />,
        },
        { title: 'Process', value: data.id },
        { title: 'Process Name', value: data.input_displayname },
        { title: 'Owner', value: data.owner },
        { title: 'Start', value: data.h_time },
        { title: 'Execution', value: data.h_execution_time },
        { title: 'Asteroids', value: data.count_objects },
        { title: 'Reference Catalog', value: data.catalog_name },
      ]);
    });
  };

  const loadExecutionTime = () => {
    getExecutionTimeById({ id: params.id }).then((res) => {
      setExecutionTime(res.execution_time);
    });
  };

  const loadExecutionStatistics = () => {
    getAsteroidStatus({ id: params.id }).then((res) => {
      setExecutionStats(res.status);
    });
  };


  const loadTableData = async ({
    pageSize, currentPage, searchValue,
  }) => {
    const asteroids = await getAsteroids({
      sizePerPage: pageSize,
      page: currentPage !== 0 ? currentPage + 1 : 1,
      filters: [{
        property: 'astrometry_run',
        value: runId,
      }],
      search: searchValue,
    });

    if (asteroids && asteroids.results) {
      setTableData(asteroids.results);
      setTotalCount(asteroids.count);
    }
  };

  const handleAsteroidDetail = (row) => history.push(`/astrometry/asteroid/${row.id}`);


  const handleLogReading = (file) => {
    if (file && typeof file !== 'undefined') {
      const arrayLines = [];

      readCondorFile(file).then((res) => {
        const data = res.rows;
        if (res.success) {
          data.forEach((line, idx) => {
            arrayLines.push(<div key={idx}>{line}</div>);
          });
        } else {
          arrayLines.push(<div key={0}>{res.msg}</div>);
        }
        setDialog({ content: data, visible: true, title: `${file} ` });
      });
    }
  };

  const listColumnsTable = [
    {
      name: 'id',
      title: 'Details',
      icon: <Icon className={clsx(`fas fa-info-circle ${classes.iconDetail}`)} />,
      action: handleAsteroidDetail,
      width: 100,
      align: 'center',
      sortingEnabled: false,
    },
    {
      name: 'status',
      title: 'Status',
      align: 'center',
      width: 130,
      customElement: (row) => <CustomColumnStatus status={row.status} title={row.error_msg} />,
      sortingEnabled: false,
    },
    {
      name: 'name',
      title: 'Obj Name',
      align: 'left',
      width: 100,
      headerTooltip: 'Object Name',
      sortingEnabled: false,
    },
    {
      name: 'number',
      title: 'Obj Num',
      align: 'center',
      headerTooltip: 'Object Number',
      sortingEnabled: false,
    },
    {
      name: 'ccd_images',
      title: 'CCD Images',
      width: 120,
      align: 'center',
      sortingEnabled: false,
    },
    {
      name: 'available_ccd_image',
      title: 'Available CCDs',
      width: 140,
      align: 'right',
      sortingEnabled: false,
    },
    {
      name: 'processed_ccd_image',
      title: 'Proc CCDs',
      headerTooltip: 'Processed CCDs',
      width: 150,
      align: 'right',
      sortingEnabled: false,
    },
    {
      name: 'catalog_rows',
      title: 'Stars',
      align: 'right',
      sortingEnabled: false,
    },
    {
      name: 'outputs',
      title: 'Output Files',
      align: 'right',
      sortingEnabled: false,
    },
    {
      name: 'execution_time',
      title: 'Exec Time',
      headerTooltip: 'Execution time',
      customElement: (row) => (row.execution_time ? row.execution_time.split('.')[0] : ''),
      width: 140,
      align: 'center',
      sortingEnabled: false,
    },
  ];

  const bugColumnsTable = [
    {
      name: 'id',
      title: 'Details',
      width: 100,
      align: 'center',
      icon: <Icon className={clsx(`fas fa-info-circle ${classes.iconDetail}`)} />,
      action: handleAsteroidDetail,
      sortingEnabled: false,
    },
    {
      name: 'status',
      title: 'Status',
      align: 'center',
      width: 130,
      customElement: (row) => <CustomColumnStatus status={row.status} title={row.error_msg} />,
      sortingEnabled: false,
    },
    {
      name: 'name',
      title: 'Name',
      align: 'left',
      width: 100,
      headerTooltip: 'Object Name',
      sortingEnabled: false,
    },
    {
      name: 'number',
      title: 'Num',
      align: 'center',
      width: 100,
      headerTooltip: 'Object Number',
      sortingEnabled: false,
    },
    {
      name: 'error_msg',
      title: 'Error',
      align: 'left',
      width: 360,
      sortingEnabled: false,
    },
    {
      name: 'condor_log',
      title: 'Log',
      width: 80,
      align: 'center',
      customElement: (row) => (
        <Tooltip title="Condor Log">
          <IconButton
            onClick={() => handleLogReading(row.condor_log)}
            style={{ padding: 0 }} // ! Button style was compromising the ultimate layout
          >
            <DescriptionIcon />
          </IconButton>
        </Tooltip>
      ),
      sortingEnabled: false,
    },
    {
      name: 'condor_err_log',
      title: 'Error',
      width: 80,
      align: 'center',
      customElement: (row) => (
        <Tooltip title="Condor Error">
          <IconButton
            onClick={() => handleLogReading(row.condor_err_log)}
            style={{ padding: 0 }} // ! Button style was compromising the ultimate layout
          >
            <DescriptionIcon />
          </IconButton>
        </Tooltip>
      ),
      sortingEnabled: false,
    },
    {
      name: 'condor_out_log',
      title: 'Output',
      width: 80,
      align: 'center',
      customElement: (row) => (
        <Tooltip title="Condor Output">
          <IconButton
            onClick={() => handleLogReading(row.condor_out_log)}
            style={{ padding: 0 }} // ! Button style was compromising the ultimate layout
          >
            <DescriptionIcon />
          </IconButton>
        </Tooltip>
      ),
      sortingEnabled: false,
    },
  ];

  useEffect(() => {
    setTitle('Astrometry Run');
    loadPraiaRun();
    loadExecutionTime();
    loadExecutionStatistics();
    setReload(!reload);
  }, []);

  useInterval(() => {
    setReload(!reload);
    loadPraiaRun();
    loadExecutionTime();
    loadExecutionStatistics();
  }, 30000);

  useEffect(() => {
    if (executionStats) {
      setDonutDataStatist([
        { name: 'Success', value: Number(executionStats.success), color: '#009900' },
        { name: 'Warning', value: Number(executionStats.warning), color: '#D79F15' },
        { name: 'Failure', value: Number(executionStats.failure), color: '#ff1a1a' },
        { name: 'Not Executed', value: Number(executionStats.not_executed), color: '#ABA6A2' },
        { name: 'Running/Idle', value: Number(executionStats.pending), color: '#0099ff' },
      ]);
    }
  }, [executionStats]);

  useEffect(() => {
    if (executionTime) {
      setDonutDataExecutionTime([
        { name: 'Ccd Images', value: Number(executionTime.ccd_images) },
        { name: 'Bsp_Jpl', value: Number(executionTime.bsp_jpl) },
        { name: 'Catalog', value: Number(executionTime.catalog) },
        { name: 'Astrometry', value: Number(executionTime.astrometry) },
      ]);
    }
  }, [executionTime]);

  const handleChangetoggleBug = (event, newValue) => {
    setToggleBug(newValue);
  };


  const handleBackNabigation = () => {
    history.push('/astrometry');
  };

  return (
    <Grid>
      <Grid container spacing={2}>
        <Grid item xs={12} xl={12} md={12}>
          <Button
            variant="contained"
            color="primary"
            className={classes.backButton}
            onClick={handleBackNabigation}
          >
            <Icon className={clsx('fas', 'fa-undo', classes.backIcon)} />
            <span>Back</span>
          </Button>
        </Grid>

        <Grid item xs={12} md={6} xl={4}>
          <Card>
            <CardHeader
              title={`Astrometry - ${runId} `}
            />
            <ListStat
              data={list}
            />
          </Card>
        </Grid>
        {donutDataStatist.length > 0 ? (
          <Grid item xs={12} md={6} xl={4}>
            <Card className={classes.card}>
              <CardHeader
                title="Execution Statistics"
              />
              <Donut
                data={donutDataStatist}
              />
            </Card>
          </Grid>
        ) : null}

        {donutDataExecutionTime.length > 0 ? (
          <Grid item xs={12} md={6} xl={4}>
            <Card className={classes.card}>
              <CardHeader
                title="Execution Time"
              />
              <Donut
                data={donutDataExecutionTime}
                reload={reload}
              />
            </Card>
          </Grid>
        ) : null}
      </Grid>

      <Grid item xs={12}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={12} xl={12}>
            <Stepper activeStep={runData && typeof runData !== 'undefined' ? runData.step : 0} />
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={2}>
          <Grid item sm={12} xl={12}>
            <Card className={classes.card}>
              <CardHeader
                title="Asteroids"
              />
              <Toolbar>
                <ToggleButtonGroup
                  className={classes.icon}
                  value={toggleBug}
                  onChange={handleChangetoggleBug}
                  exclusive
                >
                  <ToggleButton
                    value="list"
                    onClick={() => setToggleBug('list')}
                  >
                    <ListIcon />
                  </ToggleButton>
                  <ToggleButton
                    value="bug"
                    onClick={() => setToggleBug('bug')}
                  >
                    <BugIcon />
                  </ToggleButton>
                </ToggleButtonGroup>
              </Toolbar>
              <CustomTable
                columns={toggleBug === 'list' ? listColumnsTable : bugColumnsTable}
                data={tableData}
                loadData={loadTableData}
                hasColumnVisibility={false}
                pageSizes={[10, 20, 30, 50]}
                pageSize={30}
                totalCount={totalCount}
                hasResizing={false}
                reload={reload}
              />
              <CustomDialog
                visible={dialog.visible}
                title={dialog.title}
                content={<CustomLog data={dialog.content} />}
                setVisible={() => setDialog({ visible: false, content: [], title: ' ' })}
                bodyStyle={classes.dialogBodyStyle}
              />
            </Card>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}

AstrometryDetail.propTypes = {
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

export default withRouter(AstrometryDetail);
