import React, { useCallback, useEffect, useState } from 'react'
import moment from 'moment'
import { useParams, useNavigate } from 'react-router-dom'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import Avatar from '@mui/material/Avatar'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import CardActions from '@mui/material/CardActions'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Icon from '@mui/material/Icon'
import Typography from '@mui/material/Typography'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import List from '../../components/List'
import Table from '../../components/Table'
import ColumnStatus from '../../components/Table/ColumnStatus'
import Alert from '@mui/material/Alert'
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos'
import LastUpdated from '../../components/LastUpdated'
import {
  getPredictionJobById,
  getPredictionJobResultsByJobId,
  getPredictionJobResultsFailuresByJobId,
  cancelPredictionJobById,
  getPredictionJobProgressById
} from '../../services/api/PredictJobs'

import useInterval from '../../hooks/useInterval'
import ProgressList from '../../components/ProgressList/index'

function PredictDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [predictionJob, setPredictionJob] = useState({})
  const [summaryExecution, setSummaryExecution] = useState([])
  const [tableData, setTableData] = useState([])
  const [tableErrorData, setTableErrorData] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [totalErrorCount, setTotalErrorCount] = useState(0)
  const [isJobCanceled, setIsJobCanceled] = useState(false)
  const [progress, setProgress] = useState()
  // const [dialog, setDialog] = useState({
  //   content: [],
  //   visible: false,
  //   title: '',
  // });

  const handleBackNavigation = () => navigate(-1)

  const loadDataProgress = (id) => {
    getPredictionJobProgressById({ id }).then((res) => {
      setProgress(res)
    })
  }

  useInterval(() => {
    // TODO: é necessário rever essa lógica,
    // precisa atualizar o progresso pelo menos uma vez depois que o job for concluido.

    // if ([1, 2, 7, 8].includes(predictionJob.status) && id) {
    //   loadDataProgress(id)
    // }

    // Por enquanto, vou deixar o progresso sendo atualizado a cada 25 segundos independente do stautus do job
    loadDataProgress(id)
  }, 25000)

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
    }
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
      name: 'status',
      title: 'Status',
      width: 150,
      customElement: (row) => {
        if (row.status === 1) {
          return <Chip variant='outlined' label={'Success'} color='success' />
        }
        if (row.status === 2) {
          return <Chip variant='outlined' label={'Failure'} color='error' />
        }
        if (row.status === 3) {
          return <Chip variant='outlined' label={'Queued'} />
        }
        if (row.status === 4) {
          return <Chip variant='outlined' label={'Running'} color='info' />
        }
        if (row.status === 5) {
          return <Chip variant='outlined' label={'Aborted'} color='secondary' />
        }
        if (row.status === 6) {
          return <Chip variant='outlined' label={'Ingesting'} />
        }
      }
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
      align: 'center'
    },
    {
      name: 'occultations',
      title: 'Occultations',
      align: 'center'
    },
    {
      name: 'stars',
      title: 'Stars',
      align: 'center'
    },
    {
      name: 'exec_time',
      title: 'Exec Time',
      align: 'center',
      customElement: (row) => (row.exec_time ? row.exec_time.split('.')[0] : '-'),
      width: 140
    }
  ]

  const loadDataSuccess = useCallback(
    ({ currentPage, pageSize, sorting }) => {
      const ordering = sorting[0].direction === 'desc' ? `-${sorting[0].columnName}` : sorting[0].columnName
      // Current Page count starts at 0, but the endpoint expects the 1 as the first index:
      const page = currentPage + 1

      getPredictionJobResultsByJobId({ id, page, pageSize, ordering }).then((res) => {
        setTableData(res.results)
        setTotalCount(res.count)
      })
    },
    [id]
  )

  const loadDataFailure = useCallback(
    ({ currentPage, pageSize, sorting }) => {
      const ordering = sorting[0].direction === 'desc' ? `-${sorting[0].columnName}` : sorting[0].columnName
      // Current Page count starts at 0, but the endpoint expects the 1 as the first index:
      const page = currentPage + 1

      getPredictionJobResultsFailuresByJobId({ id, page, pageSize, ordering }).then((res) => {
        setTableErrorData(res.results)
        setTotalErrorCount(res.count)
      })
    },
    [id]
  )

  useEffect(() => {
    loadDataSuccess({
      currentPage: 0,
      pageSize: 10,
      sorting: [{ columnName: 'start', direction: 'asc' }]
    })

    loadDataFailure({
      currentPage: 0,
      pageSize: 10,
      sorting: [{ columnName: 'start', direction: 'asc' }]
    })

    getPredictionJobById({ id }).then((job) => {
      setPredictionJob(job)
      loadDataProgress(id)
    })
  }, [id, loadDataFailure, loadDataSuccess])

  useInterval(() => {
    // const hasStatusRunning = [1, 2, 7, 8].includes(predictionJob.status)

    if (isRunning() && id) {
      getPredictionJobById({ id }).then((job) => {
        setPredictionJob(job)
      })
    }
  }, 30000)

  useEffect(() => {
    if (predictionJob.status) {
      setSummaryExecution([
        {
          title: 'Status',
          value: () => <ColumnStatus status={predictionJob.status} title={predictionJob.error} align='right' />
        },
        {
          title: 'Owner',
          value: predictionJob.owner
        },
        {
          title: 'Start',
          value: predictionJob.start ? moment(predictionJob.start).format('YYYY-MM-DD HH:mm:ss') : 'Not started'
        },
        {
          title: 'Finish',
          value: predictionJob.end ? moment(predictionJob.end).format('YYYY-MM-DD HH:mm:ss') : '-'
        },
        {
          title: 'Start Period',
          value: predictionJob.predict_start_date ? moment(predictionJob.predict_start_date).format('YYYY-MM-DD HH:mm:ss') : ''
        },
        {
          title: 'End Period',
          value: predictionJob.predict_end_date ? moment(predictionJob.predict_end_date).format('YYYY-MM-DD 23:59:59') : ''
        },
        {
          title: 'Execution Time',
          value: predictionJob.exec_time ? predictionJob.exec_time.split('.')[0] : '-'
        },
        {
          title: 'Asteroid Average Execution Time',
          value: moment.utc(predictionJob.avg_exec_time * 1000).format('HH:mm:ss')
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
        }
      ])
    }
  }, [predictionJob])

  const tasksStatus = () => {
    if (!progress) {
      return
    }
    return (
      <Stack direction='row' spacing={2} m={2}>
        {progress.tasks_status.map((task, index) => (
          <Chip
            key={`chip-status-${index}`}
            variant='outlined'
            label={task.label}
            color={task.color || 'default'}
            avatar={<Avatar>{task.count}</Avatar>}
          />
        ))}
      </Stack>
    )
  }

  const isRunning = () => {
    return [1, 2, 7, 8].includes(predictionJob.status)
  }

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
              {progress && progress?.progress.length > 0 && <ProgressList stageProgress={progress.progress} />}
              <Divider sx={{ mt: 2 }} />
              {tasksStatus()}
            </Grid>
          </CardContent>
          <CardActions>{isRunning() && <LastUpdated datetimeUTC={progress?.updated} />}</CardActions>
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
        )}
        {totalErrorCount > 0 && (
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
        )}
      </>
    </Grid>
  )
}

export default PredictDetail
