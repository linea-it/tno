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
  getOrbitTraceJobResultById

} from '../../services/api/OrbitTrace'

import useInterval from '../../hooks/useInterval'
import useStyles from './styles'
import { Alert } from '@material-ui/lab'

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

  // useEffect(() => {
  //   getSkybotProgress(id)
  //     .then((data) => {
  //       setProgress(data)
  //       setHasCircularProgress(false)
  //     })
  //     .catch(() => {
  //       setHasCircularProgress(true)
  //     })
  // }, [loadProgress, id])

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
          <Button onClick={() => navigate(`/data-preparation/des/discovery/asteroid/${row.id}`)}>
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
      align: 'center',

      customElement: (row) => {return <span>{row.status == 1 ? 'success' : 'failure'}</span>},
      width: 130
    },
    {
      name: 'asteroid_name',
      title: 'Asteroid',
      align: 'center',

      customElement: (row) => {return <span>{row.asteroid_name}</span>},
      width: 180
    },
    {
      name: 'asteroid_number',
      title: 'Number',
      align: 'center',

      customElement: (row) => {return <span>{row.asteroid_number}</span>},
      width: 130
    },
    {
      name: 'base_dynclass',
      title: 'Base DynClass',
      align: 'center',

      customElement: (row) => {return <span>{row.base_dynclass}</span>},
      width: 130
    },
    {
      name: 'dynclass',
      title: 'DynClass',
      align: 'center',

      customElement: (row) => {return <span>{row.dynclass}</span>},
      width: 130
    },
    {
      name: 'observations',
      title: 'Observations',
      align: 'center',

      customElement: (row) => {return <span>{row.observations}</span>},
      width: 130
    },
    {
      name: 'ccds',
      title: 'CCDs',
      align: 'center',

      customElement: (row) => {return <span>{row.ccds}</span>},
      width: 130
    },
    
  ]

  
  const loadData = ({ currentPage, pageSize, sorting }) => {
    // Current Page count starts at 0, but the endpoint expects the 1 as the first index:
    const page = currentPage + 1
    //const ordering = `${sorting[0].direction === 'desc' ? '-' : ''}${sorting[0].columnName}`

    getOrbitTraceJobResultById({ id, page, pageSize }).then((res) => {
      setTableData(res.results.map((results) => ({ ...results, log: null })))
      setTotalCount(res.count)
    })
  }

  // const loadErrors = ({ currentPage, pageSize }) => {
  //   // Current Page count starts at 0, but the endpoint expects the 1 as the first index:
  //   const page = currentPage + 1

  //   getSkybotJobExposuresThatFailed({ id, page, pageSize }).then((res) => {
  //     setTableErrorData(res.results.map((results) => ({ ...results, log: null })))
  //     setTotalErrorCount(res.count)
  //   })
  // }

  useEffect(() => {
    getOrbitTraceJobById({ id }).then((res) => {
      setOrbitTraceJob(res)
    })

    loadData({
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
          value: () => <ColumnStatus status={orbitTraceJob.status} title={orbitTraceJob.error_msg} align='right' />
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
          value: orbitTraceJob.start? moment(orbitTraceJob.start).format('YYYY-MM-DD HH:mm:ss'): "Not started"
        },
        {
          title: 'Finish',
          value: orbitTraceJob.finish ? moment(orbitTraceJob.finish).format('YYYY-MM-DD HH:mm:ss') : '-'
        },
        {
          title: 'Estimated Time',
          value: orbitTraceJob.estimated_execution_time ? orbitTraceJob.estimated_execution_time.split('.')[0] : 0
        },
        {
          title: 'Execution Time',
          value: orbitTraceJob.exec_time ? orbitTraceJob.exec_time.split('.')[0] : 0
        }
      ])

      setSummaryResults([
        {
          title: '# Count Asteroids',
          value: orbitTraceJob.count_asteroids
        },
        {
          title: '# Count CCDs',
          value: orbitTraceJob.count_ccds
        },
        {
          title: '# Count Success',
          value: orbitTraceJob.count_success
        },
        {
          title: '# Count Failures',
          value: orbitTraceJob.count_failures
        }
      ])
    }
  }, [orbitTraceJob, id])

  // useEffect(() => {
  //   getDynclassAsteroids(id).then((res) => {
  //     setDynclassAsteroids(res)
  //   })
  // }, [loadProgress, id])

  const formatSeconds = (value) => moment().startOf('day').seconds(value).format('HH:mm:ss')

  useInterval(() => {
    if ([1, 2].includes(orbitTraceJob.status)) {
      setLoadProgress((prevState) => !prevState)
    }
  }, [5000])

  const handleStopRun = () => {
    // cancelSkybotJobById(id).then(() => {
    //   setIsJobCanceled(true)
    //   setLoadProgress((prevState) => !prevState)
    // })
  }

  // useEffect(() => {
  //     getNightsSuccessOrFail(id).then((res) => {
  //       const selectedYears = res.map((year) => moment(year.date).format('YYYY')).filter((year, i, yearArr) => yearArr.indexOf(year) === i)

  //       setSelectedDateYears(selectedYears)
  //       setCurrentSelectedDateYear(selectedYears[0])

  //       setExecutedNightsByPeriod(res)
  //     })
  // }, [id, orbitTraceJob])

  // useEffect(() => {
  //   if (executedNightsByPeriod.length > 0) {
  //     const nights = executedNightsByPeriod.filter((exposure) => moment(exposure.date).format('YYYY') === currentSelectedDateYear)

  //     setCurrentYearExecutedNights(nights)
  //   }
  // }, [executedNightsByPeriod, currentSelectedDateYear])

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
            {(orbitTraceJob?.error !== null && orbitTraceJob?.error !== '')  ? <Alert severity='error'>{orbitTraceJob?.error}</Alert> : null}
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
              {hasCircularProgress && [1, 2].includes(orbitTraceJob.status) ? (
                <CircularProgress className={classes.circularProgress} disableShrink size={20} />
              ) : null}
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

      {
        // Idle and Running Statuses:
        // ![1, 2].includes(orbitTraceJob.status) ? (
          (
          <>
            <Grid item xs={12} />
            
            <Grid item xs={12}>
              <Card>
                <CardHeader title='Asteroid Results' />
                <CardContent>
                    <Table
                      columns={tableColumns}
                      data={tableData}
                      loadData={loadData}
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
          </>
        ) 
        // : null
      }
    </Grid>
  )
}

export default OrbitTraceDetail
