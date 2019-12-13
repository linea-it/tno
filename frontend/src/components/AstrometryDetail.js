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
import Tooltip from '@material-ui/core/Tooltip';
import ReactInterval from 'react-interval';
import Button from '@material-ui/core/Button';
import CustomLog from './utils/CustomLog';
import CustomDialog from './utils/CustomDialog';
import {
  readCondorFile, getPraiaRunById, getExecutionTimeById, getAsteroidStatus, getAsteroids,
} from '../api/Praia';
import CustomTable from './utils/CustomTable';
import { Donut } from './utils/CustomChart';
import ListStat from './utils/CustomList';
import Stepper from './AstrometryStepper';


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
}));

function AstrometryDetail({ history, setTitle, match: { params } }) {
  const classes = useStyles();

  const [list, setList] = useState([]);
  const [executionTime, setExecutionTime] = useState(null);
  const [executionStats, setExecutionStats] = useState(null);
  const [donutDataStatist, setDonutDataStatist] = useState([]);
  const [donutDataExecutionTime, setDonutDataExecutionTime] = useState([]);
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
                  title={data.error_msg ? data.error_msg : 'Failure'}
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

  const loadTableData = (event) => {

    let page = typeof event != "undefined" ? event.currentPage + 1 : tableParams.page;
    let sizePerPage = typeof event != "undefined" ? event.pageSize : tableParams.sizePerPage;
    let searchValue = typeof event != "undefined" ? event.searchValue : "";
    let sortField = tableParams.sortField;
    let sortOrder = tableParams.sortOrder;

    const filters = [];

    filters.push({
      property: 'astrometry_run',
      value: runId,
    });

    getAsteroids({
      page, sizePerPage, filters, sortField, sortOrder, search: searchValue,
    })
      .then((res) => {
        setTableData(res.results);
        setTableParams({ ...tableParams, totalCount: res.count });
      })
  };

  const handleAsteroidDetail = (row) => history.push(`/astrometry/asteroid/${row.id}`);

  const listColumnsTable = [
    {
      name: 'id',
      title: 'Details',
      icon: <Icon className={clsx(`fas fa-info-circle ${classes.iconDetail}`)} />,
      action: handleAsteroidDetail,
      sortingEnabled: false,
      width: 100,
      align: 'center',
    },
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
      sortingEnabled: true,
    },
    {
      name: 'number',
      title: 'Number',
      align: 'right',
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
      align: 'right',
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
      align: 'right',
    },
    {
      name: 'processed_ccd_image',
      title: 'Proc CCDs',
      headerTooltip: 'Processed CCDs',
      width: 150,
      align: 'right',
    },
    { name: 'catalog_rows', title: 'Stars', align: 'right' },
    { name: 'outputs', title: 'Output Files', align: 'right' },
    {
      name: 'execution_time',
      title: 'Exec Time',
      headerTooltip: 'Execution time',
      customElement: (row) => (
        <span>
          {row.execution_time && typeof row.execution_time === 'string' ? row.execution_time.substring(0, 8) : ''}

        </span>
      ),
      width: 140,
      align: 'center',
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
      align: 'right',
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

  useEffect(() => {
    if (executionStats) {
      if ((executionStats.success !== 0 && executionStats.warning !== 0 && executionStats.failure !== 0 && executionStats.not_executed !== 0)) {
        setDonutDataStatist([
          { name: 'Success', value: executionStats.success, color: '#009900' },
          { name: 'Warning', value: executionStats.warning, color: '#D79F15' },
          { name: 'Failure', value: executionStats.failure, color: '#ff1a1a' },
          { name: 'Not Executed', value: executionStats.not_executed, color: '#ABA6A2' },
          { name: 'Running/Idle', value: executionStats.pending ? executionStats.pending : 0, color: '#0099ff' },
        ]);
      }
    }
  }, [executionStats]);

  useEffect(() => {
    if (executionTime) {
      if (executionTime.ccd_images !== 0 || executionTime.bsp_jpl !== 0 || executionTime.catalog !== 0 || executionTime.astrometry !== 0) {
        setDonutDataExecutionTime([
          { name: 'Ccd Images', value: executionTime.ccd_images },
          { name: 'Bsp_Jpl', value: executionTime.bsp_jpl },
          { name: 'Catalog', value: executionTime.catalog },
          { name: 'Astrometry', value: executionTime.astrometry },
        ]);
      }
    }
  }, [executionTime]);

  const handleChangeToolButton = (event, newValue) => {
    setToolButton(newValue);
  };

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


  const handleBackNabigation = () => {
    history.push('/astrometry');
  };

  return (
    <Grid>
      <ReactInterval
        timeout={reload_interval * 1000}
        enabled={interval_condition}
        callback={handleInterval}
      />
      <Button
        variant="contained"
        color="primary"
        className={classes.backButton}
        onClick={handleBackNabigation}
      >
        <Icon className={clsx('fas', 'fa-undo', classes.backIcon)} />
        <span>Back</span>
      </Button>
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
                  value={toolButton}
                  onChange={handleChangeToolButton}
                  exclusive
                >
                  <ToggleButton
                    value="list"
                    onClick={() => {
                      setColumnsAsteroidTable('list');
                      loadTableData();
                      setTableParams((tableParamsRef) => ({
                        ...tableParamsRef,
                        reload: !tableParamsRef.reload,
                      }));
                    }}
                  >
                    <ListIcon />
                  </ToggleButton>
                  <ToggleButton
                    value="bug"
                    onClick={() => {
                      setColumnsAsteroidTable('bug');
                      loadTableData();
                      setTableParams((tableParamsRef) => ({
                        ...tableParamsRef,
                        reload: !tableParamsRef.reload,
                      }));
                    }}
                  >
                    <BugIcon />
                  </ToggleButton>
                </ToggleButtonGroup>
              </Toolbar>
              <CustomTable
                data={tableData}
                columns={columnsAsteroidTable === 'list' ? listColumnsTable : bugColumnsTable}
                hasSearching
                loadData={loadTableData}
                totalCount={tableParams.totalCount ? tableParams.totalCount : 1}
                hasColumnVisibility={false}
                pageSizes={tableParams.pageSizes}
                hasToolbar
                hasResizing={false}
                hasPagination={true}

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
export default withRouter(AstrometryDetail);
