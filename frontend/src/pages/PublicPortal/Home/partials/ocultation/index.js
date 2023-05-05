import React, { useEffect, useState } from 'react';
import moment from 'moment';
import {
  Grid, Card, CardContent,
  Typography,
  Slider,
  Box,
  Button,
  FormControl
} from '@material-ui/core';
import Container from '@material-ui/core/Container';
import styles from './styles';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { getOccultations } from '../../../../../services/api/Occultation';
//import Image from '../../components/List/Image';
import {
  getDynClassList,
  getBaseDynClassList,
  getAsteroidsWithPredictionList,
  getFilteredWithPredictionList
} from '../../../../../services/api/Asteroid';
import Select from 'react-select';
import { InfoOutlined as InfoOutlinedIcon } from '@material-ui/icons';
import { CardHeader, MenuItem, OutlinedInput } from '../../../../../../node_modules/@material-ui/core/index';
import Table from '../../../../../components/Table/index';
import { useNavigate } from '../../../../../../node_modules/react-router-dom/dist/index';
import "./ocultation.css";

function PublicOcutation() {
  const navigate = useNavigate();
  const classes = styles();
  const [dateStartPeriod, setDateStartPeriod] = useState('');
  const [dateEndPeriod, setDateEndPeriod] = useState('');
  const [dateStartUser, setDateStartUser] = useState('');
  const [dateEndUser, setDateEndUser] = useState('');
  const [filterView, setFilterView] = useState('');
  const [magnitude, setMagnitude] = useState([4, 23]);
  const [diameter, setDiameter] = useState('0');
  const [zoneValue, setZoneValue] = useState('');
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
      name: 'date_time',
      title: 'Date',
      width: 200,
      customElement: (row) => (row.date_time ? moment(row.date_time).utc().format('YYYY-MM-DD HH:mm:ss') : '-')
    },
    {
      name: 'g',
      title: 'Mag',
      aligh: 'center',
    },
    {
      name: 'name',
      title: 'Object',
      align: 'center',
    },
    {
      name: 'dynclass',
      title: 'Class',
      align: 'center',
    },
    // {
    //   name: 'number',
    //   title: 'Number',
    //   align: 'center',
    // },

  ]

  const filterTypehandleChange = (event) => {
    if (event) {
      setFilterValue("");
      setFilterType(event);
    }
  };

  const filterValuehandleChange = (event) => {
    if (event) {
      setFilterValue(event);
    }
  };

  const filterValueNameshandleChange = (event) => {
    if (event) {
      let stringArray = event.map(x => { return x.value }).toString().replaceAll(',', ';');
      setFilterValue({ value: stringArray, label: stringArray });
    }
  };

  useMountEffect(() => {
    getDynClassList().then((list) => {
      setDynClassList(list.map(x => { return { value: x, label: x } }));
    })

    getBaseDynClassList().then((list) => {
      setBaseDynClassList(list.map(x => { return { value: x, label: x } }));
    })

    getAsteroidsWithPredictionList().then((list) => {
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
    const ordering = sorting[0].direction === 'desc' ? `-${sorting[0].columnName}` : sorting[0].columnName;
    const start = dateStart ? new Date(dateStart).toISOString().slice(0, 10) + ' 00:00:00' : null;
    const end = dateEnd ? new Date(dateEnd).toISOString().slice(0, 10) + ' 23:59:59' : null;
    const type = filterType.value ? filterType.value.toLowerCase().replaceAll(' ', '_') : null;
    const value = filterValue.value ? filterValue.value : null;
    const minmag = magnitude[0] > 4 ? magnitude[0] : null;
    const maxmag = magnitude[1] < 23 ? magnitude[1] : null;
    getOccultations({
      page: currentPage + 1,
      pageSize,
      ordering: ordering,
      start_date: start,
      end_date: end,
      filter_type: value ? type : null,
      filter_value: value,
      min_mag: minmag,
      max_mag: maxmag
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
    loadData({ sorting: [{ columnName: 'id', direction: 'asc' }], pageSize: 10, currentPage: 0 });
  }

  useEffect(() => {
    handleFilterClick();
  }, [dateStart, dateEnd, filterValue, magnitude]);

  const onKeyUp = async (event) => {
    if (event.target.value.length > 1) {
      getFilteredWithPredictionList(event.target.value).then((list) => {
        setAsteroidsList(list.map(x => { return { value: x.name, label: x.name } }));
      })
    }
  }

  return (
    <Container>
      <Grid container spacing={2}>
        <div className={classes.titleItem}><label>Occultation Filter</label></div>
      </Grid>
      <br></br>
      <Grid container spacing={1}>
        <Grid item xs={6} sm={3} className={classes.mouse} onClick={() => setFilterView('period')}>
          <div className={classes.celula}>Period</div>
        </Grid>
        <Grid item xs={6} sm={3} className={classes.mouse} onClick={() => setFilterView('')}>
          <div className={classes.celula}>All events</div>
        </Grid>
        <Grid item xs={6} sm={3} className={classes.mouse} onClick={() => setFilterView('')}>
          <div className={classes.celula}>Next 20 events</div>
        </Grid>
        <Grid item xs={6} sm={3} className={classes.mouse} onClick={() => setFilterView('userSelect')}>
          <div className={classes.celula}>User selected</div>
        </Grid>
      </Grid>
      {filterView == 'period' &&
        <><br></br><Grid container spacing={2}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <form noValidate autoComplete="off">
                  <Grid container spacing={2} alignItems='stretch'>
                    <Grid item xs={12} sm={4} md={3}>
                      <Box sx={{ minWidth: 120 }}>
                        <FormControl fullWidth ><label>Date Start</label>
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker format="YYYY-MM-DD" value={dateStartPeriod} onChange={date => { setDateStartPeriod(date) }} />
                          </LocalizationProvider>
                        </FormControl>
                      </Box>
                    </Grid>
                    <Grid item xs={7} sm={4} md={3}>
                      <Box sx={{ minWidth: 120 }}>
                        <FormControl fullWidth><label>Date End</label>
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker format="YYYY-MM-DD" value={dateEndPeriod} onChange={date => { setDateEndPeriod(date) }} />
                          </LocalizationProvider>
                        </FormControl>
                      </Box>
                    </Grid>
                    <Grid item xs={5} sm={4} md={2}>
                      <Box className={classes.btnPeriod}>
                        <Button variant='contained' className="buttonFilter" color='primary'>
                          Searcher
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </form>
              </CardContent>
            </Card>
          </Grid>
        </Grid></>
      }
      {filterView == 'userSelect' &&
        <><br></br><Grid container spacing={2}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <form noValidate autoComplete="off">
                  <Grid container spacing={2} alignItems='stretch'>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ minWidth: 120 }}>
                        <FormControl fullWidth ><label>Date Start</label>
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker format="YYYY-MM-DD" value={dateStartUser} onChange={date => { setDateStartUser(date) }} />
                          </LocalizationProvider>
                        </FormControl>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ minWidth: 120 }}>
                        <FormControl fullWidth><label>Date End</label>
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker format="YYYY-MM-DD" value={dateStartUser} onChange={date => { setDateEndUser(date) }} />
                          </LocalizationProvider>
                        </FormControl>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
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
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ minWidth: 120 }}>
                        <FormControl onKeyUp={onKeyUp} fullWidth><label>Filter Value</label>
                          {filterType.value == null &&
                            <Select
                              id="filter"
                              isDisabled
                              placeholder="Select Filter Value"
                              menuPortalTarget={document.body}
                              menuPosition={'fixed'}
                            />
                          }
                          {filterType.value == "Name" &&
                            <Select
                              id="filterName"
                              onChange={filterValueNameshandleChange}
                              isMulti
                              options={asteroidsList}
                              menuPortalTarget={document.body}
                              menuPosition={'fixed'}
                            />
                          }
                          {filterType.value == "DynClass" &&
                            <Select
                              value={filterValue}
                              id="filterDynClass"
                              onChange={filterValuehandleChange}
                              options={dynClassList}
                              menuPortalTarget={document.body}
                              menuPosition={'fixed'}
                            />
                          }
                          {filterType.value == "Base DynClass" &&
                            <Select
                              value={filterValue}
                              id="filterBaseDynClass"
                              onChange={filterValuehandleChange}
                              options={baseDynClassList}
                              menuPortalTarget={document.body}
                              menuPosition={'fixed'}
                            />
                          }
                        </FormControl>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
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
                    <Grid item xs={12} sm={6} md={3}>
                      <FormControl fullWidth><label>Magnitude ({magnitude.toString()})</label>
                        <Slider
                          value={magnitude}
                          step={1}
                          min={4}
                          max={23}
                          valueLabelDisplay="auto"
                          onChange={handleChangeMagnitudeValue}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <FormControl fullWidth><label>Diameter (0 and 600Km)</label>
                        <OutlinedInput disabled id="my-input" value={diameter} className={classes.input} variant="outlined" onChange={(e) => setDiameter(e.target.value)} />
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box className={classes.btnPeriod}>
                        <Button variant='contained' className="buttonFilter" color='primary'>
                          Searcher
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </form>
              </CardContent>
            </Card>
          </Grid></Grid></>
      }
      <br></br>
      <Grid item xs={12} spacing={6}>
        <Card>
          <CardHeader title={`Occultation Result - Total: ${totalCount}`} />
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
              defaultSorting={[{ columnName: 'name', direction: 'asc' }]}
            />
          </CardContent>
        </Card>
      </Grid>
    </Container>
  )
}

export default PublicOcutation
