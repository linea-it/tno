import React, { useEffect, useState, Component } from 'react'
import { Backdrop, Box, Snackbar, Button, Card, CardContent, CardHeader, CircularProgress, FormControl, Grid, InputLabel, MenuItem, TextField, FormGroup, FormControlLabel, Typography, Switch, OutlinedInput, IconButton, Tooltip } from '../../../node_modules/@material-ui/core/index'
import Table from '../../components/Table/index'
import moment from '../../../node_modules/moment/moment'
import useStyles from './styles'
import { useNavigate } from '../../../node_modules/react-router-dom/dist/index'

import {
  getLeapSecondList,
  getBspPlanetaryList,
  createOrbitTraceJob,
  getOrbitTraceJobList,
} from '../../services/api/OrbitTrace'
import {
  getDynClassList,
  getBaseDynClassList,
  getAsteroidsList,
  getFilteredAsteroidsList,
} from '../../services/api/Asteroid'
import { Alert } from '../../../node_modules/@material-ui/lab/index'
import ColumnStatus from '../../components/Table/ColumnStatus'
import { InfoOutlined as InfoOutlinedIcon } from '@material-ui/icons'
import Select from 'react-select'
import './orbittrace.css'
import useInterval from '../../hooks/useInterval'
import { Pages } from '../../../node_modules/@material-ui/icons/index'

