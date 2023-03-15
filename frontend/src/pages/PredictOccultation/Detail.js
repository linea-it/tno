import React, { useEffect, useState } from 'react';
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
  Typography,
  CircularProgress,
} from '@material-ui/core';
import {
  List as ListIcon,
  BugReport as BugReportIcon,
} from '@material-ui/icons';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import { InfoOutlined as InfoOutlinedIcon } from '@material-ui/icons'
import List from '../../components/List';
import Table from '../../components/Table';
import Dialog from '../../components/Dialog';
import Log from '../../components/Log';
import ColumnStatus from '../../components/Table/ColumnStatus';
import Donut from '../../components/Chart/Donut';
import {
  getPredictionJobById,
  getPredictionJobResultsById,
  cancelPredictionJobById
} from '../../services/api/PredictOccultation';
import { useNavigate } from '../../../node_modules/react-router-dom/dist/index';
import { Alert } from '@material-ui/lab'
import useStyles from './styles';
import useInterval from '../../hooks/useInterval'

function PredictDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [predictionJob, setPredictionJob] = useState({});
  const [summaryExecution, setSummaryExecution] = useState([])
  const [tableData, setTableData] = useState([]);
  const [tableErrorData, setTableErrorData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalErrorCount, setTotalErrorCount] = useState(0);
  const [isJobCanceled, setIsJobCanceled] = useState(false);
  const [hasCircularProgress, setHasCircularProgress] = useState(true);
  const [loadProgress, setLoadProgress] = useState(false)
  const classes = useStyles()
  const [dialog, setDialog] = useState({
    content: [],
    visible: false,
    title: '',
  });
  const haveError = totalErrorCount > 0 && 'results' in predictionJob

  const handleBackNavigation = () => navigate(-1);

  useInterval(() => {
    if ([1, 2].includes(predictionJob.status)) {
      setLoadProgress((prevState) => !prevState)
    }
  }, [5000])

  const handleStopRun = () => {
    cancelPredictionJobById(id).then(() => {
      setIsJobCanceled(true)
      setLoadProgress((prevState) => !prevState)
    })
  }

  const tableColumns = [
    {
      name: 'id',
      title: 'Details',
      width: 110,
      customElement: (row) => {
        if (row.positions === 0) {
          return <span>-</span>
        }
        return (
          <Button onClick={() => navigate(`/predict_asteroid/${row.id}`)}>
            <InfoOutlinedIcon />
          </Button>
        )
      },
      sortingEnabled: false,
      align: 'center'
    },
    {
      name: 'status',
      title: 'Status',
      width: 140,
      align: 'center',
      sortingEnabled: false,
      customElement: (row) => { return <span>{row.status == 1 ? 'success' : 'failure'}</span> },
    },
    {
      name: 'des_obs',
      title: 'DES Obs',
      width: 130,
      align: 'center',
      customElement: (row) => { return <span>{row.des_obs}</span> },
    },
    {
      name: 'exec_time',
      title: 'Exec Time',
      align: 'center',
      customElement: (row) => {return <span>{row.exec_time}</span>},
      width: 140,
      sortingEnabled: false,
    },
    {
      name: 'pre_occ_count',
      title: 'Pre Occ Count',
      width: 130,
      align: 'center',
      customElement: (row) => { return <span>{row.pre_occ_count}</span> },
    },
    {
      name: 'ing_occ_count',
      title: 'Ing Occ Count',
      width: 130,
      align: 'center',
      customElement: (row) => { return <span>{row.ing_occ_count}</span> },
    },
    
  ];
  
  useEffect(() => {
    loadDataSuccess({
      currentPage: 0,
      pageSize: 10,
      sorting: [{ columnName: 'id', direction: 'asc' }]
    });

    loadDataFailure({
      currentPage: 0,
      pageSize: 10,
      sorting: [{ columnName: 'id', direction: 'asc' }]
    });

    getPredictionJobById({ id }).then((job) => {
      setPredictionJob(job);
    });


  }, [loadProgress, id]);

  useEffect(() => {
    setSummaryExecution([
      {
        title: 'Status',
        value: () => (
          <ColumnStatus status={predictionJob.status} title={predictionJob.error} />
        ),
        
      },
      {
        title: 'Owner',
        value: predictionJob.owner,
      },
      {
        title: 'Start',
        value: predictionJob.start?moment(predictionJob.start).format('YYYY-MM-DD'):"Not started"
      },
      {
        title: 'Finish',
        value: predictionJob.end ? moment(predictionJob.end).format('YYYY-MM-DD HH:mm:ss') : '-'
      },
      {
        title: 'Search Period',
        value: predictionJob.predict_start_date && predictionJob.predict_end_date? moment(predictionJob.predict_start_date).format('YYYY-MM-DD HH:mm:ss') + ' to ' + moment(predictionJob.predict_end_date).format('YYYY-MM-DD HH:mm:ss'): '-'
      },
      {
        title: 'Execution Time',
        value: predictionJob.exec_time ? predictionJob.exec_time.split('.')[0] : 0
      }
    ]);
  }, [predictionJob])


  const loadDataSuccess = ({ currentPage, pageSize, sorting }) => {
    // Current Page count starts at 0, but the endpoint expects the 1 as the first index:
    const page = currentPage + 1
    
    getPredictionJobResultsById({ id, page, pageSize }).then((res) => {
      const successeds = res.results.filter(x => x.status == 1);
      setTableData(successeds.map((successeds) => ({ ...successeds, log: null })))
      setTotalCount(successeds.length)
    })
  }

  const loadDataFailure = ({ currentPage, pageSize, sorting }) => {
    // Current Page count starts at 0, but the endpoint expects the 1 as the first index:
    const page = currentPage + 1

    getPredictionJobResultsById({ id, page, pageSize }).then((res) => {
      const failures = res.results.filter(x => x.status == 2);
      setTableErrorData(failures.map((failures) => ({ ...failures, log: null })))
      setTotalErrorCount(failures.length)
    })
  }
  

  //const handleBackNavigation = () => history.push('/prediction-of-occultation');

  // const handleChangeToolButton = (event, value) => {
  //   const columnToggleValue =
  //     value === 'list'
  //       ? setColumnsTable(tableListArray)
  //       : setColumnsTable(bugLogArray);
  //   setToolButton(columnToggleValue);
  // };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Grid container alignItems='center' spacing={2}>
          <Grid item>
            <Button variant='contained' color='primary' title='Back' onClick={handleBackNavigation}>
              <Icon className='fas fa-undo' fontSize='inherit' />
              <Typography variant='button' style={{ margin: '0 5px' }}>
                Back
              </Typography>
            </Button>
          </Grid>
          {[1, 2].includes(predictionJob.status) ? (
            <Grid item>
              <Button variant='contained' color='secondary' title='Abort' onClick={handleStopRun} disabled={isJobCanceled}>
                {isJobCanceled ? <CircularProgress size={15} color='secondary' /> : <Icon className='fas fa-stop' fontSize='inherit' />}
                <Typography variant='button' style={{ margin: '0 5px' }}>
                  Abort
                </Typography>
              </Button>
            </Grid>
          ) : null}
        </Grid>
      </Grid>
      <Grid item xs={12} md={5} xl={3}>
        <Card>
          <CardHeader title='Summary Execution' />
          <CardContent>
            <List data={summaryExecution} />
            {haveError === true ? (
              <Alert
                severity='warning'
              // action={
              //   <Button color='inherit' size='small' href={orbitTraceJob.results.replace('/archive', '/data')}>
              //     CHECK IT OUT
              //   </Button>
              // }
              >
                {/* <strong>{totalErrorCount}</strong> exposures out of {skybotJob.exposures} failed. */}
              </Alert>
            ) : null}
            {(predictionJob?.error !== null && predictionJob?.error !== '') ? <Alert severity='error'>{predictionJob?.error}</Alert> : null}
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={7} xl={9}>
        <Card>
          <CardHeader title='Progress' />
          <CardContent>
            <Grid container spacing={3} direction='column' className={classes.progressWrapper}>
              <Grid item>
                {/* <Progress
                  title='Retrieving data from Skybot'
                  variant='determinate'
                  label={`${progress.request.exposures} exposures`}
                  total={progress.request.exposures}
                  current={progress.request.current}
                />
                <Grid container spacing={2}>
                  <Grid item>
                    <Chip label={`Average: ${progress.request.average_time.toFixed(2)}s`} color='primary' variant='outlined' />
                  </Grid>
                  <Grid item>
                    <Chip label={`Time Left: ${formatSeconds(progress.request.time_estimate)}`} color='primary' variant='outlined' />
                  </Grid>
                  <Grid item>
                    <Chip
                      label={`Progress: ${progress.request.current}/${progress.request.exposures}`}
                      color='primary'
                      variant='outlined'
                    />
                  </Grid>
                  {progress.request.exposures_failed > 0 ? (
                    <Grid item>
                      <Chip label={`Exposures Failed: ${progress.request.exposures_failed}`} className={classes.chipError} variant='outlined' />
                    </Grid>                  
                  ) : null}
                </Grid> */}
              </Grid>

              <Grid item>
                {/* <Progress
                  title='Importing positions to database'
                  variant='determinate'
                  label={`${progress.loaddata.exposures} exposures`}
                  total={progress.loaddata.exposures}
                  current={progress.loaddata.current}
                />
                <Grid container spacing={2}>
                  <Grid item>
                    <Chip label={`Average: ${progress.loaddata.average_time.toFixed(2)}s`} color='primary' variant='outlined' />
                  </Grid>
                  <Grid item>
                    <Chip
                      label={`Time Left: ${formatSeconds(
                        moment.duration(progress.loaddata.time_estimate).add(moment.duration(progress.request.time_estimate))
                      )}`}container spacing={2}
                      color='primary'
                      variant='outlined'
                    />
                  </Grid>
                  <Grid item>
                    <Chip
                      label={`Progress: ${progress.loaddata.current}/${progress.loaddata.exposures}`}
                      color='primary'
                      variant='outlined'
                    />
                  </Grid>
                  {progress.loaddata.exposures_failed > 0 ? (
                    <Grid item>
                      <Chip label={`Exposures Failed: ${progress.loaddata.exposures_failed}`} className={classes.chipError} variant='outlined' />
                    </Grid>                  
                  ) : null}                  
                </Grid> */}
              </Grid>
              {/* {hasCircularProgress && [1, 2].includes(predictionJob.status) ? (
                <CircularProgress className={classes.circularProgress} disableShrink size={20} />
              ) : null} */}
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      <>
      {
        totalCount > 0 &&
          <Grid item xs={12}>
            <Card>
              <CardHeader title='Asteroid Results' />
              <CardContent>
                <Table
                  columns={tableColumns}
                  data={tableData}
                  loadData={loadDataSuccess}
                  totalCount={totalCount || 0}
                  hasSearching={false}
                  // hasSorting={false}
                  hasColumnVisibility={false}
                  hasToolbar={false}
                  hasRowNumberer
                />
              </CardContent>
            </Card>
          </Grid>
      }
      {
        totalCount > 0 &&
          <Grid item xs={12}>
              <Card>
                <CardHeader title='Asteroid Failures' />
                <CardContent>
                  <Table
                    columns={tableColumns}
                    data={tableErrorData}
                    loadData={loadDataFailure}
                    totalCount={totalErrorCount}
                    hasSearching={false}
                    // hasSorting={false}
                    hasFiltering={false}
                    hasColumnVisibility={false}
                    hasToolbar={false}
                  />
                </CardContent>
              </Card>
          </Grid>
      }
      </>
    </Grid>
  );
}

export default PredictDetail;
