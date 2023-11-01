import React, { useEffect, useState } from 'react'
import './predict.css'
import moment from 'moment'
import { useNavigate } from 'react-router-dom'
import {
  Grid,
  Card,
  CardHeader,
  CardContent,
  Button,
  FormControl,
  InputLabel,
  Snackbar,
  Backdrop,
  CircularProgress
} from '@material-ui/core'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Table from '../../components/Table'
import ColumnStatus from '../../components/Table/ColumnStatus'
import useInterval from '../../hooks/useInterval'
import {
  getDynClassList,
  getBaseDynClassList,
  getAsteroidsList,
  getCatalogList,
  getFilteredAsteroidsList
} from '../../services/api/Asteroid'
import {
  createPredictionJob,
  getPredictionJobList
} from '../../services/api/PredictOccultation'
import useStyles from './styles'
import FormGroup from '@mui/material/FormGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Box, IconButton, OutlinedInput, Tooltip } from '../../../node_modules/@material-ui/core/index'
import Select from 'react-select'
import { Alert } from '../../../node_modules/@material-ui/lab/index'
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(utc);
dayjs.extend(timezone);

function PredictOccultation() {
  const navigate = useNavigate()
  const classes = useStyles()
  const useMountEffect = (fun) => useEffect(fun, []);
  const [totalCount, setTotalCount] = useState(0)
  const [tableData, setTableData] = useState([])
  const [disableSubmit, setDisableSubmit] = useState(true)
  const [backdropOpen, setBackdropOpen] = useState(false)
  const [reload, setReload] = useState(true)

  const [hasJobRunningOrIdleFeedback, setHasJobRunningOrIdleFeedback] = useState(false)
  const [forceRefreshInputs, setForceRefreshInputs] = useState(false)

  const [filterTypeList, setFilterTypeList] = useState([{ value: 'name', label: 'Object name' }, { value: 'dynclass', label: 'Dynamic Class (with subclasses)' }, { value: 'base_dynclass', label: 'Dynamic Class' }]);
  const [dynClassList, setDynClassList] = useState([]);
  const [baseDynClassList, setBaseDynClassList] = useState([]);
  const [asteroidsList, setAsteroidsList] = useState([]);
  const [bspValueList, setbspValueList] = useState([{ value: 0, label: 'None' }, { value: 10, label: '10 days' }, { value: 20, label: '20 days' }, { value: 30, label: '30 days' }]);
  const [bspValue, setBspValue] = useState({ value: 0, label: "None" });
  const [catalogList, setCatalogList] = useState([{ value: 0, label: 'None' }]);
  const [catalog, setCatalog] = useState({ value: '', label: "None" });
  const [dateStart, setDateStart] = useState(dayjs.utc());
  const [dateEnd, setDateEnd] = useState(null);

  const [dateStartError, setDateStartError] = React.useState(false);
  const [dateEndError, setDateEndError] = React.useState(false);
  const [filterTypeError, setFilterTypeError] = React.useState(false);
  const [filterValueError, setFilteValueError] = React.useState(false);
  const [bspValueError, setBspValueError] = React.useState(false);
  const [catalogError, setCatalogError] = React.useState(false);
  const [predictStepError, setPredictStepError] = React.useState(false);

  const [filterType, setFilterType] = React.useState({ value: 'base_dynclass', label: 'Dynamic class' });
  const [filterValue, setFilterValue] = React.useState({ value: "", label: "Select..." });
  const [filterValueNames, setFilterValueNames] = React.useState([]);
  const [predictStep, setpredictStep] = React.useState('600');

  const [messageOpenSuccess, setMessageOpenSuccess] = useState(false);
  const [messageTextSuccess, setMessageTextSuccess] = React.useState('');

  const [messageOpenError, setMessageOpenError] = useState(false);
  const [messageTextError, setMessageTextError] = React.useState('');

  const [selectedSorting, setSelectedSorting] = useState();
  const [selectedPage, setSelectedPage] = useState(0);
  const [selectedPageSize, setSelectedPageSize] = useState(0);
  const [debug, setDebug] = React.useState(false);

  useEffect(() => {
    setDisableSubmit(!dateStart || !dateEnd || !filterValue.value || !filterType.value || !catalog.value);
  }, [dateStart, dateEnd, filterValue, filterType, catalog]);

  useMountEffect(() => {
    getDynClassList().then((list) => {
      setDynClassList(list.map(x => { return { value: x, label: x } }));
    })

    getBaseDynClassList().then((list) => {
      setBaseDynClassList(list.map(x => { return { value: x, label: x } }));
    })

    getAsteroidsList().then((list) => {
      setAsteroidsList(list.map(x => { return { value: x.name, label: x.name } }));
    })

    getCatalogList().then((list) => {
      setCatalogList(list.map(x => { return { value: x.name, label: x.display_name } }));
      if (list.length > 0)
        setCatalog({ value: list[0].name, label: list[0].display_name })
    })
  });


  const handleChangeDebug = (event) => {
    setDebug(event.target.checked)
  }

  const filterTypehandleChange = (event) => {
    if (event) {
      setFilterValue({ value: "", label: "Select..." });
      setFilterValueNames([]);
      setFilterType(event);
    }
  };

  const filterValueNameshandleChange = (event) => {
    if (event) {
      let stringArray = event.map(x => { return x.value }).toString().replaceAll(',', ';');
      setFilterValue({ value: stringArray, label: stringArray });
      setFilterValueNames(event.map(x => { return x.value }));
    }
  };

  const filterValuehandleChange = (event) => {
    if (event) {
      setFilterValueNames([]);
      setFilterValue(event);
    }
  };

  const handleChangeForceRefreshInputs = (event) => {
    setForceRefreshInputs(event.target.checked)
  }

  const bspValuehandleChange = (event) => {
    if (event)
      setBspValue(event);
  };

  const CataloghandleChange = (event) => {
    if (event)
      setCatalog(event);
  };

  function formatDate(date) {
    var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2)
      month = '0' + month;
    if (day.length < 2)
      day = '0' + day;

    return [year, month, day].join('-');
  }

  const calculateDate = (filter) => {
    const currentDate = dateStart;
    var dateEnd = dayjs(new Date());

    switch (filter) {
      case '1week':
        dateEnd = dayjs(currentDate).add(7, 'day');
        break;
      case '1mounth':
        dateEnd = dayjs(currentDate).add(1, 'month');
        dateEnd = dayjs(dateEnd.add(-1, 'day'));
        break;
      case '6mounths':
        dateEnd = dayjs(currentDate).add(6, 'month');
        dateEnd = dayjs(dateEnd.add(-1, 'day'));
        break;
      case '1year':
        dateEnd = dayjs(currentDate).add(1, 'year');
        dateEnd = dayjs(dateEnd.add(-1, 'day'));
        break;
    }

    setDateEnd(dateEnd);
  }

  function currentDate() {
    var d = new Date(),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2)
      month = '0' + month;
    if (day.length < 2)
      day = '0' + day;

    return [year, month, day].join('-');
  }

  const handleSubmitJobClick = async () => {

    if (await validadeInformation()) {
      setDisableSubmit(true);
      const data = {
        date_initial: formatDate(dateStart),
        date_final: formatDate(dateEnd),
        filter_type: filterType.value,
        filter_value: filterValue.value,
        predict_step: predictStep,
        catalog: catalog.value,
        debug: debug
      }
      createPredictionJob(data)
        .then((response) => {
          setDateStart(dayjs.utc());
          setDateEnd("");
          setFilterType({ value: 'base_dynclass', label: 'Dynamic class' });
          setFilterValue({ value: "", label: "Select..." });
          setCatalog({ value: "", label: "Select..." });
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

  function validadeInformation() {
    var verify = true;
    setMessageTextError('');
    setMessageOpenError(false);
    setDateStartError(false);
    setDateEndError(false);
    setFilterTypeError(false);
    setFilteValueError(false);
    setBspValueError(false);
    setPredictStepError(false);

    if (dateStart == '') {
      verify = false;
      setDateStartError(true);
    }

    if (dateEnd == '') {
      verify = false;
      setDateEndError(true);
    }

    if (predictStep == '') {
      verify = false;
      setPredictStepError(true);
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

  const loadData = ({ sorting, pageSize, currentPage }) => {
    setSelectedSorting(sorting)
    setSelectedPageSize(pageSize)
    setSelectedPage(currentPage)
    const ordering = sorting[0].direction === 'desc' ? `-${sorting[0].columnName}` : sorting[0].columnName;
    getPredictionJobList({
      page: currentPage + 1,
      pageSize,
      ordering: ordering
    }).then((res) => {
      const { data } = res
      setTableData(
        data.results.map((row) => ({
          key: row.id,
          detail: `/dashboard/data-preparation/predict-detail/${row.id}`,
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
      sortingEnabled: false,
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
      customElement: (row) => (row.exec_time ? row.exec_time.split('.')[0] : null)
    },
    {
      name: 'count_asteroids',
      title: 'Asteroids',
      width: 130,
      align: 'center',
    },
    {
      name: 'count_asteroids_with_occ',
      title: 'Ast WO',
      width: 130,
      align: 'center',
      headerTooltip: 'Asteroids with Occultations'
    },
    {
      name: 'count_occ',
      title: 'Occultations',
      width: 130,
      align: 'center',
    },
    {
      name: 'count_success',
      title: 'Success',
      width: 130,
      align: 'center',
    },
    {
      name: 'count_failures',
      title: 'Failures',
      width: 130,
      align: 'center',
    },
    {
      name: 'avg_exec_time',
      title: 'Average Execution Time',
      width: 130,
      align: 'center',
      customElement: (row) => (moment.utc(row.avg_exec_time * 1000).format("HH:mm:ss"))
    },
  ]

  // Reload data if we have any Skybot job running,
  // so we can follow its progress in real time.
  useInterval(() => {
    const hasStatusRunning = tableData.filter((row) => row.status === 2).length > 0

    if (hasStatusRunning) {
      setReload(!reload)
    }
  }, 10000)

  const onKeyUp = async (event) => {
    if (event.target.value.length > 1) {
      getFilteredAsteroidsList(event.target.value).then((list) => {
        setAsteroidsList(list.map(x => { return { value: x.name, label: x.name } }));
      })
    }
  }

  useInterval(() => {
    if (selectedSorting) {
      loadData(({ sorting: selectedSorting, pageSize: selectedPageSize, currentPage: selectedPage }));
    }
  }, [5000]);

  return (
    <>
      <Grid container spacing={2} alignItems='stretch'>
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Card>
                <CardHeader title='Predict Occultation Run' />
                <CardContent>
                  <Grid container spacing={2} alignItems='stretch' className={classes.padDropBox}>

                    <Grid item xs={12} sm={12} md={6}>
                      <label>Period for prediction<span className={classes.errorText}>*</span></label>
                      <Box variant="outlined" className="cardBoder">
                        <CardContent>
                          <Grid container spacing={2} alignItems='stretch' className={classes.padDropBox}>
                            <Grid item xs={12} sm={6} md={6} lg={3}>
                              <Button color='primary' size="small" variant='contained' fullWidth onClick={() => calculateDate('1week')}>
                                1 Week
                              </Button>
                            </Grid>
                            <Grid item xs={12} sm={6} md={6} lg={3}>
                              <Button color='primary' size="small" variant='contained' fullWidth onClick={() => calculateDate('1mounth')}>
                                1 Month
                              </Button>
                            </Grid>
                            <Grid item xs={12} sm={6} md={6} lg={3}>
                              <Button color='primary' size="small" variant='contained' fullWidth onClick={() => calculateDate('6mounths')}>
                                6 Months
                              </Button>
                            </Grid>
                            <Grid item xs={12} sm={6} md={6} lg={3}>
                              <Button color='primary' size="small" variant='contained' fullWidth onClick={() => calculateDate('1year')}>
                                1 Year
                              </Button>
                            </Grid>
                          </Grid>
                          <Grid container spacing={2} alignItems='stretch' className={classes.padDropBox}>
                            <Grid item xs={12}>
                              <Box sx={{ minWidth: 120 }}>
                                <FormControl fullWidth><label>Initial date <span className={classes.errorText}>*</span></label>
                                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker format="YYYY-MM-DD" value={dateStart} onChange={date => { setDateStart(date) }} />
                                  </LocalizationProvider>
                                </FormControl>
                                {dateStartError ? (<span className={classes.errorText}>Required field</span>) : ''}
                              </Box>
                            </Grid>
                          </Grid>
                          <Grid container spacing={2} alignItems='stretch' className={classes.padDropBox}>
                            <Grid item xs={12}>
                              <Box sx={{ minWidth: 120 }}>
                                <FormControl fullWidth><label>Final date <span className={classes.errorText}>*</span></label>
                                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker format="YYYY-MM-DD" value={dateEnd} onChange={date => { setDateEnd(date) }} />
                                  </LocalizationProvider>
                                </FormControl>
                                {dateEndError ? (<span className={classes.errorText}>Required field</span>) : ''}
                              </Box>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={12} md={6}>
                      <Grid container spacing={2} alignItems='stretch' className={classes.padDropBox}>
                        <Grid item xs={12} sm={6} md={12} lg={6}>
                          <Box sx={{ minWidth: 120 }}>
                            <FormControl fullWidth><label>Filter Type <span className={classes.errorText}>*</span></label>
                              <Select
                                value={filterType}
                                id="filterType"
                                onChange={filterTypehandleChange}
                                options={filterTypeList}
                              />
                            </FormControl>
                            {filterTypeError ? (<span className={classes.errorText}>Required field</span>) : ''}
                          </Box>
                        </Grid>

                        {filterType.value != "" &&
                          <Grid item xs={12} sm={6} md={12} lg={6}>
                            <Box sx={{ minWidth: 120 }}>
                              {filterType.value == "name" && <FormControl onKeyUp={onKeyUp} fullWidth><label>Filter Value <span className={classes.errorText}>*</span></label>
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
                        <Grid item xs={12} sm={6} md={12} lg={6}>
                          <Box sx={{ minWidth: 120 }}>
                            <FormControl fullWidth><label>Star Catalog <span className={classes.errorText}>*</span></label>
                              <Select
                                value={catalog}
                                id="catalog"
                                label="Catalog"
                                onChange={CataloghandleChange}
                                options={catalogList}
                                menuPortalTarget={document.body}
                                menuPosition={'fixed'}
                              />
                            </FormControl>
                            {catalogError ? (<span className={classes.errorText}>Required field</span>) : ''}
                          </Box>
                        </Grid>
                        {/* <Grid item xs={12} sm={6} md={12} lg={6}>
                          <Box sx={{ minWidth: 120 }}>
                            <FormControl fullWidth><label>Input Expiration Time <span className={classes.errorText}>*</span></label>
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
                        </Grid> */}
                        <Grid item xs={12} sm={6} md={12} lg={6}>
                          <Box sx={{ minWidth: 120 }}>
                            <FormControl fullWidth><label className='label-tooltip-margin'> Ephemeris Step(s) <span className={classes.errorText}>*</span><Tooltip title={<label className={classes.tooltip}> Step in time, in seconds, to determine the positions of objects. 600 for distant objects and 60 for nearby objects.</label>}><IconButton><InfoOutlinedIcon /></IconButton>
                            </Tooltip></label> 
                              <OutlinedInput id="my-input" value={predictStep} className={classes.input} variant="outlined" onChange={(e) => setpredictStep(e.target.value)} />
                            </FormControl>
                            {predictStepError ? (<span className={classes.errorText}>Required field</span>) : ''}
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4} lg={4}>
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
                        {/* <Grid item xs={12} sm={6} md={12} lg={6}>
                          <Box sx={{ minWidth: 120 }}>
                            <FormControl fullWidth><label>Force Refresh Inputs ON/OFF</label>
                              <FormGroup>
                                <FormControlLabel
                                  control={<Switch checked={forceRefreshInputs} onChange={handleChangeForceRefreshInputs} color="primary" />}
                                  label='Force Refresh Inputs'
                                />
                              </FormGroup></FormControl>
                          </Box>
                        </Grid> */}
                        
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid container spacing={2} direction="row"
                    justifyContent="center"
                    alignItems="center">
                    <Box>
                      <Button variant='contained' disabled={disableSubmit} className="buttonFilter" color='primary' onClick={handleSubmitJobClick}>
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

export default PredictOccultation

