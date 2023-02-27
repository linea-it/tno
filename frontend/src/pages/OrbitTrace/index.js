import React, { useEffect, useState } from 'react'
import { Backdrop, Box, Snackbar, Button, Card, CardContent, CardHeader, CircularProgress, FormControl, Grid, InputLabel, MenuItem, Select, TextField } from '../../../node_modules/@material-ui/core/index'
import DateRangePicker from '../../components/Date/DateRangePicker'
import Table from '../../components/Table/index'
import moment from '../../../node_modules/moment/moment'
import { getExecutedNightsByPeriodOrbit, getExposuresByPeriodOrbit } from '../../services/api/OrbitTrace'
import useStyles from './styles'
import { useNavigate } from '../../../node_modules/react-router-dom/dist/index'

import {
  getLeapSecondList,
  getBspPlanetaryList,
  createOrbitTraceJob
} from '../../services/api/OrbitTrace'
import { Alert } from '../../../node_modules/@material-ui/lab/index'
import { bool } from 'prop-types'

function OrbitTrace() {
  const navigate = useNavigate()
  const classes = useStyles()
  const selectedDateLocalStorage = localStorage.getItem('discoverySelectedDate')
  const [selectedDate, setSelectedDate] = useState(
    selectedDateLocalStorage ? [JSON.parse(selectedDateLocalStorage).start, JSON.parse(selectedDateLocalStorage).end] : ['', '']
  )

  const [backdropOpen, setBackdropOpen] = useState(false)
  const [reload, setReload] = useState(true)
  const [exposuresByPeriod, setExposuresByPeriod] = useState([])
  const [executedNightsByPeriod, setExecutedNightsByPeriod] = useState([])
  const [selectedDateYears, setSelectedDateYears] = useState([])
  const [currentSelectedDateYear, setCurrentSelectedDateYear] = useState('')
  const [bspPlanetaryList, setBspPlanetaryList] = useState([])
  const [leapSecondList, setLeapSecondList] = useState([])

  const [messageOpenSuccess, setMessageOpenSuccess] = useState(false)
  const [messageTextSuccess, setMessageTextSuccess] = React.useState('');

  const [messageOpenError, setMessageOpenError] = useState(false)
  const [messageTextError, setMessageTextError] = React.useState('');

  const [bspPlanetaryError, setBspPlanetaryError] = React.useState(false);
  const [leapSecondError, setLeapSecondError] = React.useState(false);
  const [filterTypeError, setFilterTypeError] = React.useState(false);
  const [filterValueError, setFilteValueError] = React.useState(false);
  const [selectedDateError, setselectedDateError] = React.useState(false);

  const [executionSummary, setExecutionSummary] = useState({
    visible: false,
    start: '',
    end: '',
    exposures: 0,
    estimated_time: '0'
  })


  const [bspPlanetary, setBspPlanetary] = React.useState('');
  const [leapSecond, setLeapSecond] = React.useState('');
  const [filterType, setFilterType] = React.useState('');
  const [filterValue, setFilteValue] = React.useState('');

  const bspPlanetaryhandleChange = (event) => {
    setBspPlanetary(event.target.value);
  };

  const lepSecondhandleChange = (event) => {
    setLeapSecond(event.target.value);
  };

  useEffect(() => {
    getBspPlanetaryList().then((list) => {
      setBspPlanetaryList(list)
    })

    getLeapSecondList().then((list) => {
      setLeapSecondList(list)
    })

  }, []);

  function validadeInformation() {
    var verify = true;
    setMessageTextError('');
    setMessageOpenError(false);
    setselectedDateError(false);
    setBspPlanetaryError(false);
    setLeapSecondError(false);
    setFilterTypeError(false);
    setFilteValueError(false);

    if (selectedDate[0] == '') {
      verify = false;
      setselectedDateError(true);
    }

    if (selectedDate[1] == '') {
      verify = false;
      setselectedDateError(true);
    }

    if (bspPlanetary == '') {
      verify = false;
      setBspPlanetaryError(true);
    }

    if (leapSecond == '') {
      verify = false;
      setLeapSecondError(true);
    }

    if (filterType == '') {
      verify = false;
      setFilterTypeError(true);
    }

    if (filterValue == '') {
      verify = false;
      setFilteValueError(true);
    }

    if (!verify) {
      setMessageTextError('All information must be completed.');
      setMessageOpenError(true);
    }

    return verify;
  }

  const handleSelectAllPeriodClick = () => {
    getExecutedNightsByPeriodOrbit('2012-11-10', '2019-02-28').then((res) => {
      const selectedYears = res.map((year) => moment(year.date).format('YYYY')).filter((year, i, yearArr) => yearArr.indexOf(year) === i)

      setExposuresByPeriod(res)
      setSelectedDateYears(selectedYears)
      setCurrentSelectedDateYear(selectedYears[0])
    })

    getExecutedNightsByPeriodOrbit('2012-11-10', '2019-02-28').then((res) => {
      setExecutedNightsByPeriod(res)
    })
  }

  const handleSelectPeriodClick = async () => {

    if (await validadeInformation()) {
      setExposuresByPeriod([])
      setExecutedNightsByPeriod([])

      getExposuresByPeriodOrbit(moment(selectedDate[0]).format('YYYY-MM-DD'), moment(selectedDate[1]).format('YYYY-MM-DD')).then((res) => {
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

        const data = {
          date_initial: selectedDate[0],
          date_final: selectedDate[1],
          bsp_planetary: bspPlanetary,
          leap_second: leapSecond,
          filter_type: filterType,
          filter_value: filterValue
        }
        console.log(data)
        createOrbitTraceJob(data)
          .then((response) => {
            console.log(response);
            setBspPlanetary('');
            setLeapSecond('');
            setFilterType('');
            setFilteValue('');
            setBspPlanetaryList([]);
            setLeapSecondList([]);
            setMessageTextSuccess('Information registered successfully');
            setMessageOpenSuccess(true);
          })
          .catch((err) => {
            console.log(err)
            setMessageTextError(err);
            setMessageOpenError(true);
          })
      })
    }
  }

  const populateBspPlanetaryOptions = () => {
    return bspPlanetaryList.map((obj) => {
      return <MenuItem value={obj.name}>{obj.name}
      </MenuItem>;
    });
  }

  const populateLeapSecondOptions = () => {
    return leapSecondList.map((obj) => {
      return <MenuItem value={obj.name}>{obj.name}
      </MenuItem>;
    });
  }

  return (
    <>
      <Grid container spacing={2} alignItems='stretch'>
        <Grid item xs={12} md={5} lg={4}>
          <Grid container direction='column' spacing={2}>
            <Grid item xs={12}>
              <Card>
                <CardHeader title='Fetch Astrometry' />
                <CardContent>
                  <Grid container spacing={2} alignItems='stretch'>
                    <Grid item xs={12}>
                      <Box sx={{ minWidth: 120 }}>
                        <FormControl fullWidth>
                          <InputLabel>Bsp Planetary *</InputLabel>
                          <Select
                            id="bspPlanetary"
                            value={bspPlanetary}
                            label="BSP Planetary"
                            onChange={bspPlanetaryhandleChange}
                          >
                            {populateBspPlanetaryOptions()}
                          </Select>
                        </FormControl>
                        {bspPlanetaryError ? (<span className={classes.errorText}>Required field</span>) : ''}
                      </Box>
                    </Grid>
                  </Grid>
                  <Grid container spacing={2} alignItems='stretch'>
                    <Grid item xs={12}>
                      <Box sx={{ minWidth: 120 }}>
                        <FormControl fullWidth>
                          <InputLabel>Leap Second *</InputLabel>
                          <Select
                            id="lepSecond"
                            value={leapSecond}
                            label="Leap Second"
                            onChange={lepSecondhandleChange}
                          >
                            {populateLeapSecondOptions()}
                          </Select>
                        </FormControl>
                        {leapSecondError ? (<span className={classes.errorText}>Required field</span>) : ''}
                      </Box>
                    </Grid>
                  </Grid>
                  <Grid container spacing={2} alignItems='stretch'>
                    <Grid item xs={12}>
                      <Box sx={{ minWidth: 120 }}>
                        <FormControl fullWidth>
                          <TextField id="filterType" label="Filter Type *" size="small" value={filterType} onChange={(e) => setFilterType(e.target.value)} />
                        </FormControl>
                        {filterTypeError ? (<span className={classes.errorText}>Required field</span>) : ''}
                      </Box>
                    </Grid>
                  </Grid>
                  <Grid container spacing={2} alignItems='stretch'>
                    <Grid item xs={12}>
                      <Box sx={{ minWidth: 120 }}>
                        <FormControl fullWidth>
                          <TextField id="filterValue" label="Filter Value *" size="small" value={filterValue} onChange={(e) => setFilteValue(e.target.value)} />
                        </FormControl>
                        {filterValueError ? (<span className={classes.errorText}>Required field</span>) : ''}
                      </Box>
                    </Grid>
                  </Grid>
                  <Grid container spacing={2} alignItems='stretch'>
                    <Grid item xs={12}>
                      <label>Ephemeris Range *</label>
                      <DateRangePicker
                        minDate={new Date('2012-11-10 04:09')}
                        maxDate={new Date('2019-02-28 00:00')}
                        selectedDate={selectedDate}
                        setSelectedDate={setSelectedDate}
                      />
                      {selectedDateError ? (<span className={classes.errorText}>Required field</span>) : ''}
                    </Grid>
                    <Grid item xs={12}>
                      <Button variant='contained' color='primary' fullWidth onClick={handleSelectPeriodClick}>
                        Execute
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader title='History' />
            {/* <CardContent>
              <Table
                columns={tableColumns}
                data={tableData}
                loadData={loadData}
                hasSearching={false}
                hasPagination
                hasColumnVisibility={false}
                hasToolbar={false}
                reload={reload}
                totalCount={totalCount}
                defaultSorting={[{ columnName: 'id', direction: 'asc' }]}
              />
            </CardContent> */}
          </Card>
        </Grid>
      </Grid>
      <Snackbar
        open={messageOpenSuccess}
        autoHideDuration={6000}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        onClose={() => setMessageOpenSuccess(false)}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          {messageTextSuccess}
        </Alert>
      </Snackbar>
      <Snackbar
        open={messageOpenError}
        autoHideDuration={6000}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        onClose={() => setMessageOpenError(false)}
      >
        <Alert severity="error" sx={{ width: '100%' }}>
          {messageTextError}
        </Alert>
      </Snackbar>
      <Backdrop className={classes.backdrop} open={backdropOpen}>
        <CircularProgress color='inherit' />
      </Backdrop>
    </>
  )
}
export default OrbitTrace
