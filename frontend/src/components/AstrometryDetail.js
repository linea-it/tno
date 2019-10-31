import React, { useEffect, useState } from 'react';
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
import ReactInterval from 'react-interval';
import Tooltip from '@material-ui/core/Tooltip';
import CircularProgress from '@material-ui/core/CircularProgress';
import CheckIcon from '@material-ui/icons/Check';
import WarningIcon from '@material-ui/icons/PriorityHigh';
import ClearIcon from '@material-ui/icons/Clear';
import CustomLog from './utils/CustomLog';
import Dialog from './utils/CustomDialog';
import {
  readCondorFile, getPraiaRunById, getExecutionTimeById, getAsteroidStatus, getAsteroids,
} from '../api/Praia';
import Table from './utils/CustomTable';
import { Donut } from './utils/CustomChart';
import ListStat from './utils/CustomList';
import Stepper from './AstrometryStepper';

const useStyles = makeStyles({
  card: {
    marginBottom: 10,
  },
  icon: {
    marginLeft: '92%',
  },
  progress: {
    marginTop: 6,
    float: 'left',
  },
  checkIcon: {
    float: 'left',
    marginTop: 1,
  },
  warningIcon: {
    float: 'left',
    marginTop: 1,
  },
  failureIcon: {
    float: 'left',
    marginTop: 1,
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
    backgroundColor: '#ffba01',
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
});

function AstrometryDetail({ history, setTitle, match: { params } }) {
  const classes = useStyles();

  const [list, setList] = useState([]);
  const [executionTime, setExecutionTime] = useState({});
  const [execution_stats, setExecution_stats] = useState({});
  const [tableData, setTableData] = useState([]);
  const [columnsAsteroidTable, setColumnsAsteroidTable] = useState('list');
  const [toolButton, setToolButton] = useState('list');
  const [reload_interval, setReloadInterval] = useState(1);
  const [interval_condition, setIntervalCondition] = useState(true);
  const [count, setCount] = useState(0.5);
  const [runData, setRunData] = useState();
  const [dialog, setDialog] = useState({
    visible: false,
    content: [],
    title: ' ',
  });
  const [tableParams, setTableParams] = useState({
    page: 1,
    sizePerPage: 10,
    sortField: 'name',
    sortOrder: 1,
    pageSizes: [10, 20, 30],
    reload: true,
    totalCount: null,
  });

  const runId = params.id;

  const loadPraiaRun = () => {
    getPraiaRunById({ id: runId }).then((res) => {
      const data = res;
      setRunData(res);
      setList([
        {
          title: 'Status',
          value: () => {
            if (data.status === 'failure') {
              return (
                <span
                  className={clsx(classes.btn, classes.btnFailure)}
                  title={data.error_msg ? data.error_msg : "Failure"}
                >
                  Failure
                </span>
              );
            }
            if (data.status === 'running') {
              return (
                <span
                  className={clsx(classes.btn, classes.btnRunning)}
                  title={data.error_msg}
                >
                  Running
                </span>
              );
            }
            if (data.status === 'not_executed') {
              return (
                <span
                  className={clsx(classes.btn, classes.btnNotExecuted)}
                  title={data.error_msg}
                >
                  Not Executed
                </span>
              );
            }
            if (data.status === 'warning') {
              return (
                <span
                  className={clsx(classes.btn, classes.btnWarning)}
                  title={data.error_msg ? data.error_msg : "Warning"}
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
      setExecution_stats(res.status);
    });
  };

  const loadTableData = () => {
    const { page } = tableParams;
    const { sizePerPage } = tableParams;
    const { sortField } = tableParams;
    const { sortOrder } = tableParams;
    const { searchValue } = tableParams;
    const filters = [];
    filters.push({
      property: 'astrometry_run',
      value: runId,
    });
    getAsteroids({
      page, sizePerPage, filters, sortField, sortOrder, search: searchValue,
    }).then((res) => {
      setTableData(res.results);
      setTableParams({ ...tableParams, totalCount: res.count });
    });
  };

  const handleAsteroidDetail = (row) => history.push(`/astrometry/asteroid/${row.id}`);

  const listColumnsTable = [
    {
      name: 'status',
      title: 'Status',
      align: 'center',
      width: 130,
      customElement: (row) => {
        if (row.status === 'warning') {
          return (
            <span
              className={clsx(classes.btn, classes.btnWarning)}
              title={row.error_msg}
            >
              Warning
            </span>
          );
        }
        if (row.status === 'running') {
          return (
            <span
              className={clsx(classes.btn, classes.btnRunning)}
              title={row.status}
            >
              Running
            </span>
          );
        }
        if (row.status === 'failure') {
          return (
            <span
              className={clsx(classes.btn, classes.btnFailure)}
              title={row.error_msg}
            >
              Failure
            </span>
          );
        }
        if (row.status === 'not_executed') {
          return (
            <span
              className={clsx(classes.btn, classes.btnNotExecuted)}
              title={row.status}
            >
              Not Executed
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
      name: "name",
      title: "Name",
      align: 'left',
    },
    {
      name: 'number',
      title: 'Number',
      align: 'center',
      customElement: (row) => {
        if (row.number === '-') {
          return ' ';
        }
        return (
          <span>
            {row.number}
          </span>
        );
      },
    },
    {
      name: 'ccd_images',
      title: 'CCD Images',
      align: 'center',
      width: 120,
      customElement: (row) => {
        if (row.ccd_images === '-') {
          return '';
        }
        return (
          <span>
            {row.ccd_images}
          </span>
        );
      },
    },
    {
      name: 'available_ccd_image',
      title: 'Available CCDs',
      width: 140,
      align: 'center',
    },
    {
      name: 'processed_ccd_image',
      title: 'Processed CCDs',
      width: 150,
      align: 'center',
    },
    { name: 'catalog_rows', title: 'Stars', align: 'center' },
    { name: 'outputs', title: 'Output Files', align: 'center' },
    {
      name: 'execution_time',
      title: 'Execution Time',
      customElement: (row) => (
        <span>
          {row.execution_time.substring(0, 8)}
        </span>
      ),
      width: 140,
      align: 'center',
    },
    {
      name: 'id',
      title: ' ',
      icon: <Icon className={clsx(`fas fa-info-circle ${classes.iconDetail}`)} />,
      action: handleAsteroidDetail,
    },
  ];

  const bugColumnsTable = [
    {
      name: 'status',
      title: 'Status',
      align: 'center',
      width: 130,
      customElement: (row) => {
        if (row.status === 'warning') {
          return (
            <span
              className={clsx(classes.btn, classes.btnWarning)}
              title={row.error_msg}
            >
              Warning
            </span>
          );
        }
        if (row.status === 'running') {
          return (
            <span
              className={clsx(classes.btn, classes.btnRunning)}
              title={row.status}
            >
              Running
            </span>
          );
        }
        if (row.status === 'failure') {
          return (
            <span
              className={clsx(classes.btn, classes.btnFailure)}
              title={row.error_msg}
            >
              Failure
            </span>
          );
        }
        if (row.status === 'not_executed') {
          return (
            <span
              className={clsx(classes.btn, classes.btnNotExecuted)}
              title={row.status}
            >
              Not Executed
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
      align: 'left',
    },
    {
      name: 'number',
      title: 'Number',
      align: 'center',
      width: 120,
      customElement: (row) => {
        if (row.number === '-') {
          return '';
        }
        return (
          <span>
            {row.number}
          </span>
        );
      },
    },
    {
      name: 'error_msg',
      title: 'Error',
      align: 'left',
      width: 360,
    },
    {
      name: 'condor_log',
      title: 'Log',
      width: 80,
      align: 'center',
      customElement: (row) => {
        return (
          <Tooltip title="Condor Log" >
            <IconButton onClick={() => handleLogReading(row.condor_log)}
              style={{ padding: 0 }}     //O estilo do próprio botão estava atrapalhando a interface
            >
              <DescriptionIcon />
            </IconButton>
          </Tooltip>
        );
      }
    },
    {
      name: 'condor_err_log',
      title: 'Error',
      width: 80,
      align: 'center',
      customElement: (row) => {
        return (
          <Tooltip title="Condor Error">
            <IconButton onClick={() => handleLogReading(row.condor_err_log)}
              style={{ padding: 0 }}     //O estilo do próprio botão estava atrapalhando a interface
            >
              <DescriptionIcon />
            </IconButton>
          </Tooltip>
        );
      }
    },
    {
      name: 'condor_out_log',
      title: 'Output',
      width: 80,
      align: 'center',
      customElement: (row) => {
        return (
          <Tooltip title="Condor Output">
            <IconButton onClick={() => handleLogReading(row.condor_out_log)}
              style={{ padding: 0 }}     //O estilo do próprio botão estava atrapalhando a interface
            >
              <DescriptionIcon />
            </IconButton>
          </Tooltip>
        );
      }
    },
    {
      name: "id",
      title: " ",
      width: 80,
      align: 'center',
      icon: <Icon className={clsx(`fas fa-info-circle ${classes.iconDetail}`)} />,
      action: handleAsteroidDetail,
    },
  ];

  useEffect(() => {
    setTitle('Astrometry Run');
    loadTableData();
    loadPraiaRun();
    loadExecutionTime();
    loadExecutionStatistics();
  }, []);

  useEffect(() => {
    setColumnsAsteroidTable(listColumnsTable);
  }, []);

  useEffect(() => {
    loadTableData();
    loadPraiaRun();
    loadExecutionTime();
    loadExecutionStatistics();
  }, [count]);

  const donutDataStatist = [
    { name: 'Success', value: execution_stats.success, color: '#009900' },
    { name: 'Warning', value: execution_stats.warning, color: '#D79F15' },
    { name: 'Failure', value: execution_stats.failure, color: '#ff1a1a' },
    { name: 'Not Executed', value: execution_stats.not_executed, color: '#ABA6A2' },
    { name: 'Running/Idle', value: execution_stats.pending ? execution_stats.pending : 0, color: '#0099ff' },
  ];

  const donutDataExecutionTime = [
    { name: 'Ccd Images', value: executionTime.ccd_images },
    { name: 'Bsp_Jpl', value: executionTime.bsp_jpl },
    { name: 'Catalog', value: executionTime.catalog },
    { name: 'Astrometry', value: executionTime.astrometry },
  ];

  const handleChangeToolButton = (event, newValue) => {
    setToolButton(newValue);
  };

  const handleLogReading = (file) => {
    if (file && typeof file != 'undefined') {
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
        // setDialog({ content: arrayLines, visible: true, title: file + " " });
        setDialog({ content: data, visible: true, title: `${file} ` });
      });
    }
  };

  const handleInterval = () => {
    const status = runData && typeof runData !== 'undefined' ? runData.status : 'no';
    if (status === 'running' || status === 'pending') {
      setCount(count + 1);
    } else {
      setIntervalCondition(false);
    }
    if (count >= 5) {
      setReloadInterval(3);
    }

  };

  return (
    <div>
      <ReactInterval
        timeout={reload_interval * 1000}
        enabled={interval_condition}
        callback={handleInterval}
      />
      <Grid container spacing={2}>
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
        <Grid item xs={12} md={6} xl={4}>
          <Card className={classes.card}>
            <CardHeader
              title="Execution Time"
            />
            <Donut
              data={donutDataExecutionTime}
            />
          </Card>
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid item xs={12} md={12} xl={12}>
          <Stepper activeStep={runData && typeof runData !== 'undefined' ? runData.step : 0} />
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid item sm={12} xl={12}>
          <Card className={classes.card}>
            <CardHeader
              title="Asteroids"
            />
            <Toolbar>
              <ToggleButtonGroup
                className={classes.icon}
                value={toolButton}
                onChange={handleChangeToolButton}
                exclusive
              >
                <ToggleButton
                  value="list"
                  onClick={() => {
                    setColumnsAsteroidTable('list');
                    loadTableData();
                    setTableParams((tableParamsRef) => ({ ...tableParamsRef, reload: !tableParamsRef.reload }));
                  }}
                >
                  <ListIcon />
                </ToggleButton>
                <ToggleButton
                  value="bug"
                  onClick={() => {
                    setColumnsAsteroidTable('bug');
                    loadTableData();
                    setTableParams((tableParamsRef) => ({ ...tableParamsRef, reload: !tableParamsRef.reload }));
                  }}
                >
                  <BugIcon />
                </ToggleButton>
              </ToggleButtonGroup>
            </Toolbar>
            <Table
              data={tableData}
              columns={columnsAsteroidTable === 'list' ? listColumnsTable : bugColumnsTable}
              hasSearching
              loadData={loadTableData}
              totalCount={tableParams.totalCount}
              hasColumnVisibility={false}
              pageSizes={tableParams.pageSizes}
              reload={tableParams.reload}
              hasToolbar
              hasResizing={false}
            />
            <Dialog
              visible={dialog.visible}
              title={dialog.title}
              content={<CustomLog data={dialog.content} />}
              setVisible={() => setDialog({ visible: false, content: [], title: ' ' })}
              bodyStyle={classes.dialogBodyStyle}
            />
          </Card>
        </Grid>
      </Grid>
    </div>
  );
}

export default withRouter(AstrometryDetail);
