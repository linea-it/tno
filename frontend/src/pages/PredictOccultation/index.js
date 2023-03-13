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
import { InfoOutlined as InfoOutlinedIcon } from '@material-ui/icons'
import Table from '../../components/Table'
import ColumnStatus from '../../components/Table/ColumnStatus'
import useInterval from '../../hooks/useInterval'
import {
  getDynClassList,
  getBaseDynClassList,
  getAsteroidsList
} from '../../services/api/OrbitTrace'
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
import { Box, OutlinedInput } from '../../../node_modules/@material-ui/core/index'
import Select from 'react-select'

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

  const [filterTypeList, setFilterTypeList] = useState([{ value: 'Name', label: 'Name' }, { value: 'DynClass', label: 'DynClass' }, { value: 'Base DynClass', label: 'Base DynClass' }]);
  const [dynClassList, setDynClassList] = useState([]);
  const [baseDynClassList, setBaseDynClassList] = useState([]);
  const [asteroidsList, setAsteroidsList] = useState([]);
  const [bspValueList, setbspValueList] = useState([{ value: 0, label: 'None' }, { value: 10, label: '10 days' }, { value: 20, label: '20 days' }, { value: 30, label: '30 days' }]);
  const [bspValue, setBspValue] = useState({ value: 0, label: "None" });
  const [dateStart, setDateStart] = useState(moment());
  const [dateEnd, setDateEnd] = useState('');

  const [dateStartError, setDateStartError] = React.useState(false);
  const [dateEndError, setDateEndError] = React.useState(false);
  const [filterTypeError, setFilterTypeError] = React.useState(false);
  const [filterValueError, setFilteValueError] = React.useState(false);
  const [bspValueError, setBspValueError] = React.useState(false);
  const [predictStepError, setPredictStepError] = React.useState(false);

  const [filterType, setFilterType] = React.useState({ value: "", label: "Select..." });
  const [filterValue, setFilterValue] = React.useState({ value: "", label: "Select..." });
  const [filterValueNames, setFilterValueNames] = React.useState([]);
  const [predictStep, setpredictStep] = React.useState('600');

  const [messageOpenSuccess, setMessageOpenSuccess] = useState(false);
  const [messageTextSuccess, setMessageTextSuccess] = React.useState('');

  const [messageOpenError, setMessageOpenError] = useState(false);
  const [messageTextError, setMessageTextError] = React.useState('');

  useEffect(() => {
    setDisableSubmit(!dateStart || !dateEnd || !filterValue.value || !filterType.value);
  }, [dateStart, dateEnd, filterValue, filterType]);

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
  });

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
    var dateEnd = moment();

    switch (filter) {
      case '1week':
        dateEnd = moment(currentDate).add(7, 'days');
        break;
      case '1mounth':
        dateEnd = moment(currentDate).add(30, 'days');
        break;
      case '6mounths':
        dateEnd = moment(currentDate).add(180, 'days');
        break;
      case '1year':
        dateEnd = moment(currentDate).add(365, 'days');
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
        force_refresh_input: forceRefreshInputs.toString(),
        input_days_to_expire: bspValue.value.toString()
      }
      createPredictionJob(data)
        .then((response) => {
          setDateStart("");
          setDateEnd("");
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
    getPredictionJobList({
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

  return (
    <>
      <Grid container spacing={2} alignItems='stretch'>
        <Grid item xs={12} sm={8} md={6} lg={5}>
          <Grid container direction='column' spacing={2}>
            <Grid item xs={12}>
              <Card>
                <CardHeader title='Predict Occultation Run' />
                <CardContent>
                  <Grid container spacing={2} alignItems='stretch' className={classes.padDropBox}>
                    <Grid item xs={12}>
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
                      <label>Start and End Period<span className={classes.errorText}>*</span></label>
                      <Card variant="outlined" className="cardBoder">
                        <CardContent>
                          <Grid container spacing={2} alignItems='stretch' className={classes.padDropBox}>
                            <Grid item xs={12} sm={6} md={3}>
                              <Button color='primary' size="small" variant='contained' fullWidth onClick={() => calculateDate('1week')}>
                                1 Week
                              </Button>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <Button color='primary' size="small" variant='contained' fullWidth onClick={() => calculateDate('1mounth')}>
                                1 Month
                              </Button>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <Button color='primary' size="small" variant='contained' fullWidth onClick={() => calculateDate('6mounths')}>
                                6 Months
                              </Button>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <Button color='primary' size="small" variant='contained' fullWidth onClick={() => calculateDate('1year')}>
                                1 Year
                              </Button>
                            </Grid>
                          </Grid>
                          <Grid container spacing={2} alignItems='stretch' className={classes.padDropBox}>
                            <Grid item xs={12}>
                              <Box sx={{ minWidth: 120 }}>
                                <FormControl fullWidth><label>Date Start <span className={classes.errorText}>*</span></label>
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
                                <FormControl fullWidth><label>Date End <span className={classes.errorText}>*</span></label>
                                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker format="YYYY-MM-DD" value={dateEnd} onChange={date => { setDateEnd(date) }} />
                                  </LocalizationProvider>
                                </FormControl>
                                {dateEndError ? (<span className={classes.errorText}>Required field</span>) : ''}
                              </Box>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>

                  <Grid container spacing={2} alignItems='stretch' className={classes.padDropBox}>
                    <Grid item xs={12}>
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
                    </Grid>
                  </Grid>
                  <Grid container spacing={2} alignItems='stretch' className={classes.padDropBox}>
                    <Grid item xs={12}>
                      <Box sx={{ minWidth: 120 }}>
                        <FormControl fullWidth><label>Predict Step <span className={classes.errorText}>*</span></label>
                          <OutlinedInput id="my-input" value={predictStep} className={classes.input} variant="outlined" onChange={(e) => setpredictStep(e.target.value)} />
                        </FormControl>
                        {predictStepError ? (<span className={classes.errorText}>Required field</span>) : ''}
                      </Box>
                    </Grid></Grid>
                  <Grid item container spacing={2} xs={12} className={classes.pad}>
                    <Grid item xs={12}>
                      <Box sx={{ minWidth: 120 }}>
                        <FormGroup>
                          <FormControlLabel
                            control={<Switch checked={forceRefreshInputs} onChange={handleChangeForceRefreshInputs} color="primary" />}
                            label='Force Refresh Inputs'
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

