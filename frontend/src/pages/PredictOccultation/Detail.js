import React, { useCallback, useEffect, useState } from 'react';
import moment from 'moment';
import { useParams, useNavigate } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
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
import LastUpdated from '../../components/LastUpdated'; // Use LastUpdated again
import {
  getPredictionJobById,
  getPredictionJobResultsByJobId,
  getPredictionJobResultsFailuresByJobId,
  cancelPredictionJobById,
  getPredictionJobProgressById,
} from '../../services/api/PredictJobs';
import useInterval from '../../hooks/useInterval'; // Re-add useInterval
import ProgressList from '../../components/ProgressList/index';

const UPDATE_INTERVAL_MS = 16000;

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

  useInterval(() => {
    if (!id) return;

    // TODO: é necessário rever essa lógica,
    // precisa atualizar o progresso pelo menos uma vez depois que o job for concluido.
    // Por enquanto, vou deixar o progresso sendo atualizado a cada 10 segundos.
    loadDataProgress(id);

    if (isRunning()) {
      getPredictionJobById({ id }).then(setPredictionJob);
      loadDataSuccess(successTableState);
      loadDataFailure(failureTableState);
    }
  }, UPDATE_INTERVAL_MS);

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
    return progress.tasks_status.map((task, index) => (
      <Chip key={`chip-status-${index}`} variant='outlined' label={task.label} color={task.color || 'default'} avatar={<Avatar>{task.count}</Avatar>} />
    ));
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
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Grid container alignItems='center' spacing={2}>
          <Grid item>
            <Button variant='contained' color='primary' title='Back' onClick={handleBackNavigation} startIcon={<ArrowBackIosIcon />}>
              <Typography variant='button' sx={{ margin: '0 5px' }}>
                Back
              </Typography>
            </Button>
          </Grid>
          {[1, 2].includes(predictionJob.status) ? (
            <Grid item>
              <Button variant='contained' color='secondary' title='Abort' onClick={handleStopRun} disabled={isJobCanceled}>
                {isJobCanceled ? <CircularProgress size={15} color='secondary' /> : <Icon className='fas fa-stop' fontSize='inherit' />}
                <Typography variant='button' sx={{ margin: '0 5px' }}>
                  Abort
                </Typography>
              </Button>
            </Grid>
          ) : null}
        </Grid>
      </Grid>
      {'error' in predictionJob && predictionJob.error !== null && (
        <Grid item xs={12}>
          <Alert severity='error'>{predictionJob.error}</Alert>
        </Grid>
      )}
      <Grid item xs={12} md={5} xl={3}>
        <Card>
          <CardHeader title='Summary Execution' />
          <CardContent>
            <List data={summaryExecution} />
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={7} xl={9}>
        <Card>
          <CardHeader title='Progress' />
          <CardContent>
            <Grid container spacing={2} direction='column'>
              {progress?.progress?.length > 0 && <ProgressList stageProgress={progress.progress} />}
              <Divider sx={{ mt: 2 }} />
              <Stack direction='row' alignItems='center' spacing={2} m={2}>
                {tasksStatus()}
                {isRunning() && <LastUpdated datetimeUTC={progress?.updated} />}
              </Stack>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      <>
        {totalCount > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardHeader title='Asteroid Results' />
              <CardContent>
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
          <Grid item xs={12}>
            <Card>
              <CardHeader title='Asteroid Failures' />
              <CardContent>
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
