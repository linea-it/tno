import React, { useEffect, useState } from 'react'
import { Backdrop, Box, Snackbar, Button, Card, CardContent, CardHeader, CircularProgress, FormControl, Grid, InputLabel, MenuItem, Select, TextField, FormGroup, FormControlLabel, Typography, Switch } from '../../../node_modules/@material-ui/core/index'
import Table from '../../components/Table/index'
import moment from '../../../node_modules/moment/moment'
import useStyles from './styles'
import { useNavigate } from '../../../node_modules/react-router-dom/dist/index'

import {
  getLeapSecondList,
  getBspPlanetaryList,
  createOrbitTraceJob,
  getOrbitTraceJobList,
  getFilterTypeList,
  getFilterValueList,
} from '../../services/api/OrbitTrace'
import { Alert } from '../../../node_modules/@material-ui/lab/index'
import ColumnStatus from '../../components/Table/ColumnStatus'
import { InfoOutlined as InfoOutlinedIcon } from '@material-ui/icons'


function OrbitTrace() {
  const navigate = useNavigate();
  const classes = useStyles();

  const [backdropOpen, setBackdropOpen] = useState(false);
  const [reload, setReload] = useState(true);
  const [bspPlanetaryList, setBspPlanetaryList] = useState([]);
  const [leapSecondList, setLeapSecondList] = useState([]);
  const [filterValueList, setFilterValueList] = useState([]);
  const [filterTypeList, setFilterTypeList] = useState([]);
  const [bspValueList, setbspValueList] = useState(['none', '10 days', '20 days', '30 days']);

  const [messageOpenSuccess, setMessageOpenSuccess] = useState(false);
  const [messageTextSuccess, setMessageTextSuccess] = React.useState('');

  const [messageOpenError, setMessageOpenError] = useState(false);
  const [messageTextError, setMessageTextError] = React.useState('');

  const [bspPlanetaryError, setBspPlanetaryError] = React.useState(false);
  const [leapSecondError, setLeapSecondError] = React.useState(false);
  const [filterTypeError, setFilterTypeError] = React.useState(false);
  const [filterValueError, setFilteValueError] = React.useState(false);
  const [bspValueError, setBspValueError] = React.useState(false);

  const [bspPlanetary, setBspPlanetary] = React.useState('');
  const [leapSecond, setLeapSecond] = React.useState('');
  const [filterType, setFilterType] = React.useState('');
  const [filterValue, setFilterValue] = React.useState('');
  const [bspValue, setBspValue] = React.useState('');

  const [tableData, setTableData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const useMountEffect = (fun) => useEffect(fun, []);
  const [debug, setDebug] = React.useState(false)
  const [disableSubmit, setDisableSubmit] = useState(true)

  const handleChangeDebug = (event) => {
    setDebug(event.target.checked)
  }

  const bspPlanetaryhandleChange = (event) => {
    setBspPlanetary(event.target.value);
  };

  const leapSecondhandleChange = (event) => {
    setLeapSecond(event.target.value);
  };

  const filterTypehandleChange = (event) => {
    setFilterType(event.target.value);
  };

  const bspValuehandleChange = (event) => {
    setBspValue(event.target.value);
  };

  const filterValuehandleChange = (event) => {
    setFilterValue(event.target.value);
  };

  useMountEffect(() => {
    getBspPlanetaryList().then((list) => {
      setBspPlanetaryList(list)
    })

    getLeapSecondList().then((list) => {
      setLeapSecondList(list)
    })

    getFilterTypeList().then((list) => {
      setFilterTypeList(list)
    })

    getFilterValueList().then((list) => {
      setFilterValueList(list)
    })

  });

  const handleSubmitJob = () => {
    setDisableSubmit(true)

    //handleSubmit()
  }

  function validadeInformation() {
    var verify = true;
    setMessageTextError('');
    setMessageOpenError(false);
    setBspPlanetaryError(false);
    setLeapSecondError(false);
    setFilterTypeError(false);
    setFilteValueError(false);
    setBspValueError(false);

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


  const handleSelectPeriodClick = async () => {

    if (await validadeInformation()) {
      const data = {
        date_initial: '',
        date_final: '',
        bsp_planetary: bspPlanetary,
        leap_second: leapSecond,
        filter_type: filterType,
        filter_value: filterValue
      }
      createOrbitTraceJob(data)
        .then((response) => {
          setBspPlanetary('');
          setLeapSecond('');
          setFilterType('');
          setFilterValue('');
          setMessageTextSuccess('Information registered successfully');
          setMessageOpenSuccess(true);
          setReload((prevState) => !prevState)
        })
        .catch((err) => {
          console.log(err)
          setMessageTextError(err);
          setMessageOpenError(true);
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

  const populateFilterTypeOptions = () => {
    return filterTypeList.map((type) => {
      return <MenuItem value={type}>{type}
      </MenuItem>;
    });
  }

  const populateFilterValueOptions = () => {
    return filterValueList.map((value) => {
      return <MenuItem value={value}>{value}
      </MenuItem>;
    });
  }

  const populateBspValueOptions = () => {
    return bspValueList.map((value) => {
      return <MenuItem value={value}>{value}
      </MenuItem>;
    });
  }

  const loadData = ({ sorting, pageSize, currentPage }) => {
    getOrbitTraceJobList({
      page: currentPage + 1,
      pageSize,
      ordering: sorting
    }).then((res) => {
      const { data } = res
      setTableData(
        data.results.map((row) => ({
          detail: `/data-preparation/des/orbittracedetail/${row.id}`,
          ...row
        }))
      )
      setTotalCount(data.count)
    })
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
      customElement: (row) => row.start ? <span title={moment(row.start).format('HH:mm:ss')}>{moment(row.start).format('YYYY-MM-DD')}</span> : <span>Not started</span>
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
    }
  ]

  return (
    <>
      <Grid container spacing={2} alignItems='stretch'>
        <Grid item xs={12} md={5} lg={4}>
          <Grid container direction='column' spacing={2}>
            <Grid item xs={12}>
              <Card>
                <CardHeader title='Fetch Astrometry' />
                <CardContent>
                  <Grid container spacing={2} alignItems='stretch' className={classes.padDropBox}>
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
                  <Grid container spacing={2} alignItems='stretch' className={classes.padDropBox}>
                    <Grid item xs={12}>
                      <Box sx={{ minWidth: 120 }}>
                        <FormControl fullWidth>
                          <InputLabel>Leap Second *</InputLabel>
                          <Select
                            id="lepSecond"
                            value={leapSecond}
                            label="Leap Second"
                            onChange={leapSecondhandleChange}
                          >
                            {populateLeapSecondOptions()}
                          </Select>
                        </FormControl>
                        {leapSecondError ? (<span className={classes.errorText}>Required field</span>) : ''}
                      </Box>
                    </Grid>
                  </Grid>
                  <Grid container spacing={2} alignItems='stretch' className={classes.padDropBox}>
                    <Grid item xs={12}>
                      <Box sx={{ minWidth: 120 }}>
                        {/* <FormControl fullWidth>
                          <TextField id="filterType" label="Filter Type *" size="small" value={filterType} onChange={(e) => setFilterType(e.target.value)} />
                        </FormControl> */}
                        <FormControl fullWidth>
                          <InputLabel>Filter Type *</InputLabel>
                          <Select
                            id="filterType"
                            value={filterType}
                            label="Filter Type"
                            onChange={filterTypehandleChange}
                          >
                            {populateFilterTypeOptions()}
                          </Select>
                        </FormControl>
                        {filterTypeError ? (<span className={classes.errorText}>Required field</span>) : ''}
                      </Box>
                    </Grid>
                  </Grid>
                  <Grid container spacing={2} alignItems='stretch' className={classes.padDropBox}>
                    <Grid item xs={12}>
                      <Box sx={{ minWidth: 120 }}>
                        {/* <FormControl fullWidth>
                          <TextField id="filterValue" label="Filter Value *" size="small" value={filterValue} onChange={(e) => setFilterValue(e.target.value)} />
                        </FormControl> */}
                        <FormControl fullWidth>
                          <InputLabel>Filter Value *</InputLabel>
                          <Select
                            id="filterValue"
                            value={filterValue}
                            label="Filter Value"
                            onChange={filterValuehandleChange}
                          >
                            {populateFilterValueOptions()}
                          </Select>
                        </FormControl>
                        {filterValueError ? (<span className={classes.errorText}>Required field</span>) : ''}
                      </Box>
                    </Grid>
                  </Grid>
                  <Grid container spacing={2} alignItems='stretch' className={classes.padDropBox}>
                    <Grid item xs={12}>
                      <Box sx={{ minWidth: 120 }}>                        
                        <FormControl fullWidth>
                          <InputLabel>BSP Value *</InputLabel>
                          <Select
                            id="bspValue"
                            value={bspValue}
                            label="BSP Value"
                            onChange={bspValuehandleChange}
                          >
                            {populateBspValueOptions()}
                          </Select>
                        </FormControl>
                        {bspValueError ? (<span className={classes.errorText}>Required field</span>) : ''}
                      </Box>
                    </Grid>
                  </Grid>
                  <Grid item spacing={2} xs={12} className={classes.pad}>                                     
                        <FormGroup>
                          <FormControlLabel
                            control={<Switch checked={debug} onChange={handleChangeDebug} />}
                            label='Debug mode'
                          />
                        </FormGroup>                       
                  </Grid>
                  <Grid item spacing={2}  xs={12}>
                      <Button variant='contained' color='primary' fullWidth onClick={handleSelectPeriodClick}>
                        Execute
                      </Button>
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
            <CardContent>
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
            </CardContent>
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
