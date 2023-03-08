import React, { useEffect, useState, Component } from 'react'
import { Backdrop, Box, Snackbar, Button, Card, CardContent, CardHeader, CircularProgress, FormControl, Grid, InputLabel, MenuItem, TextField, FormGroup, FormControlLabel, Typography, Switch, OutlinedInput } from '../../../node_modules/@material-ui/core/index'
import Table from '../../components/Table/index'
import moment from '../../../node_modules/moment/moment'
import useStyles from './styles'
import { useNavigate } from '../../../node_modules/react-router-dom/dist/index'

import {
  getLeapSecondList,
  getBspPlanetaryList,
  createOrbitTraceJob,
  getOrbitTraceJobList,
  getDynClassList,
  getBaseDynClassList,
  getAsteroidsList
} from '../../services/api/OrbitTrace'
import { Alert } from '../../../node_modules/@material-ui/lab/index'
import ColumnStatus from '../../components/Table/ColumnStatus'
import { InfoOutlined as InfoOutlinedIcon } from '@material-ui/icons'
import Select from 'react-select'

function OrbitTrace() {
  const navigate = useNavigate();
  const classes = useStyles();

  const [backdropOpen, setBackdropOpen] = useState(false);
  const [reload, setReload] = useState(true);
  const [bspPlanetaryList, setBspPlanetaryList] = useState([]);
  const [leapSecondList, setLeapSecondList] = useState([]);
  const [filterTypeList, setFilterTypeList] = useState([{ value: 'Name', label: 'Name' }, { value: 'DynClass', label: 'DynClass' }, { value: 'Base DynClass', label: 'Base DynClass' }]);
  const [dynClassList, setDynClassList] = useState([]);
  const [baseDynClassList, setBaseDynClassList] = useState([]);
  const [asteroidsList, setAsteroidsList] = useState([]);
  const [bspValueList, setbspValueList] = useState([{ value: 0, label: 'None' }, { value: 10, label: '10 days' }, { value: 20, label: '20 days' }, { value: 30, label: '30 days' }]);

  const [messageOpenSuccess, setMessageOpenSuccess] = useState(false);
  const [messageTextSuccess, setMessageTextSuccess] = React.useState('');

  const [messageOpenError, setMessageOpenError] = useState(false);
  const [messageTextError, setMessageTextError] = React.useState('');

  const [bspPlanetaryError, setBspPlanetaryError] = React.useState(false);
  const [leapSecondError, setLeapSecondError] = React.useState(false);
  const [filterTypeError, setFilterTypeError] = React.useState(false);
  const [filterValueError, setFilteValueError] = React.useState(false);
  const [bspValueError, setBspValueError] = React.useState(false);

  const [bspPlanetary, setBspPlanetary] = React.useState({ value: "", label: "Select..." });
  const [leapSecond, setLeapSecond] = React.useState({ value: "", label: "Select..." });
  const [filterType, setFilterType] = React.useState({ value: "", label: "Select..." });
  const [filterValue, setFilterValue] = React.useState({ value: "", label: "Select..." });
  const [bspValue, setBspValue] = React.useState({ value: 0, label: "None" });
  const [filterValueNames, setFilterValueNames] = React.useState([]);

  const [tableData, setTableData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const useMountEffect = (fun) => useEffect(fun, []);
  const [debug, setDebug] = React.useState(false);
  const [disableSubmit, setDisableSubmit] = useState(true);

  useEffect(() => {
    setDisableSubmit(!bspPlanetary.value || !leapSecond.value || !filterValue.value || !filterType.value);
  }, [bspPlanetary, leapSecond, filterValue, filterType]);

  const handleChangeDebug = (event) => {
    setDebug(event.target.checked)
  }

  const bspPlanetaryhandleChange = (event) => {
    if (event)
      setBspPlanetary(event);

  };

  const leapSecondhandleChange = (event) => {
    if (event)
      setLeapSecond(event);
  };

  const filterTypehandleChange = (event) => {
    if (event) {
      setFilterValue({ value: "", label: "Select..." });
      setFilterValueNames([]);
      setFilterType(event);
    }
  };

  const bspValuehandleChange = (event) => {
    if (event)
      setBspValue(event);
  };

  const filterValuehandleChange = (event) => {
    if (event) {
      setFilterValueNames([]);
      setFilterValue(event);
    }
  };

  const filterValueNameshandleChange = (event) => {
    if (event) {
      let stringArray = event.map(x => { return x.value }).toString().replaceAll(',', ';');
      setFilterValue({ value: stringArray, label: stringArray });
      setFilterValueNames(event.map(x => { return x.value }));
    }
  };

  useMountEffect(() => {
    getBspPlanetaryList().then((list) => {
      setBspPlanetaryList(list.map(x => { return { value: x.name, label: x.name } }));
      //set default value 
      setBspPlanetary({ value: list[0].name, label: list[0].name })
    })

    getLeapSecondList().then((list) => {
      setLeapSecondList(list.map(x => { return { value: x.name, label: x.name } }));
    })

    getDynClassList().then((list) => {
      setDynClassList(list.map(x => { return { value: x, label: x } }));
    })

    getBaseDynClassList().then((list) => {
      setBaseDynClassList(list.map(x => { return { value: x, label: x } }));
    })

    getAsteroidsList().then((list) => {
      setAsteroidsList(list.map(x => { return { value: x.name, label: x.name } }));
    })

  });

  function validadeInformation() {
    var verify = true;
    setMessageTextError('');
    setMessageOpenError(false);
    setBspPlanetaryError(false);
    setLeapSecondError(false);
    setFilterTypeError(false);
    setFilteValueError(false);
    setBspValueError(false);

    if (bspPlanetary.value == '') {
      verify = false;
      setBspPlanetaryError(true);
    }

    if (leapSecond.value == '') {
      verify = false;
      setLeapSecondError(true);
    }

    if (filterType.value == '') {
      verify = false;
      setFilterTypeError(true);
    }

    if (filterValue.value == '') {
      verify = false;
      setFilteValueError(true);
    }

    if (!verify) {
      setMessageTextError('All information must be completed.');
      setMessageOpenError(true);
    }

    return verify;
  }


  const handleSubmitJobClick = async () => {

    if (await validadeInformation()) {
      setDisableSubmit(true);
      const data = {
        bsp_planetary: bspPlanetary.value,
        leap_second: leapSecond.value,
        filter_type: filterType.value,
        filter_value: filterValue.value,
        bps_days_to_expire: bspValue.value.toString(),
        debug: debug.toString()

      }
      createOrbitTraceJob(data)
        .then((response) => {
          setBspPlanetary({ value: "", label: "Select..." });
          setLeapSecond({ value: "", label: "Select..." });
          setFilterType({ value: "", label: "Select..." });
          setFilterValue({ value: "", label: "Select..." });
          setBspValue({ value: 0, label: "None" });
          setMessageTextSuccess('Information registered successfully');
          setMessageOpenSuccess(true);
          setReload((prevState) => !prevState);
          setDisableSubmit(false);
        })
        .catch((err) => {
          console.log(err)
          setMessageTextError(err);
          setMessageOpenError(true);
        })
    }
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
          key: row.id,
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
      align: 'center',
      customElement: (row) => <ColumnStatus status={row.status} title={row.error} />
    },
    {
      name: 'owner',
      title: 'Owner',
      width: 130,
      align: 'center',
    },
    {
      name: 'start',
      title: 'Execution Date',
      width: 150,
      align: 'center',
      customElement: (row) => row.start ? <span title={moment(row.start).format('HH:mm:ss')}>{moment(row.start).format('YYYY-MM-DD')}</span> : <span>Not started</span>
    },
    {
      name: 'execution_time',
      title: 'Execution Time',
      width: 150,
      headerTooltip: 'Execution time',
      align: 'center',
      customElement: (row) => (row.exec_time ? row.exec_time.split('.')[0] : null)
    },
    {
      name: 'count_asteroids',
      title: 'Count Asteroids',
      width: 130,
      align: 'center',
      customElement: (row) => <span title={moment(row.start).format('HH:mm:ss')}>{row.count_asteroids}</span>
    },
    {
      name: 'count_ccds',
      title: 'Count ccds',
      width: 130,
      align: 'center',
      customElement: (row) => <span title={moment(row.finish).format('HH:mm:ss')}>{row.count_ccds}</span>
    },
    {
      name: 'count_success',
      title: 'count_success',
      width: 130,
      align: 'center',
      customElement: (row) => <span title={moment(row.finish).format('HH:mm:ss')}>{row.count_success}</span>
    },
    {
      name: 'count_failures',
      title: 'Count Failures',
      width: 130,
      align: 'center',
      customElement: (row) => <span title={moment(row.finish).format('HH:mm:ss')}>{row.count_failures}</span>
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
                        <FormControl fullWidth><label>Bsp Planetary <span className={classes.errorText}>*</span></label>
                          <Select
                            value={bspPlanetary}
                            name="bspPlanetary"
                            onChange={bspPlanetaryhandleChange}
                            options={bspPlanetaryList}
                            style={{height:'45px !important'}}
                            menuPortalTarget={document.body}
                            menuPosition={'fixed'}
                          />
                        </FormControl>
                        {bspPlanetaryError ? (<span className={classes.errorText}>Required field</span>) : ''}
                      </Box>
                    </Grid>
                  </Grid>
                  <Grid container spacing={2} alignItems='stretch' className={classes.padDropBox}>
                    <Grid item xs={12}>
                      <Box sx={{ minWidth: 120 }}>
                        <FormControl fullWidth><label>Leap Second <span className={classes.errorText}>*</span></label>
                          <Select
                            value={leapSecond}
                            id="leapSecond"
                            onChange={leapSecondhandleChange}
                            options={leapSecondList}
                            menuPortalTarget={document.body}
                            menuPosition={'fixed'}                            
                          />
                        </FormControl>
                        {leapSecondError ? (<span className={classes.errorText}>Required field</span>) : ''}
                      </Box>
                    </Grid>
                  </Grid>
                  <Grid container spacing={2} alignItems='stretch' className={classes.padDropBox}>
                    <Grid item xs={12}>
                      <Box sx={{ minWidth: 120 }}>
                        <FormControl fullWidth><label>Filter Type <span className={classes.errorText}>*</span></label>
                          <Select
                            value={filterType}
                            id="filterType"
                            onChange={filterTypehandleChange}
                            options={filterTypeList}
                            menuPortalTarget={document.body}
                            menuPosition={'fixed'}
                          />
                        </FormControl>
                        {filterTypeError ? (<span className={classes.errorText}>Required field</span>) : ''}
                      </Box>
                    </Grid>
                  </Grid>
                  {filterType.value != "" &&
                    <Grid container spacing={2} alignItems='stretch' className={classes.padDropBox}>
                      <Grid item xs={12}>
                        <Box sx={{ minWidth: 120 }}>
                          {filterType.value == "Name" && <FormControl fullWidth><label>Filter Value <span className={classes.errorText}>*</span></label>
                            <InputLabel></InputLabel>
                            <Select
                              id="filterName"
                              onChange={filterValueNameshandleChange}
                              isMulti
                              options={asteroidsList}
                              menuPortalTarget={document.body}
                              menuPosition={'fixed'}
                            />
                          </FormControl>}
                          {filterType.value == "DynClass" && <FormControl fullWidth><label>Filter Value <span className={classes.errorText}>*</span></label>
                            <Select
                              value={filterValue}
                              id="filterDynClass"
                              onChange={filterValuehandleChange}
                              options={dynClassList}
                              menuPortalTarget={document.body}
                              menuPosition={'fixed'}
                            />
                          </FormControl>}
                          {filterType.value == "Base DynClass" && <FormControl fullWidth><label>Filter Value <span className={classes.errorText}>*</span></label>
                            <Select
                              value={filterValue}
                              id="filterBaseDynClass"
                              onChange={filterValuehandleChange}
                              options={baseDynClassList}
                              menuPortalTarget={document.body}
                              menuPosition={'fixed'}
                            />
                          </FormControl>}
                          {filterValueError ? (<span className={classes.errorText}>Required field</span>) : ''}
                        </Box>
                      </Grid>
                    </Grid>
                  }
                  <Grid container spacing={2} alignItems='stretch' className={classes.padDropBox}>
                    <Grid item xs={12}>
                      <Box sx={{ minWidth: 120 }}>
                        <FormControl fullWidth><label>BSP File Expiration Time <span className={classes.errorText}>*</span></label>
                          <Select
                            value={bspValue}
                            id="bspValue"
                            label="BSP Value"
                            onChange={bspValuehandleChange}
                            options={bspValueList}
                            menuPortalTarget={document.body}
                            menuPosition={'fixed'}                           
                          />
                        </FormControl>
                        {bspValueError ? (<span className={classes.errorText}>Required field</span>) : ''}
                      </Box>
                    </Grid>
                  </Grid>
                  <Grid item container spacing={2} xs={12} className={classes.pad}>
                    <Grid item xs={12}>
                      <Box sx={{ minWidth: 120 }}>
                        <FormGroup>
                          <FormControlLabel
                            control={<Switch checked={debug} onChange={handleChangeDebug} color="primary" />}
                            label='Debug mode'
                          />
                        </FormGroup>
                      </Box>
                    </Grid>
                  </Grid>
                  <Grid container spacing={2} alignItems='stretch'>
                    <Grid item xs={12}>
                      <Box>
                        <Button disabled={disableSubmit} variant='contained' color='primary' fullWidth onClick={handleSubmitJobClick}>
                          Execute
                        </Button>
                      </Box>
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
