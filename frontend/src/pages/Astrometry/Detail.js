import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { Grid, Card, CardHeader } from '@material-ui/core';
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
import Log from '../../components/Log';
import Dialog from '../../components/Dialog';
import {
  readCondorFile,
  getPraiaRunById,
  getExecutionTimeById,
  getAsteroidStatus,
  getAsteroids,
} from '../../services/api/Praia';
import Table from '../../components/Table';
import Donut from '../../components/Chart/Donut';
import Stats from '../../components/List';
import Stepper from '../../components/Stepper';
import ColumnStatus from '../../components/Table/ColumnStatus';
import useInterval from '../../hooks/useInterval';

function AstrometryDetail({ setTitle }) {
  const { id } = useParams();
  const history = useHistory();
  const [list, setList] = useState([]);
  const [executionTime, setExecutionTime] = useState(null);
  const [executionStats, setExecutionStats] = useState(null);
  const [donutDataStatist, setDonutDataStatist] = useState([]);
  const [donutDataExecutionTime, setDonutDataExecutionTime] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [toggleBug, setToggleBug] = useState('list');
  const [runData, setRunData] = useState(null);
  const [dialog, setDialog] = useState({
    visible: false,
    content: [],
    title: '',
  });
  const [totalCount, setTotalCount] = useState(0);
  const [reload, setReload] = useState(true);

  const loadTableData = async ({ pageSize, currentPage, searchValue }) => {
    const asteroids = await getAsteroids({
      sizePerPage: pageSize,
      page: currentPage !== 0 ? currentPage + 1 : 1,
      filters: [
        {
          property: 'astrometry_run',
          value: id,
        },
      ],
      search: searchValue,
    });

    if (asteroids && asteroids.results) {
      setTableData(asteroids.results);
      setTotalCount(asteroids.count);
    }
  };

  const handleAsteroidDetail = (row) =>
    history.push(`/astrometry/asteroid/${row.id}`);

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
      icon: <Icon className="fas fa-info-circle" />,
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
      customElement: (row) => (
        <ColumnStatus status={row.status} title={row.error_msg} />
      ),
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
      customElement: (row) =>
        row.execution_time ? row.execution_time.split('.')[0] : '',
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
      icon: <Icon className="fas fa-info-circle" />,
      action: handleAsteroidDetail,
      sortingEnabled: false,
    },
    {
      name: 'status',
      title: 'Status',
      align: 'center',
      width: 130,
      customElement: (row) => (
        <ColumnStatus status={row.status} title={row.error_msg} />
      ),
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
          <IconButton onClick={() => handleLogReading(row.condor_log)}>
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
          <IconButton onClick={() => handleLogReading(row.condor_err_log)}>
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
          <IconButton onClick={() => handleLogReading(row.condor_out_log)}>
            <DescriptionIcon />
          </IconButton>
        </Tooltip>
      ),
      sortingEnabled: false,
    },
  ];

  useEffect(() => {
    setTitle('Astrometry Run');
  }, [setTitle]);

  const loadPraiaRun = (runId) => {
    getPraiaRunById({ id: runId }).then((data) => {
      setRunData(data);
      setList([
        {
          title: 'Status',
          value: () => (
            <ColumnStatus status={data.status} title={data.error_msg} />
          ),
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

  const loadExecutionTime = (runId) => {
    getExecutionTimeById({ id: runId }).then((res) => {
      setExecutionTime(res.execution_time);
    });
  };

  const loadExecutionStatistics = (runId) => {
    getAsteroidStatus({ id: runId }).then((res) => {
      setExecutionStats(res.status);
    });
  };

  useEffect(() => {
    loadPraiaRun(id);
    loadExecutionTime(id);
    loadExecutionStatistics(id);
  }, [id]);

  useInterval(() => {
    if (runData && runData.status === 'running') {
      setReload(!reload);
      loadPraiaRun(id);
      loadExecutionTime(id);
      loadExecutionStatistics(id);
    }
  }, 30000);

  useEffect(() => {
    if (executionStats) {
      setDonutDataStatist([
        {
          name: 'Success',
          value: Number(executionStats.success),
          color: '#009900',
        },
        {
          name: 'Warning',
          value: Number(executionStats.warning),
          color: '#D79F15',
        },
        {
          name: 'Failure',
          value: Number(executionStats.failure),
          color: '#ff1a1a',
        },
        {
          name: 'Not Executed',
          value: Number(executionStats.not_executed),
          color: '#ABA6A2',
        },
        {
          name: 'Running/Idle',
          value: Number(executionStats.pending),
          color: '#0099ff',
        },
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
        <Grid item xs={12}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleBackNabigation}
          >
            <Icon className="fas fa-undo" />
            <span>Back</span>
          </Button>
        </Grid>

        <Grid item xs={12} xl={4}>
          <Grid item xs={12} lg={6} xl={12}>
            <Card>
              <CardHeader title={`Astrometry - ${id} `} />
              <Stats data={list} />
            </Card>
          </Grid>
        </Grid>

        {donutDataStatist.length > 0 ? (
          <Grid item xs={12} lg={6} xl={4}>
            <Card>
              <CardHeader title="Execution Statistics" />
              <Donut data={donutDataStatist} />
            </Card>
          </Grid>
        ) : null}

        {donutDataExecutionTime.length > 0 ? (
          <Grid item xs={12} lg={6} xl={4}>
            <Card>
              <CardHeader title="Execution Time" />
              <Donut data={donutDataExecutionTime} reload={reload} />
            </Card>
          </Grid>
        ) : null}
      </Grid>

      <Grid item xs={12}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={12} xl={12}>
            <Stepper
              activeStep={
                runData && typeof runData !== 'undefined' ? runData.step : 0
              }
            />
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={2}>
          <Grid item sm={12} xl={12}>
            <Card>
              <CardHeader title="Asteroids" />
              <Toolbar>
                <ToggleButtonGroup
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
                  <ToggleButton value="bug" onClick={() => setToggleBug('bug')}>
                    <BugIcon />
                  </ToggleButton>
                </ToggleButtonGroup>
              </Toolbar>
              <Table
                columns={
                  toggleBug === 'list' ? listColumnsTable : bugColumnsTable
                }
                data={tableData}
                loadData={loadTableData}
                hasColumnVisibility={false}
                pageSizes={[10, 20, 30, 50]}
                pageSize={30}
                totalCount={totalCount}
                hasResizing={false}
                reload={reload}
              />
              <Dialog
                visible={dialog.visible}
                title={dialog.title}
                content={<Log data={dialog.content} />}
                setVisible={() =>
                  setDialog({ visible: false, content: [], title: ' ' })
                }
              />
            </Card>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}

AstrometryDetail.propTypes = {
  setTitle: PropTypes.func.isRequired,
};

export default AstrometryDetail;