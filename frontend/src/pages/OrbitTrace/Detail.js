import React, { useEffect, useState } from 'react'
import { Grid, Card, CardHeader, CardContent, Icon, Button, ButtonGroup, Chip, Typography, CircularProgress } from '@material-ui/core'
import { useParams, useNavigate } from 'react-router-dom'
import moment from 'moment'
import { InfoOutlined as InfoOutlinedIcon } from '@material-ui/icons'
import List from '../../components/List'
import Table from '../../components/Table'
import ColumnStatus from '../../components/Table/ColumnStatus'
import Progress from '../../components/Progress'
import CalendarSuccessOrFailNight from '../../components/Chart/CalendarSuccessOrFailNight'
import {
  getOrbitTraceJobById,
  getOrbitTraceResultByJobId,
  cancelOrbitTraceJobById

} from '../../services/api/OrbitTrace'

import useInterval from '../../hooks/useInterval'
import useStyles from './styles'
import { Alert } from '@material-ui/lab'
import { WidthFull } from '../../../node_modules/@mui/icons-material/index'
import { fill } from 'lodash'

function OrbitTraceDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const classes = useStyles()
  const [orbitTraceJob, setOrbitTraceJob] = useState({})
  const [summaryExecution, setSummaryExecution] = useState([])
  const [summaryResults, setSummaryResults] = useState([])
  const [progress, setProgress] = useState({
    request: {
      status: 'completed',
      exposures: 0,
      current: 0,
      average_time: 0,
      time_estimate: 0,
      exposures_failed: 0,
    },
    loaddata: {
      status: 'completed',
      exposures: 0,
      current: 0,
      average_time: 0,
      time_estimate: 0,
      exposures_failed: 0,
    }
  })
  const [loadProgress, setLoadProgress] = useState(false)
  const [isJobCanceled, setIsJobCanceled] = useState(false)
  const [tableData, setTableData] = useState([])
  const [hasCircularProgress, setHasCircularProgress] = useState(true)

  // Initiating totalCount as null so that it passes the conditional rendering,
  // in case of nor exposure, and calls the function loadData.
  const [totalCount, setTotalCount] = useState(null)

  const [executedNightsByPeriod, setExecutedNightsByPeriod] = useState([])
  const [currentYearExecutedNights, setCurrentYearExecutedNights] = useState([])

  const [currentSelectedDateYear, setCurrentSelectedDateYear] = useState('')
  const [selectedDateYears, setSelectedDateYears] = useState([])

  const [dynclassAsteroids, setDynclassAsteroids] = useState([])

  const [tableErrorData, setTableErrorData] = useState([])
  const [totalErrorCount, setTotalErrorCount] = useState(0)


  const handleBackNavigation = () => navigate(-1)

  const haveError = totalErrorCount > 0 && 'results' in orbitTraceJob

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
          <Button onClick={() => navigate(`/dashboard/data-preparation/des/orbittrace/asteroid/${row.id}`)}>
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
      name: 'exec_time',
      title: 'Execution Time',
      width: 150,
      align: 'center',
      customElement: (row) => (row.exec_time ? row.exec_time.split('.')[0] : "-")
    },
    {
      name: 'error',
      title: 'Messages',
      width: 720            
    },
  ]

  const tableColumns = [
    {
      name: 'index',
      title: ' ',
      width: 70,
      sortingEnabled: false,
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
          <Button onClick={() => navigate(`/dashboard/data-preparation/des/orbittrace/asteroid/${row.id}`)}>
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
      align: 'center',
      width: 180
    },
    {
      name: 'number',
      title: 'Number',
      align: 'center',
      width: 130
    },
    {
      name: 'base_dynclass',
      title: 'Base DynClass',
      align: 'center',
      width: 130
    },
    {
      name: 'dynclass',
      title: 'DynClass',
      align: 'center',
      width: 130
    },
    {
      name: 'observations',
      title: 'Observations',
      align: 'center',
      width: 130
    },
    {
      name: 'ccds',
      title: 'CCDs',
      align: 'center',
      width: 130
    },
    {
      name: 'exec_time',
      title: 'Execution Time',
      width: 150,
      align: 'center',
      customElement: (row) => (row.exec_time ? row.exec_time.split('.')[0] : "-")
    },

  ]

  const loadDataSuccess = ({ currentPage, pageSize, sorting }) => {
    const ordering = sorting[0].direction === 'desc'? `-${sorting[0].columnName}`: sorting[0].columnName;
    // Current Page count starts at 0, but the endpoint expects the 1 as the first index:
    const page = currentPage + 1
    
    getOrbitTraceResultByJobId({ id, page, pageSize, ordering }, true).then((res) => {
      setTableData(res.results)
      setTotalCount(res.count);
    })
  }

  const loadDataFailure = ({ currentPage, pageSize, sorting }) => {
    const ordering = sorting[0].direction === 'desc'? `-${sorting[0].columnName}`: sorting[0].columnName;
    // Current Page count starts at 0, but the endpoint expects the 1 as the first index:
    const page = currentPage + 1

    getOrbitTraceResultByJobId({ id, page, pageSize, ordering }, false).then((res) => {
      setTableErrorData(res.results)
      setTotalErrorCount(res.count);
    })
  }

  useEffect(() => {
    getOrbitTraceJobById({ id }).then((res) => {
      setOrbitTraceJob(res)
    })

    loadDataSuccess({
      currentPage: 0,
      pageSize: 10,
      sorting: [{ columnName: 'id', direction: 'asc' }]
    })

    loadDataFailure({
      currentPage: 0,
      pageSize: 10,
      sorting: [{ columnName: 'id', direction: 'asc' }]
    })
    //loadErrors({ currentPage: 0, pageSize: 10 })
  }, [loadProgress, id])

  useEffect(() => {
    if (Object.keys(orbitTraceJob).length > 0) {
      setSummaryExecution([
        {
          title: 'Status',
          value: () => <ColumnStatus status={orbitTraceJob.status} title={orbitTraceJob.error} align='right' />
        },
        {
          title: 'Owner',
          value: orbitTraceJob.owner
        },
        {
          title: 'Job ID',
          value: id
        },
        {
          title: 'Start',
          value: orbitTraceJob.start ? moment(orbitTraceJob.start).format('YYYY-MM-DD HH:mm:ss') : "Not started"
        },
        {
          title: 'Finish',
          value: orbitTraceJob.end ? moment(orbitTraceJob.end).format('YYYY-MM-DD HH:mm:ss') : '-'
        },
        {
          title: 'Estimated Time',
          value: orbitTraceJob.estimated_execution_time ? orbitTraceJob.estimated_execution_time.split('.')[0] : 0
        },
        {
          title: 'Execution Time',
          value: orbitTraceJob.exec_time ? orbitTraceJob.exec_time.split('.')[0] : 0
        },
        {
          title: 'Average Execution Time Asteroid',
          value: moment.utc(orbitTraceJob.avg_exec_time_asteroid * 1000).format("HH:mm:ss.SSS")
        },
        {
          title: 'Average Execution Time CCD',
          value: moment.utc(orbitTraceJob.avg_exec_time_ccd * 1000).format("HH:mm:ss.SSS")
        },

      ])

      setSummaryResults([
        {
          title: '# Asteroids',
          value: orbitTraceJob.count_asteroids
        },
        {
          title: '# CCDs',
          value: orbitTraceJob.count_ccds
        },
        {
          title: '# Observations',
          value: orbitTraceJob.count_observations
        },
        {
          title: '# Success',
          value: orbitTraceJob.count_success
        },
        {
          title: '# Failures',
          value: orbitTraceJob.count_failures
        }
      ])
    }
  }, [orbitTraceJob, id])

  const formatSeconds = (value) => moment().startOf('day').seconds(value).format('HH:mm:ss')

  useInterval(() => {
    if ([1, 2].includes(orbitTraceJob.status)) {
      setLoadProgress((prevState) => !prevState)
    }
  }, [5000])

  const handleStopRun = () => {
    cancelOrbitTraceJobById(id).then(() => {
      setIsJobCanceled(true)
      setLoadProgress((prevState) => !prevState)
    })
  }

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
          {[1, 2].includes(orbitTraceJob.status) ? (
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
            {(orbitTraceJob?.error !== null && orbitTraceJob?.error !== '') ? <Alert severity='error'>{orbitTraceJob?.error}</Alert> : null}
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
                      )}`}
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
              {/* {hasCircularProgress && [1, 2].includes(orbitTraceJob.status) ? (
                <CircularProgress className={classes.circularProgress} disableShrink size={20} />
              ) : null} */}
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Grid container alignItems='stretch' spacing={2}>
          <Grid item xs={12} md={5} xl={3}>
            <Card>
              <CardHeader title='Summary Results' />
              <CardContent>
                <List data={summaryResults} />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={7} xl={9}>
            <Card>
              <CardHeader title='Graphic' />
              <CardContent>
                <Grid container spacing={2} direction='column' className={classes.gridTable}>
                  {/* <Grid item>
                    {selectedDateYears.length > 1 ? (
                      <ButtonGroup variant='contained' color='primary' className={classes.buttonGroupYear}>
                        {selectedDateYears.map((year) => (
                          <Button key={year} onClick={() => setCurrentSelectedDateYear(year)} disabled={currentSelectedDateYear === year}>
                            {year}
                          </Button>
                        ))}
                      </ButtonGroup>
                    ) : null}
                  </Grid>
                  <Grid item className={classes.gridTableRow}>
                    <CalendarSuccessOrFailNight data={currentYearExecutedNights} />
                  </Grid> */}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>
      <>
      {
        totalCount > 0 &&
          <Grid item>
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
    </Grid>
  )
}

export default OrbitTraceDetail