function OrbitTrace() {
  const navigate = useNavigate();
  const classes = useStyles();

  const [backdropOpen, setBackdropOpen] = useState(false);
  const [reload, setReload] = useState(true);
  const [bspPlanetaryList, setBspPlanetaryList] = useState([]);
  const [leapSecondList, setLeapSecondList] = useState([]);
  const [filterTypeList, setFilterTypeList] = useState([{ value: 'name', label: 'Object name' }, { value: 'dynclass', label: 'Dynamic class (with subclasses)' }, { value: 'base_dynclass', label: 'Dynamic class' }]);
  const [dynClassList, setDynClassList] = useState([]);
  const [baseDynClassList, setBaseDynClassList] = useState([]);
  const [asteroidsList, setAsteroidsList] = useState([]);
  const [bspValueList, setbspValueList] = useState([{ value: 0, label: 'None' }, { value: 10, label: '10 days' }, { value: 20, label: '20 days' }, { value: 30, label: '30 days' }]);
  const [parslInitBlocksList, setParslInitBlocksList] = useState([{ value: 1, label: '1' }, { value: 50, label: '50' }, { value: 100, label: '100' }, { value: 300, label: '300' }, { value: 600, label: '600' }]);

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
  const [filterType, setFilterType] = React.useState({ value: 'base_dynclass', label: 'Base DynClass' });
  const [filterValue, setFilterValue] = React.useState({ value: "", label: "Select..." });
  const [bspValue, setBspValue] = React.useState({ value: 10, label: "10 days" });
  const [parslInitBlocks, setParslInitBlocks] = React.useState({ value: 600, label: "600" });
  const [filterValueNames, setFilterValueNames] = React.useState([]);

  const [tableData, setTableData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const useMountEffect = (fun) => useEffect(fun, []);
  const [debug, setDebug] = React.useState(false);
  const [disableSubmit, setDisableSubmit] = useState(true);

  const [selectedSorting, setSelectedSorting] = useState();
  const [selectedPage, setSelectedPage] = useState(0);
  const [selectedPageSize, setSelectedPageSize] = useState(0);


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

  const  parslInitBlockshandleChange = (event) => {
    if (event)
      setParslInitBlocks(event);
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
      if (list.length > 0)
        setBspPlanetary({ value: list[0].name, label: list[0].name })
    })

    getLeapSecondList().then((list) => {
      setLeapSecondList(list.map(x => { return { value: x.name, label: x.name } }));
      //set default value
      if (list.length > 0)
        setLeapSecond({ value: list[0].name, label: list[0].name })
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
        parsl_init_blocks: parslInitBlocks.value.toString(),
        debug: debug
      }
      createOrbitTraceJob(data)
        .then((response) => {
          navigate(`/data-preparation/des/orbittracedetail/${response.data.id}`)
          //cleanFields();
        })
        .catch((err) => {
          console.log(err)
          setMessageTextError(err);
          setMessageOpenError(true);
        })
    }
  }

  function cleanFields() {
    setBspPlanetary({ value: bspPlanetaryList[0].value, label: bspPlanetaryList[0].label })
    setLeapSecond({ value: "", label: "Select..." });
    setFilterType({ value: 'base_dynclass', label: 'Base DynClass' });
    setFilterValue({ value: "", label: "Select..." });
    setBspValue({ value: 0, label: "None" });
    setParslInitBlocks({ value: 600, label: "600" });
    setMessageTextSuccess('Information registered successfully');
    setMessageOpenSuccess(true);
    setReload((prevState) => !prevState);
    setDisableSubmit(false);
  }



  const loadData = ({ sorting, pageSize, currentPage }) => {
    setSelectedSorting(sorting)
    setSelectedPageSize(pageSize)
    setSelectedPage(currentPage)
    const ordering = sorting[0].direction === 'desc'? `-${sorting[0].columnName}`: sorting[0].columnName;

    getOrbitTraceJobList({
      page: currentPage + 1,
      pageSize,
      ordering: ordering
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

  // const getAverage = (exec_time, count_asteroids) =>{
  //   let data = exec_time.split(':')
  //   let hSeconds = (parseInt(data[0]) * 3600)
  //   let mSeconds = (parseInt(data[1]) * 60)
  //   let seconds = parseInt(data[2].split('.')[0])
  //   let totalSeconds = hSeconds + mSeconds + seconds
  //   return moment.utc(((totalSeconds / count_asteroids) * 1000)).format("HH:mm:ss.SSS")
  // }

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
      name: 'exec_time',
      title: 'Execution Time',
      width: 150,
      headerTooltip: 'Execution time',
      align: 'center',
      customElement: (row) => (row.exec_time ? row.exec_time.split('.')[0] : "-")
    },
    {
      name: 'avg_exec_time_asteroid',
      title: 'Average Execution Time Asteroid',
      width: 150,
      headerTooltip: 'Execution time',
      align: 'center',
      customElement: (row) => (row.avg_exec_time_asteroid ? row.avg_exec_time_asteroid.split('.')[0] : "-")
    },
    {
      name: 'avg_exec_time_ccd',
      title: 'Average Execution Time CCD',
      width: 150,
      headerTooltip: 'Execution time',
      align: 'center',
      customElement: (row) => (row.avg_exec_time_ccd ? row.avg_exec_time_ccd.split('.')[0] : "-")
    },
    {
      name: 'count_asteroids',
      title: 'Asteroids',
      width: 130,
      align: 'center',
      customElement: (row) => <span>{row.count_asteroids}</span>
    },
    {
      name: 'count_ccds',
      title: 'CCDs',
      width: 130,
      align: 'center',
      customElement: (row) => <span>{row.count_ccds}</span>
    },
    {
      name: 'count_observations',
      title: 'Observations',
      width: 130,
      align: 'center',
      customElement: (row) => <span>{row.count_observations}</span>
    },
    {
      name: 'count_success',
      title: 'Success',
      width: 130,
      align: 'center',
      customElement: (row) => <span>{row.count_success}</span>
    },
    {
      name: 'count_failures',
      title: 'Failures',
      width: 130,
      align: 'center',
      customElement: (row) => <span title={moment(row.end).format('HH:mm:ss')}>{row.count_failures}</span>
    }
  ]

  const onKeyUp = async (event) => {
    if(event.target.value.length > 1){
        getFilteredAsteroidsList(event.target.value).then((list) => {
          setAsteroidsList(list.map(x => { return { value: x.name, label: x.name } }));
        })
    }
  }

  useInterval(() => {
    if(selectedSorting){
      loadData(({sorting: selectedSorting, pageSize: selectedPageSize, currentPage: selectedPage}));
    }
  }, [5000]);

  return (
    <>
      <Grid container spacing={2} alignItems='stretch'>
        <Grid item xs={12}>
          <Grid container direction='row' spacing={2}>
            <Grid item xs={12}>
              <Card>
                <CardHeader title='Fetch Astrometry' />
                <CardContent>
                  <Grid container spacing={2} alignItems='stretch' className={classes.padDropBox}>
                    <Grid item xs={12} sm={6} md={4} lg={3}>
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
                    {filterType.value != "" &&
                      <Grid item xs={12} sm={6} md={4} lg={3}>
                        <Box sx={{ minWidth: 120 }}>
                          {filterType.value == "name" && <FormControl onKeyUp={onKeyUp} fullWidth><label>Filter Value <span className={classes.errorText}>*</span></label>
                            <Select
                              id="filterName"
                              onChange={filterValueNameshandleChange}
                              isMulti
                              options={asteroidsList}
                              menuPortalTarget={document.body}
                              menuPosition={'fixed'}
                            />
                          </FormControl>}
                          {filterType.value == "dynclass" && <FormControl fullWidth><label>Filter Value <span className={classes.errorText}>*</span></label>
                            <Select
                              value={filterValue}
                              id="filterDynClass"
                              onChange={filterValuehandleChange}
                              options={dynClassList}
                              menuPortalTarget={document.body}
                              menuPosition={'fixed'}
                            />
                          </FormControl>}
                          {filterType.value == "base_dynclass" && <FormControl fullWidth><label>Filter Value <span className={classes.errorText}>*</span></label>
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
                    }
                    <Grid item xs={12} sm={6} md={4} lg={3}>
                      <Box sx={{ minWidth: 120 }}>
                        <FormControl fullWidth><label>Planetary ephemerides <span className={classes.errorText}>*</span><Tooltip title={<label className={classes.tooltip}>Version of binary file that contains information to compute the ephemeris of the planets.</label>}><IconButton><InfoOutlinedIcon /></IconButton>
                            </Tooltip></label>
                          <Select
                            value={bspPlanetary}
                            name="bspPlanetary"
                            onChange={bspPlanetaryhandleChange}
                            options={bspPlanetaryList}
                            style={{ height: '45px !important' }}
                            menuPortalTarget={document.body}
                            menuPosition={'fixed'}
                          />
                        </FormControl>
                        {bspPlanetaryError ? (<span className={classes.errorText}>Required field</span>) : ''}
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} lg={3}>
                      <Box sx={{ minWidth: 120 }}>
                        <FormControl fullWidth><label>Leap Second <span className={classes.errorText}>*</span><Tooltip title={<label className={classes.tooltip}>Version of ascii file that contains dates of one-second adjustment that is occasionally applied to UTC.</label>}><IconButton><InfoOutlinedIcon /></IconButton>
                            </Tooltip></label>
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
                    {/* <Grid item xs={12} sm={6} md={4} lg={3}>
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
                    <Grid item xs={12} sm={6} md={4} lg={3}>
                      <Box sx={{ minWidth: 120 }}>
                        <FormControl fullWidth><label> Parsl Init Blocks <span className={classes.errorText}>*</span></label>
                          <Select
                            value={parslInitBlocks}
                            id=" parslinitBlocks"
                            label="Parsl Init Blocks"
                            onChange={parslInitBlockshandleChange}
                            options={parslInitBlocksList}
                            menuPortalTarget={document.body}
                            menuPosition={'fixed'}
                          />
                        </FormControl>
                        {bspValueError ? (<span className={classes.errorText}>Required field</span>) : ''}
                      </Box>
                    </Grid> */}
                    <Grid item xs={12} sm={6} md={4} lg={3}>
                      <Box sx={{ minWidth: 120 }}>
                      <FormControl fullWidth>
                          
                        <FormGroup>
                          <FormControlLabel
                            control={<Switch checked={debug} onChange={handleChangeDebug} color="primary" />}
                            label='Debug mode'
                          />
                        </FormGroup> </FormControl>
                      </Box>
                    </Grid>
                  </Grid>
                  <Grid container spacing={2} direction="row"
                    justifyContent="center"
                    alignItems="center">
                    <Box>
                      <Button disabled={disableSubmit} variant='contained' className="buttonFilter" color='primary' onClick={handleSubmitJobClick}>
                        Execute
                      </Button>
                    </Box>
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
                hasColumnVisibility={true}
                hasToolbar={true}
                reload={reload}
                totalCount={totalCount}
                defaultSorting={[{ columnName: 'id', direction: 'desc' }]}
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
