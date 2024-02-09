import React, { useEffect, useState } from 'react'
import moment from 'moment'
import { useNavigate } from 'react-router-dom'
import {
  Grid,
  Card,
  CardHeader,
  CardContent,
  ButtonGroup,
  Button,
  FormControl,
  MenuItem,
  Select,
  InputLabel,
  Typography,
  Snackbar,
  List,
  ListItem,
  ListItemText,
  Backdrop,
  CircularProgress
} from '@mui/material'
import Plot from 'react-plotly.js'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Table from '../../components/Table'
import ColumnStatus from '../../components/Table/ColumnStatus'
import DateRangePicker from '../../components/Date/DateRangePicker'
import useInterval from '../../hooks/useInterval'
import {
  createSkybotRun,
  getSkybotRunList,
  getExposuresByPeriod,
  getExecutedNightsByPeriod,
  getSkybotCalcExecutionTime
} from '../../services/api/Skybot'
import CalendarHeatmap from '../../components/Chart/CalendarHeatmap'
import CalendarExecutedNight from '../../components/Chart/CalendarExecutedNight'
import useStyles from './styles'
import FormGroup from '@mui/material/FormGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'

function Skybot() {
  const navigate = useNavigate()
  const classes = useStyles()
  const [totalCount, setTotalCount] = useState(0)
  const [tableData, setTableData] = useState([])
  const [disableSubmit, setDisableSubmit] = useState(true)
  const [backdropOpen, setBackdropOpen] = useState(false)
  const [reload, setReload] = useState(true)
  const [exposuresByPeriod, setExposuresByPeriod] = useState([])
  const [executedNightsByPeriod, setExecutedNightsByPeriod] = useState([])

  // Get stored period on local storage if it exists and set as the initial data of selectedDate state:
  const selectedDateLocalStorage = localStorage.getItem('discoverySelectedDate')
  const [selectedDate, setSelectedDate] = useState(
    selectedDateLocalStorage ? [JSON.parse(selectedDateLocalStorage).start, JSON.parse(selectedDateLocalStorage).end] : ['', '']
  )

  const [chartType, setChartType] = useState(1)
  const [selectedDateYears, setSelectedDateYears] = useState([])
  const [currentSelectedDateYear, setCurrentSelectedDateYear] = useState('')
  const [currentYearExposures, setCurrentYearExposures] = useState([])
  const [currentYearExecutedNights, setCurrentYearExecutedNights] = useState([])
  const [hasJobRunningOrIdleFeedback, setHasJobRunningOrIdleFeedback] = useState(false)
  const [executionSummary, setExecutionSummary] = useState({
    visible: false,
    start: '',
    end: '',
    exposures: 0,
    estimated_time: '0'
  })
  const [debug, setDebug] = React.useState(false)

  const handleChangeDebug = (event) => {
    setDebug(event.target.checked)
  }
  const handleSelectPeriodClick = () => {
    setExposuresByPeriod([])
    setExecutedNightsByPeriod([])

    getExposuresByPeriod(moment(selectedDate[0]).format('YYYY-MM-DD'), moment(selectedDate[1]).format('YYYY-MM-DD')).then((res) => {
      const selectedYears = res.map((year) => moment(year.date).format('YYYY')).filter((year, i, yearArr) => yearArr.indexOf(year) === i)

      setExposuresByPeriod(res)
      setSelectedDateYears(selectedYears)
      setCurrentSelectedDateYear(selectedYears[0])

      setExecutionSummary({
        visible: true,
        exposures: res.reduce((a, b) => a + (b.count || 0), 0),
        start: selectedDate[0],
        end: selectedDate[1],
        estimated_time: 0
      })
    })

    getExecutedNightsByPeriod(moment(selectedDate[0]).format('YYYY-MM-DD'), moment(selectedDate[1]).format('YYYY-MM-DD')).then((res) => {
      setExecutedNightsByPeriod(res)
    })

    setDisableSubmit(false)
  }

  useEffect(() => {
    if (exposuresByPeriod.length > 0) {
      getSkybotCalcExecutionTime(exposuresByPeriod.reduce((a, b) => a + (b.count || 0), 0)).then((res) => {
        setExecutionSummary((prevExecutionSummaray) => ({
          ...prevExecutionSummaray,
          estimated_time: res
        }))
      })
    }
  }, [exposuresByPeriod])

  const handleSelectAllPeriodClick = () => {
    getExposuresByPeriod('2012-11-10', '2019-02-28').then((res) => {
      const selectedYears = res.map((year) => moment(year.date).format('YYYY')).filter((year, i, yearArr) => yearArr.indexOf(year) === i)

      setExposuresByPeriod(res)
      setSelectedDateYears(selectedYears)
      setCurrentSelectedDateYear(selectedYears[0])
    })

    getExecutedNightsByPeriod('2012-11-10', '2019-02-28').then((res) => {
      setExecutedNightsByPeriod(res)
    })
  }

  useEffect(() => {
    if (chartType !== 0 && currentSelectedDateYear !== '' && executedNightsByPeriod.length > 0) {
      const exposures = exposuresByPeriod.filter((exposure) => moment(exposure.date).format('YYYY') === currentSelectedDateYear)

      const nights = executedNightsByPeriod.filter((exposure) => moment(exposure.date).format('YYYY') === currentSelectedDateYear)

      setCurrentYearExposures(exposures)
      setCurrentYearExecutedNights(nights)
    }
  }, [executedNightsByPeriod, currentSelectedDateYear, chartType, exposuresByPeriod])

  const loadData = ({ sorting, pageSize, currentPage }) => {
    const ordering = sorting[0].direction === 'desc' ? `-${sorting[0].columnName}` : sorting[0].columnName;
    getSkybotRunList({
      page: currentPage + 1,
      pageSize,
      ordering: ordering
    }).then((res) => {
      const { data } = res

      setTableData(
        data.results.map((row) => ({
          detail: `/dashboard/data-preparation/des/discovery/${row.id}`,
          ...row
        }))
      )
      setTotalCount(data.count)
    })
  }

  const handleSubmit = () => {
    setBackdropOpen(true)
    createSkybotRun({
      date_initial: selectedDate[0],
      date_final: selectedDate.length === 1 ? selectedDate[0] : selectedDate[1],
      debug: debug
    })
      .then((response) => {
        const { id } = response.data

        const hasStatusRunningOrIdle = tableData.filter((row) => [1, 2].includes(row.status)).length > 0

        // Store last submitted period on local storage:
        localStorage.setItem(
          'discoverySelectedDate',
          JSON.stringify({
            start: selectedDate[0],
            end: selectedDate[1]
          })
        )

        if (hasStatusRunningOrIdle) {
          setHasJobRunningOrIdleFeedback(true)
          setReload((prevState) => !prevState)
        } else {
          navigate(`/dashboard/data-preparation/des/discovery/${id}`)
        }

        setBackdropOpen(false)
      })
      .catch(() => {
        setReload((prevState) => !prevState)
        setDisableSubmit(false)
        setBackdropOpen(false)
      })
  }

  const handleSubmitJob = () => {
    setDisableSubmit(true)

    handleSubmit()
  }

  const tableColumns = [
    {
      name: 'index',
      title: ' ',
      width: 70
    },
    {
      name: 'id',
      title: 'ID',
      width: 80
    },
    {
      name: 'detail',
      title: 'Detail',
      width: 80,
      customElement: (row) => (
        <Button onClick={() => navigate(row.detail)}>
          <InfoOutlinedIcon />
        </Button>
      ),
      align: 'center',
      sortingEnabled: false
    },
    {
      name: 'status',
      title: 'Status',
      customElement: (row) => <ColumnStatus status={row.status} title={row.error_msg} />
    },
    {
      name: 'owner',
      title: 'Owner',
      width: 130
    },
    {
      name: 'start',
      title: 'Execution Date',
      width: 150,
      customElement: (row) => <span title={moment(row.start).format('HH:mm:ss')}>{moment(row.start).format('YYYY-MM-DD')}</span>
    },
    {
      name: 'execution_time',
      title: 'Execution Time',
      width: 150,
      headerTooltip: 'Execution time',
      align: 'center',
      customElement: (row) => (row.execution_time ? row.execution_time.split('.')[0] : null)
    },
    {
      name: 'date_initial',
      title: 'First Night',
      width: 130,
      customElement: (row) => <span title={moment(row.start).format('HH:mm:ss')}>{row.date_initial}</span>
    },
    {
      name: 'date_final',
      title: 'Last Night',
      width: 130,
      customElement: (row) => <span title={moment(row.finish).format('HH:mm:ss')}>{row.date_final}</span>
    },
    {
      name: 'nights',
      title: '# Nights'
    },
    {
      name: 'exposures',
      title: '# Exposures'
    },
    {
      name: 'asteroids',
      title: '# SSOs'
    },
    {
      name: 'ccds',
      title: '# CCDs'
    },
    {
      name: 'ccds_with_asteroid',
      title: '# CCDs with SSOs'
    }
  ]

  // Reload data if we have any Skybot job running,
  // so we can follow its progress in real time.
  useInterval(() => {
    const hasStatusRunning = tableData.filter((row) => row.status === 2).length > 0

    if (hasStatusRunning) {
      setReload(!reload)
    }
  }, 10000)

  const handleChangeChartType = (e) => {
    setChartType(Number(e.target.value))
  }

  const renderExposurePlot = () => {
    if (exposuresByPeriod.length > 0) {
      return (
        <Grid container spacing={2} alignItems='stretch'>
          <Grid item>
            <FormControl variant='outlined' className={classes.formControl}>
              <InputLabel>Chart Type</InputLabel>
              <Select label='Chart Type' value={chartType} onChange={handleChangeChartType}>
                <MenuItem value={0}>Histogram</MenuItem>
                <MenuItem value={1}>Calendar</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          {chartType === 1 && selectedDateYears.length > 1 ? (
            <Grid item>
              <ButtonGroup variant='contained' color='primary' className={classes.buttonGroupYear}>
                {selectedDateYears.map((year) => (
                  <Button key={year} onClick={() => setCurrentSelectedDateYear(year)} disabled={currentSelectedDateYear === year}>
                    {year}
                  </Button>
                ))}
              </ButtonGroup>
            </Grid>
          ) : null}
          <Grid item xs={12}>
            {chartType === 0 && exposuresByPeriod.length > 0 ? (
              <Plot
                data={[
                  {
                    x: exposuresByPeriod.map((rows) => rows.date),
                    y: exposuresByPeriod.map((rows) => rows.count),
                    type: 'bar',
                    name: `${exposuresByPeriod.reduce((a, b) => a + (b.count || 0), 0)} exposures`,
                    showlegend: true,
                    fixedrange: true,
                    hoverinfo: 'y'
                  }
                ]}
                layout={{
                  hovermode: 'closest',
                  height: 465,
                  margin: {
                    t: 30,
                    b: 40
                  },
                  autosize: true,
                  bargap: 0.05,
                  bargroupgap: 0.2,
                  xaxis: { title: 'Period' },
                  yaxis: { title: 'Exposures' }
                }}
                config={{
                  scrollZoom: false,
                  displaylogo: false,
                  responsive: true
                }}
              />
            ) : null}
            {chartType === 1 ? (
              <>
                <Typography gutterBottom>{`${currentYearExposures.reduce((a, b) => a + (b.count || 0), 0)} exposure(s)`}</Typography>
                <CalendarHeatmap data={currentYearExposures} />
                <CalendarExecutedNight data={currentYearExecutedNights} />
              </>
            ) : null}
          </Grid>
          {executionSummary.visible ? (
            <Grid item xs={12}>
              <List dense>
                <Grid container>
                  <Grid item xs={12} sm={3}>
                    <ListItem>
                      <ListItemText primary='Start Date' secondary={executionSummary.start} />
                    </ListItem>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <ListItem>
                      <ListItemText primary='End Date' secondary={executionSummary.end} />
                    </ListItem>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <ListItem>
                      <ListItemText primary='Exposures' secondary={executionSummary.exposures} />
                    </ListItem>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <ListItem>
                      <ListItemText
                        primary='Estimated Time'
                        secondary={moment.utc(executionSummary.estimated_time * 1000).format('HH:mm:ss')}
                      />
                    </ListItem>
                  </Grid>
                </Grid>
              </List>
            </Grid>
          ) : null}
        </Grid>
      )
    }
    return null
  }

  return (
    <>
      <Grid container spacing={2} alignItems='stretch'>
        <Grid item xs={12} md={4} lg={3}>
          <Grid container direction='column' spacing={2}>
            <Grid item xs={12}>
              <Card>
                <CardHeader title='Discovery Run' />
                <CardContent>
                  <Grid container spacing={2} alignItems='stretch'>
                    <Grid item xs={12}>
                      <Button variant='contained' color='primary' fullWidth onClick={handleSelectAllPeriodClick}>
                        Show Observations
                      </Button>
                    </Grid>
                    <Grid item xs={12}>
                      <DateRangePicker
                        // First day of Skybot:
                        minDate={new Date('2012-11-10 04:09')}
                        maxDate={new Date('2019-02-28 00:00')}
                        selectedDate={selectedDate}
                        setSelectedDate={setSelectedDate}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button variant='contained' color='primary' fullWidth onClick={handleSelectPeriodClick}>
                        Select
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <FormGroup>
                    <FormControlLabel
                      control={<Switch checked={debug} onChange={handleChangeDebug} />}
                      label='Debug mode'
                    />
                  </FormGroup>
                  <Typography color='textSecondary' gutterBottom>
                    Click here to submit a job on the selected period
                  </Typography>
                  <Button variant='contained' color='primary' fullWidth disabled={disableSubmit} onClick={handleSubmitJob}>
                    Submit
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12} md={8} lg={9} open>
          <Card>
            <CardHeader title='Number of Exposures in Selected Period' />
            <CardContent>{renderExposurePlot()}</CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader title='History' />
            <CardContent>
              <Table
                columns={tableColumns}
                data={tableData}
                loadData={loadData}
                hasSearching={false}
                hasPagination
                hasColumnVisibility={true}
                hasToolbar={true}
                reload={reload}
                totalCount={totalCount}
                defaultSorting={[{ columnName: 'id', direction: 'asc' }]}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Snackbar
        open={hasJobRunningOrIdleFeedback}
        autoHideDuration={5000}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        message="There's already a job running, so your job is currently idle."
        onClose={() => setHasJobRunningOrIdleFeedback(false)}
      />
      <Backdrop className={classes.backdrop} open={backdropOpen}>
        <CircularProgress color='inherit' />
      </Backdrop>
    </>
  )
}

export default Skybot
