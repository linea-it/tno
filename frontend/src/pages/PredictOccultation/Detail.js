import React, { useCallback, useEffect, useRef, useState } from 'react';
import moment from 'moment';
import { useParams, useNavigate } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Icon from '@mui/material/Icon';
import Typography from '@mui/material/Typography';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Alert from '@mui/material/Alert';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import List from '../../components/List';
import Table from '../../components/Table';
import ColumnStatus from '../../components/Table/ColumnStatus';
import {
  getPredictionJobById,
  getPredictionJobResultsByJobId,
  getPredictionJobResultsFailuresByJobId,
  cancelPredictionJobById,
  getPredictionJobProgressById,
} from '../../services/api/PredictJobs';
import useAdaptivePolling from '../../hooks/useAdaptivePolling';
import ProgressList from '../../components/ProgressList/index';

const POLLING_ACTIVE_MS = 10000;

function formatCount(n) {
  if (n == null || Number.isNaN(Number(n))) return '0';
  const num = Number(n);
  if (num >= 1e6) return `${(num / 1e6).toFixed(1).replace(/\.0$/, '')}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(1).replace(/\.0$/, '')}k`;
  return String(num);
}

function PredictDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [predictionJob, setPredictionJob] = useState({});
  const [summaryExecution, setSummaryExecution] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [tableErrorData, setTableErrorData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalErrorCount, setTotalErrorCount] = useState(0);
  const [isJobCanceled, setIsJobCanceled] = useState(false);
  const [progress, setProgress] = useState();

  const [successTableState, setSuccessTableState] = useState({
    currentPage: 0,
    pageSize: 10,
    sorting: [{ columnName: 'asteroid_name', direction: 'asc' }],
  });
  const [failureTableState, setFailureTableState] = useState({
    currentPage: 0,
    pageSize: 10,
    sorting: [{ columnName: 'asteroid_name', direction: 'asc' }],
  });
  // const [dialog, setDialog] = useState({
  //   content: [],
  //   visible: false,
  //   title: '',
  // });

  const handleBackNavigation = () => navigate(-1);

  const loadDataProgress = useCallback((jobId) => {
    return getPredictionJobProgressById({ id: jobId }).then((res) => {
      setProgress(res);
    });
  }, []);

  const handleStopRun = () => {
    cancelPredictionJobById(id).then(() => {
      setIsJobCanceled(true);
    });
  };

  const tableErrorColumns = [
    { name: 'index', title: ' ', sortingEnabled: false, width: 70 },
    {
      name: 'id',
      title: 'Details',
      width: 110,
      customElement: (row) => (
        <Button onClick={() => navigate(`/dashboard/data-preparation/predict-asteroid/${row.id}`)}>
          <InfoOutlinedIcon />
        </Button>
      ),
      sortingEnabled: false,
      align: 'center',
    },
    { name: 'name', title: 'Asteroid', width: 150 },
    { name: 'messages', title: 'Messages', width: 720 },
  ];

  const tableColumns = [
    { name: 'index', title: ' ', sortingEnabled: false, width: 70 },
    {
      name: 'id',
      title: 'Details',
      width: 110,
      customElement: (row) => (
        <Button onClick={() => navigate(`/dashboard/data-preparation/predict-asteroid/${row.id}`)}>
          <InfoOutlinedIcon />
        </Button>
      ),
      sortingEnabled: false,
      align: 'center',
    },
    {
      name: 'status',
      title: 'Status',
      width: 150,
      customElement: (row) => {
        if (row.status === 1) return <Chip variant='outlined' label={'Success'} color='success' />;
        if (row.status === 2) return <Chip variant='outlined' label={'Failure'} color='error' />;
        if (row.status === 3) return <Chip variant='outlined' label={'Queued'} />;
        if (row.status === 4) return <Chip variant='outlined' label={'Running'} color='info' />;
        if (row.status === 5) return <Chip variant='outlined' label={'Aborted'} color='secondary' />;
        if (row.status === 6) return <Chip variant='outlined' label={'Ingesting'} />;
      },
    },
    { name: 'name', title: 'Asteroid', width: 150 },
    { name: 'number', title: 'Number', width: 150 },
    { name: 'base_dynclass', title: 'Dynamic Class', align: 'center' },
    { name: 'occultations', title: 'Occultations', align: 'center' },
    { name: 'stars', title: 'Stars', align: 'center' },
    {
      name: 'exec_time',
      title: 'Exec Time',
      align: 'center',
      customElement: (row) => (row.exec_time ? row.exec_time.split('.')[0] : '-'),
      width: 140,
    },
  ];

  const loadDataSuccess = useCallback(
    ({ currentPage, pageSize, sorting }) => {
      const ordering = sorting[0].direction === 'desc' ? `-${sorting[0].columnName}` : sorting[0].columnName;
      const page = currentPage + 1;
      return getPredictionJobResultsByJobId({ id, page, pageSize, ordering }).then((res) => {
        setTableData(res.results);
        setTotalCount(res.count);
      });
    },
    [id]
  );

  const loadDataFailure = useCallback(
    ({ currentPage, pageSize, sorting }) => {
      const ordering = sorting[0].direction === 'desc' ? `-${sorting[0].columnName}` : sorting[0].columnName;
      const page = currentPage + 1;
      return getPredictionJobResultsFailuresByJobId({ id, page, pageSize, ordering }).then((res) => {
        setTableErrorData(res.results);
        setTotalErrorCount(res.count);
      });
    },
    [id]
  );

  const isRunning = useCallback(() => {
    return [1, 2, 7, 8].includes(predictionJob.status);
  }, [predictionJob.status]);

  const didFinalRefetch = useRef(false);

  useEffect(() => {
    didFinalRefetch.current = false;
  }, [id]);

  useAdaptivePolling({
    enabled: !!id,
    isActive: isRunning(),
    pauseWhenHidden: true,
    activeIntervalMs: POLLING_ACTIVE_MS,
    idleIntervalMs: null,
    onTick: useCallback(() => {
      if (!id) return;
      loadDataProgress(id);
      if (isRunning()) {
        getPredictionJobById({ id }).then(setPredictionJob);
      }
      // Tabelas não são atualizadas no polling: evita sobrescrever ordenação/paginação do usuário.
      // Elas são carregadas no mount e no refetch único quando o job finaliza.
    }, [id, isRunning, loadDataProgress]),
  });

  useEffect(() => {
    if (!id || predictionJob.status == null) return;
    const running = [1, 2, 7, 8].includes(predictionJob.status);
    if (running) {
      didFinalRefetch.current = false;
      return;
    }
    if (didFinalRefetch.current) return;
    didFinalRefetch.current = true;
    const t = setTimeout(() => {
      loadDataProgress(id);
      getPredictionJobById({ id }).then(setPredictionJob);
      loadDataSuccess(successTableState);
      loadDataFailure(failureTableState);
    }, 2000);
    return () => clearTimeout(t);
  }, [id, predictionJob.status, loadDataProgress, loadDataSuccess, loadDataFailure, successTableState, failureTableState]);

  useEffect(() => {
    getPredictionJobById({ id }).then((job) => {
      setPredictionJob(job);
      loadDataProgress(id);
      loadDataSuccess(successTableState);
      loadDataFailure(failureTableState);
    });
  }, [id]);

  useEffect(() => {
    if (predictionJob.status) {
      setSummaryExecution([
        { title: 'Status', value: () => <ColumnStatus status={predictionJob.status} title={predictionJob.error} align='right' /> },
        { title: 'Owner', value: predictionJob.owner },
        { title: 'Start', value: predictionJob.start ? moment(predictionJob.start).format('YYYY-MM-DD HH:mm:ss') : 'Not started' },
        { title: 'Finish', value: predictionJob.end ? moment(predictionJob.end).format('YYYY-MM-DD HH:mm:ss') : '-' },
        { title: 'Start Period', value: predictionJob.predict_start_date ? moment(predictionJob.predict_start_date).format('YYYY-MM-DD HH:mm:ss') : '' },
        { title: 'End Period', value: predictionJob.predict_end_date ? moment(predictionJob.predict_end_date).format('YYYY-MM-DD 23:59:59') : '' },
        { title: 'Execution Time', value: predictionJob.exec_time ? predictionJob.exec_time.split('.')[0] : '-' },
        { title: 'Asteroid Average Execution Time', value: moment.utc(predictionJob.avg_exec_time * 1000).format('HH:mm:ss') },
        { title: '# Asteroids', value: predictionJob.count_asteroids },
        { title: '# Success', value: predictionJob.count_success },
        { title: '# Failures', value: predictionJob.count_failures },
        { title: '# Occultations', value: predictionJob.count_occ },
      ]);
    }
  }, [predictionJob]);

  const tasksStatus = () => {
    if (!progress?.tasks_status) return null;
    return progress.tasks_status.map((task, index) => {
      const count = task.count ?? 0;
      const label = `${task.label} ${formatCount(count)}`;
      return (
        <Tooltip key={`chip-status-${index}`} title={Number(count).toLocaleString()} arrow>
          <Chip variant='outlined' label={label} color={task.color || 'default'} sx={{ minWidth: 'max-content' }} />
        </Tooltip>
      );
    });
  };

  const handleSuccessTableStateChange = (newState) => {
    setSuccessTableState(newState);
    loadDataSuccess(newState);
  };

  const handleFailureTableStateChange = (newState) => {
    setFailureTableState(newState);
    loadDataFailure(newState);
  };

  return (
    <Grid container spacing={2} sx={{ minWidth: 0, px: { xs: 1, sm: 0 } }}>
      <Grid item xs={12} sx={{ minWidth: 0 }}>
        <Stack direction='row' flexWrap='wrap' alignItems='center' sx={{ gap: 1 }}>
          <Button variant='contained' color='primary' title='Back' onClick={handleBackNavigation} startIcon={<ArrowBackIosIcon />} size='small' sx={{ minHeight: 44 }}>
            <Typography variant='button' component='span' sx={{ margin: '0 5px' }}>
              Back
            </Typography>
          </Button>
          {[1, 2].includes(predictionJob.status) ? (
            <Button variant='contained' color='secondary' title='Abort' onClick={handleStopRun} disabled={isJobCanceled} size='small'>
              {isJobCanceled ? <CircularProgress size={15} color='secondary' /> : <Icon className='fas fa-stop' fontSize='inherit' />}
              <Typography variant='button' component='span' sx={{ margin: '0 5px' }}>
                Abort
              </Typography>
            </Button>
          ) : null}
        </Stack>
      </Grid>
      {'error' in predictionJob && predictionJob.error !== null && (
        <Grid item xs={12} sx={{ minWidth: 0 }}>
          <Alert severity='error'>{predictionJob.error}</Alert>
        </Grid>
      )}
      <Grid item xs={12} md={5} xl={3} sx={{ minWidth: 0 }}>
        <Card sx={{ overflow: 'hidden' }}>
          <CardHeader title='Summary Execution' titleTypographyProps={{ variant: 'subtitle1' }} />
          <CardContent sx={{ pt: 0, px: { xs: 1.5, sm: 2 }, '& .MuiListItemText-secondary': { wordBreak: 'break-word' } }}>
            <List data={summaryExecution} />
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={7} xl={9} sx={{ minWidth: 0 }}>
        <Card sx={{ overflow: 'hidden' }}>
          <CardHeader title='Progress' titleTypographyProps={{ variant: 'subtitle1' }} />
          <CardContent sx={{ pt: 0, px: { xs: 1.5, sm: 2 } }}>
            <Grid container spacing={2} direction='column' sx={{ minWidth: 0 }}>
              {progress?.progress?.length > 0 && <ProgressList stageProgress={progress.progress} />}
              <Divider sx={{ mt: 2 }} />
              <Stack direction='row' flexWrap='wrap' alignItems='center' sx={{ m: 2, gap: 2 }}>
                {tasksStatus()}
              </Stack>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      <>
        {totalCount > 0 && (
          <Grid item xs={12} sx={{ minWidth: 0 }}>
            <Card sx={{ overflow: 'hidden' }}>
              <CardHeader title='Asteroid Results' titleTypographyProps={{ variant: 'subtitle1' }} />
              <CardContent sx={{ pt: 0, overflowX: 'auto' }}>
                <Table
                  columns={tableColumns}
                  data={tableData}
                  loadData={handleSuccessTableStateChange}
                  totalCount={totalCount || 0}
                  hasSearching={false}
                  hasColumnVisibility={true}
                  hasToolbar={true}
                  hasRowNumberer
                  currentPage={successTableState.currentPage}
                  pageSize={successTableState.pageSize}
                  sorting={successTableState.sorting}
                />
              </CardContent>
            </Card>
          </Grid>
        )}
        {totalErrorCount > 0 && (
          <Grid item xs={12} sx={{ minWidth: 0 }}>
            <Card sx={{ overflow: 'hidden' }}>
              <CardHeader title='Asteroid Failures' titleTypographyProps={{ variant: 'subtitle1' }} />
              <CardContent sx={{ pt: 0, overflowX: 'auto' }}>
                <Table
                  columns={tableErrorColumns}
                  data={tableErrorData}
                  loadData={handleFailureTableStateChange}
                  totalCount={totalErrorCount}
                  hasSearching={false}
                  hasFiltering={false}
                  hasColumnVisibility={true}
                  hasToolbar={true}
                  currentPage={failureTableState.currentPage}
                  pageSize={failureTableState.pageSize}
                  sorting={failureTableState.sorting}
                />
              </CardContent>
            </Card>
          </Grid>
        )}
      </>
    </Grid>
  );
}

export default PredictDetail;
