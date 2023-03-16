import React, { useEffect, useState } from 'react';
import moment from 'moment';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Slider,
  TextField,
  MenuItem,
  Box,
  Button,
  FormControl,

} from '@material-ui/core';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { getOccultations } from '../../services/api/Occultation';
import Image from '../../components/List/Image';
import useStyles from './styles'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import {
  getDynClassList,
  getBaseDynClassList,
  getAsteroidsList
} from '../../services/api/Asteroid'
import Select from 'react-select'
import { InfoOutlined as InfoOutlinedIcon } from '@material-ui/icons'
import { useNavigate } from '../../../node_modules/react-router-dom/dist/index'
import Table from '../../components/Table/index'

function Occultation() {
  const navigate = useNavigate();
  const classes = useStyles()
  const [magnitude, setMagnitude] = useState([4, 23]);
  const [diameter, setDiameter] = useState([0, 600]);
  const [zoneValue, setZoneValue] = useState('');
  const pageSize = 25;
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [dateStartError, setDateStartError] = useState(false);
  const [dateEndError, setDateEndError] = useState(false);
  const [filterTypeList, setFilterTypeList] = useState([{ value: 'Name', label: 'Name' }, { value: 'DynClass', label: 'DynClass' }, { value: 'Base DynClass', label: 'Base DynClass' }]);
  const [dynClassList, setDynClassList] = useState([]);
  const [baseDynClassList, setBaseDynClassList] = useState([]);
  const [asteroidsList, setAsteroidsList] = useState([]);
  const [filterType, setFilterType] = useState('');
  const [filterValue, setFilterValue] = useState('');
  const [filterValueNames, setFilterValueNames] = useState([]);
  const useMountEffect = (fun) => useEffect(fun, []);
  const [tableData, setTableData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [reload, setReload] = useState(true);

  const tableColumns = [
    {
      name: 'index',
      title: ' ',
      width: 70
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
      name: 'name',
      title: 'Name',
      align: 'center',
    },
    {
      name: 'number',
      title: 'Number',
      align: 'center',
    },
    {
      name: 'date_time',
      title: 'Observation Date',
      width: 150,
      sortingEnabled: false,
      customElement: (row) => (row.date_time ? moment(row.date_time).format('YYYY-MM-DD HH:mm:ss') : '-')
    },
  ]

  const filterTypehandleChange = (event) => {
    if (event) {
      setFilterValue("");
      setFilterValueNames([]);
      setFilterType(event);
    }
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
      // @ts-ignore
      setFilterValue({ value: stringArray, label: stringArray });
      setFilterValueNames(event.map(x => { return x.value }));
    }
  };

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

  const handleDiameter = (event, value) => {
    setDiameter(value);
  };

  const handleChangeZone = (event) => {
    setZoneValue(event.target.value);
  };

  const handleChangeMagnitudeValue = (event, value) => {
    setMagnitude(value);
  };

  const zoneArray = [
    { value: 'East-Asia', label: 'East-Asia' },
    { value: 'Europe & North Africa', label: 'Europe & North Africa' },
    { value: 'Oceania', label: 'Oceania' },
    { value: 'Southern Africa', label: 'Southern Africa', },
    { value: 'North America', label: 'North America' },
    { value: 'South America', label: 'South America' },
  ];

  const calculateDate = (filter) => {
    const currentDate = dateStart ? dateStart : moment();
    setDateStart(currentDate);
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


  const loadData = ({ sorting, pageSize, currentPage }) => {
    getOccultations({
      page: currentPage + 1,
      pageSize,
      ordering: sorting,
      start_date: null, 
      end_date: null, 
      filter_type: null, 
      filter_value: null
    }).then((res) => {
      const { data } = res
      setTableData(
        data.results.map((row) => ({
          key: row.id,
          detail: `/occultation_detail/${row.id}`,
          ...row
        }))
      )
      setTotalCount(data.count)
    })
  }

  const handleFilterClick = async () => {

    const start = dateStart? new Date(dateStart).toISOString().slice(0, 10) +' 00:00:00': null;
    const end = dateEnd? new Date(dateEnd).toISOString().slice(0, 10) +' 23:59:59': null;

    getOccultations({
      page: 1,
      pageSize,
      ordering: null,
      start_date: start, 
      end_date: end,
      // @ts-ignore
      filter_type: filterType.value.toLowerCase(), 
      // @ts-ignore
      filter_value: filterValue.value
    }, ).then((res) => {
      const { data } = res
      setTableData(
        data.results.map((row) => ({
          key: row.id,
          detail: `/occultation_detail/${row.id}`,
          ...row
        }))
      )
      setTotalCount(data.count)
    })
  }

  return (
    <Grid>
      <Grid container spacing={3}>
        <Grid item lg={12}>
          <Card>
            <CardContent>
              <form noValidate autoComplete="off">
                <Grid container item lg={12} alignItems='stretch' className={classes.padDropBox}>
                  <Typography gutterBottom variant="body2">
                    {`Magnitude(g): ${magnitude}`}
                  </Typography>
                  <Slider
                    value={magnitude}
                    step={1}
                    min={4}
                    max={23}
                    valueLabelDisplay="auto"
                    onChange={handleChangeMagnitudeValue}
                    disabled
                  />
                </Grid>
                <Grid container item lg={12} alignItems='stretch' className={classes.padDropBox}>
                  <Typography gutterBottom variant="body2">
                    {`Diameter(Km): ${diameter}`}
                  </Typography>
                  <Slider
                    value={diameter}
                    step={50}
                    min={0}
                    max={5000}
                    valueLabelDisplay="auto"
                    onChange={handleDiameter}
                    disabled
                  />
                </Grid>
                <Grid container spacing={2}>
                  <Grid container item xs={12} md={4} alignItems='stretch' className={classes.padDropBox}>
                    <Grid item xs={12}>
                      <label>Start and End Period</label>
                      <Box variant="outlined" className="cardBoder">
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
                                <FormControl fullWidth><label>Date Start</label>
                                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker format="YYYY-MM-DD" value={dateStart} onChange={date => { setDateStart(date) }} />
                                  </LocalizationProvider>
                                </FormControl>
                                {/* {dateStartError ? (<span className={classes.errorText}>Required field</span>) : ''} */}
                              </Box>
                            </Grid>
                          </Grid>
                          <Grid container spacing={2} alignItems='stretch' className={classes.padDropBox}>
                            <Grid item xs={12}>
                              <Box sx={{ minWidth: 120 }}>
                                <FormControl fullWidth><label>Date End</label>
                                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker format="YYYY-MM-DD" value={dateEnd} onChange={date => { setDateEnd(date) }} />
                                  </LocalizationProvider>
                                </FormControl>
                                {/* {dateEndError ? (<span className={classes.errorText}>Required field</span>) : ''} */}
                              </Box>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Box>
                    </Grid>
                  </Grid>
                  <Grid container item xs={12} md={8}>
                    <Grid item xs={12}>
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
                    </Grid>
                  </Grid>
                </Grid>
                <Grid container item lg={4} alignItems='stretch' className={classes.padDropBox}>
                  <Grid item xs={12}>
                    <Box sx={{ minWidth: 120 }}>
                      <FormControl fullWidth><label>Zone</label>
                        <Select
                          value={zoneValue}
                          id="filterZone"
                          onChange={handleChangeZone}
                          options={zoneArray}
                          menuPortalTarget={document.body}
                          menuPosition={'fixed'}
                        />
                      </FormControl>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ minWidth: 120 }}>
                      <FormControl fullWidth><label>Filter Type</label>
                        <Select
                          value={filterType}
                          id="filterType"
                          onChange={filterTypehandleChange}
                          options={filterTypeList}
                          menuPortalTarget={document.body}
                          menuPosition={'fixed'}
                        />
                      </FormControl>
                    </Box>
                  </Grid>
                  {filterType.value != "" &&
                    <Grid container spacing={2} alignItems='stretch' className={classes.padDropBox}>
                      <Grid item xs={12}>
                        <Box sx={{ minWidth: 120 }}>
                          {filterType.value == "Name" && <FormControl fullWidth><label>Filter Value</label>
                            <Select
                              id="filterName"
                              onChange={filterValueNameshandleChange}
                              isMulti
                              options={asteroidsList}
                              menuPortalTarget={document.body}
                              menuPosition={'fixed'}
                            />
                          </FormControl>}
                          {filterType.value == "DynClass" && <FormControl fullWidth><label>Filter Value</label>
                            <Select
                              value={filterValue}
                              id="filterDynClass"
                              onChange={filterValuehandleChange}
                              options={dynClassList}
                              menuPortalTarget={document.body}
                              menuPosition={'fixed'}
                            />
                          </FormControl>}
                          {filterType.value == "Base DynClass" && <FormControl fullWidth><label>Filter Value</label>
                            <Select
                              value={filterValue}
                              id="filterBaseDynClass"
                              onChange={filterValuehandleChange}
                              options={baseDynClassList}
                              menuPortalTarget={document.body}
                              menuPosition={'fixed'}
                            />
                          </FormControl>}

                        </Box>

                      </Grid>
                    </Grid>
                  }
                </Grid>
                <Grid container item lg={4} alignItems='stretch' className={classes.padDropBox}>
                  <Grid item xs={12}>
                    <Box>
                      <Button variant='contained' color='primary' fullWidth onClick={handleFilterClick}>
                        Filter
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Grid >
  );
}

export default Occultation
