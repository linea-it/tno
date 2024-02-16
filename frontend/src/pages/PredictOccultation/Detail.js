import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { useParams, useNavigate } from 'react-router-dom';
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Icon from '@mui/material/Icon';
import Typography from '@mui/material/Typography';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import List from '../../components/List';
import Table from '../../components/Table';
import ColumnStatus from '../../components/Table/ColumnStatus';
import Alert from '@mui/material/Alert';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import {

  getPredictionJobById,
  getPredictionJobResultsByJobId,
  cancelPredictionJobById,
  getPredictionJobProgressById
} from '../../services/api/PredictOccultation';

import useInterval from '../../hooks/useInterval'
import ProgressList from '../../components/ProgressList/index';

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
  const [progress, setProgress] = useState([])
  const [dialog, setDialog] = useState({
    content: [],
    visible: false,
    title: '',
  });
  const haveError = totalErrorCount > 0 && 'results' in predictionJob

  const handleBackNavigation = () => navigate(-1);

  const loadDataProgress = (id) => {
    getPredictionJobProgressById({ id }).then((res) => {
      setProgress(res)
    })
  }

  useInterval(() => {
    if ([1, 2].includes(predictionJob.status) && id) {
      loadDataProgress(id)
    }
  }, [10000])

  const handleStopRun = () => {
    cancelPredictionJobById(id).then(() => {
      setIsJobCanceled(true)
    })
  }

  const tableErrorColumns = [
    {
      name: 'index',
      title: ' ',
      sortingEnabled: false,
      width: 70
    },
    {
      name: 'id',
      title: 'Details',
      width: 110,
      customElement: (row) => {
        if (row.positions === 0) {
          return <span>-</span>
        }
        return (
          <Button onClick={() => navigate(`/dashboard/data-preparation/predict-asteroid/${row.id}`)}>
            <InfoOutlinedIcon />
          </Button>
        )
      },
      sortingEnabled: false,
      align: 'center'
    },
    {
      name: 'name',
      title: 'Asteroid',
      width: 150
    },
    {
      name: 'messages',
      title: 'Messages',
      width: 720
    },

  ]

  const tableColumns = [
    {
      name: 'index',
      title: ' ',
      sortingEnabled: false,
      width: 70
    },
    {
      name: 'id',
      title: 'Details',
      width: 110,
      customElement: (row) => {
        if (row.positions === 0) {
          return <span>-</span>
        }
        return (
          <Button onClick={() => navigate(`/dashboard/data-preparation/predict-asteroid/${row.id}`)}>
            <InfoOutlinedIcon />
          </Button>
        )
      },
      sortingEnabled: false,
      align: 'center'
    },
    {
      name: 'name',
      title: 'Asteroid',
      width: 150
    },
    {
      name: 'number',
      title: 'Number',
      width: 150
    },
    {
      name: 'base_dynclass',
      title: 'Dynamic Class',
      align: 'center',
    },
    {
      name: 'occultations',
      title: 'Occultations',
      align: 'center',
    },
    {
      name: 'des_obs',
      title: 'DES Obs',
      width: 130,
      align: 'center'
    },
    {
      name: 'exec_time',
      title: 'Exec Time',
      align: 'center',
      customElement: (row) => (row.exec_time ? row.exec_time.split('.')[0] : "-"),
      width: 140
    },
  ];

  useEffect(() => {
    loadDataSuccess({
      currentPage: 0,
      pageSize: 10,
      sorting: [{ columnName: 'start', direction: 'asc' }]
    });

    loadDataFailure({
      currentPage: 0,
      pageSize: 10,
      sorting: [{ columnName: 'start', direction: 'asc' }]
    });

    getPredictionJobById({ id }).then((job) => {
      setPredictionJob(job);
      loadDataProgress(id)
    });


  }, [id]);

  useInterval(() => {
    const hasStatusRunning = [1, 2].includes(predictionJob.status)

    if (hasStatusRunning) {
      getPredictionJobById({ id }).then((job) => {
        setPredictionJob(job);
      });
    }
  }, 2000)

  useEffect(() => {
    if (predictionJob.status) {
      setSummaryExecution([
        {
          title: 'Status',
          value: () => (
            <ColumnStatus status={predictionJob.status} title={predictionJob.error} align="right" />
          ),

        },
        {
          title: 'Owner',
          value: predictionJob.owner,
        },
        {
          title: 'Start',
          value: predictionJob.start ? moment(predictionJob.start).format('YYYY-MM-DD HH:mm:ss') : "Not started"
        },
        {
          title: 'Finish',
          value: predictionJob.end ? moment(predictionJob.end).format('YYYY-MM-DD HH:mm:ss') : '-'
        },
        {
          title: 'Start Period',
          value: predictionJob.predict_start_date ? moment(predictionJob.predict_start_date).format('YYYY-MM-DD HH:mm:ss') : ""
        },
        {
          title: 'End Period',
          value: predictionJob.predict_end_date ? moment(predictionJob.predict_end_date).format('YYYY-MM-DD 23:59:59') : ""
        },
        {
          title: 'Execution Time',
          value: predictionJob.exec_time ? predictionJob.exec_time.split('.')[0] : "-"
        },
        {
          title: 'Asteroid Average Execution Time',
          value: moment.utc(predictionJob.avg_exec_time * 1000).format("HH:mm:ss")
        },
        {
          title: '# Asteroids',
          value: predictionJob.count_asteroids
        },
        {
          title: '# Success',
          value: predictionJob.count_success
        },
        {
          title: '# Failures',
          value: predictionJob.count_failures
        },
        {
          title: '# Occultations',
          value: predictionJob.count_occ
        },

      ]);
    }
  }, [predictionJob])


  const loadDataSuccess = ({ currentPage, pageSize, sorting }) => {
    const ordering = sorting[0].direction === 'desc' ? `-${sorting[0].columnName}` : sorting[0].columnName;
    // Current Page count starts at 0, but the endpoint expects the 1 as the first index:
    const page = currentPage + 1

    getPredictionJobResultsByJobId({ id, page, pageSize, ordering }, true).then((res) => {
      setTableData(res.results)
      setTotalCount(res.count)
    })
  }

  const loadDataFailure = ({ currentPage, pageSize, sorting }) => {
    const ordering = sorting[0].direction === 'desc' ? `-${sorting[0].columnName}` : sorting[0].columnName;
    // Current Page count starts at 0, but the endpoint expects the 1 as the first index:
    const page = currentPage + 1

    getPredictionJobResultsByJobId({ id, page, pageSize, ordering }, false).then((res) => {
      setTableErrorData(res.results)
      setTotalErrorCount(res.count)
    })
  }



  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Grid container alignItems='center' spacing={2}>
          <Grid item>
            <Button
              variant='contained'
              color='primary'
              title='Back'
              onClick={handleBackNavigation}
              startIcon={<ArrowBackIosIcon />}
            >
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
      {
        'error' in predictionJob && predictionJob.error !== null && (
          <Grid item xs={12}>
            <Alert severity='error'>{predictionJob.error}</Alert>
          </Grid>
        )
      }
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
            <Grid container spacing={3} direction='column'>
              <ProgressList
                lista={progress}
              />
              {predictionJob.status == 1 && progress.length == 0 ? (
                <CircularProgress disableShrink size={50} />
              ) : null}
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
                  hasColumnVisibility={true}
                  hasToolbar={true}
                  hasRowNumberer
                  defaultSorting={[{ columnName: 'asteroid_name', direction: 'asc' }]}
                />
              </CardContent>
            </Card>
          </Grid>
        }
        {
          totalErrorCount > 0 &&
          <Grid item xs={12}>
            <Card>
              <CardHeader title='Asteroid Failures' />
              <CardContent>
                <Table
                  columns={tableErrorColumns}
                  data={tableErrorData}
                  loadData={loadDataFailure}
                  totalCount={totalErrorCount}
                  hasSearching={false}
                  hasFiltering={false}
                  hasColumnVisibility={true}
                  hasToolbar={true}
                  defaultSorting={[{ columnName: 'asteroid_name', direction: 'asc' }]}
                />
              </CardContent>
            </Card>
          </Grid>
        }
      </>
    </Grid >
  );
}

export default PredictDetail;
