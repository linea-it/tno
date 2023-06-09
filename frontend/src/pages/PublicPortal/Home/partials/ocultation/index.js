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
import { getOccultations, getNextTwenty } from '../../../../../services/api/Occultation';
//import Image from '../../components/List/Image';
import {
  getDynClassList,
  getBaseDynClassList,
  getAsteroidsWithPredictionList,
  getFilteredWithPredictionList
} from '../../../../../services/api/Asteroid';
import Select from 'react-select';
import { InfoOutlined as InfoOutlinedIcon } from '@material-ui/icons';
import { CardHeader, CircularProgress, MenuItem, OutlinedInput } from '../../../../../../node_modules/@material-ui/core/index';
import Table from '../../../../../components/Table/index';
import { useNavigate } from '../../../../../../node_modules/react-router-dom/dist/index';
import "./ocultation.css";
import clsx from 'clsx'
import OccultationTable from '../../../../../components/OccultationTable/index';

function PublicOcutation() {
  const navigate = useNavigate();
  const classes = styles();
  const [filterView, setFilterView] = useState('next');
  const [magnitude, setMagnitude] = useState([4, 23]);
  const [diameter, setDiameter] = useState([0, 600]);
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

  const handleChangeDiameterValue = (event, value) => {
    setDiameter(value);
  };

  const zoneArray = [
    { value: 'East-Asia', label: 'East-Asia' },
    { value: 'Europe & North Africa', label: 'Europe & North Africa' },
    { value: 'Oceania', label: 'Oceania' },
    { value: 'Southern Africa', label: 'Southern Africa', },
    { value: 'North America', label: 'North America' },
    { value: 'South America', label: 'South America' },
  ];


  const loadData = ({ sorting, pageSize, currentPage }) => {
    const ordering = sorting[0].direction === 'desc' ? `-${sorting[0].columnName}` : sorting[0].columnName;
    const start = dateStart ? new Date(dateStart).toISOString().slice(0, 10) + ' 00:00:00' : null;
    const end = dateEnd ? new Date(dateEnd).toISOString().slice(0, 10) + ' 23:59:59' : null;
    const type = filterType.value ? filterType.value.toLowerCase().replaceAll(' ', '_') : null;
    const value = filterValue.value ? filterValue.value : null;
    const minmag = magnitude[0] > 4 ? magnitude[0] : null;
    const maxmag = magnitude[1] < 23 ? magnitude[1] : null;
    if(filterView == "next"){
      getNextTwenty({
        page: currentPage + 1,
        pageSize,
        ordering: ordering,
      }).then((res) => {
        setTableData(
          res.results.map((row) => ({
            key: row.id,
            detail: `/occultation-detail/${row.id}`,
            ...row
          }))
        )
        setTotalCount(res.count)
      })
    }
    else{
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
            detail: `/occultation-detail/${row.id}`,
            ...row
          }))
        )
        setTotalCount(data.count)
      })
    }
  }

  const handleFilterClick = async () => {
    loadData({ sorting: [{ columnName: 'date_time', direction: 'asc' }], pageSize: 10, currentPage: 0 });
  }

  useEffect(() => {
    handleFilterClick();
  }, [dateStart, dateEnd, filterValue, magnitude, filterView]);

  const onKeyUp = async (event) => {
    if (event.target.value.length > 1) {
      getFilteredWithPredictionList(event.target.value).then((list) => {
        setAsteroidsList(list.map(x => { return { value: x.name, label: x.name } }));
      })
    }
  }

  return (
    <>   
      <br></br><br></br>
      <Grid container spacing={1} mt="3">
        <Grid item xs={6} className={classes.mouse} sm={3} onClick={() => setFilterView('period')}>
          <div className={clsx(filterView == 'period'?classes.selected:classes.celula)}>Period</div>
        </Grid>
        <Grid item xs={6} sm={3} className={classes.mouse} onClick={() => setFilterView('')}>
          <div className={clsx(filterView == ''?classes.selected:classes.celula)}>All events</div>
        </Grid>
        <Grid item xs={6} sm={3} className={classes.mouse} onClick={() => setFilterView('next')}>
          <div className={clsx(filterView == 'next'?classes.selected:classes.celula)}>Next 20 events</div>
        </Grid>
        <Grid item xs={6} sm={3} className={classes.mouse} onClick={() => setFilterView('userSelect')}>
          <div className={clsx(filterView == 'userSelect'?classes.selected:classes.celula)}>User selected</div>
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
                        <FormControl fullWidth ><label>Date Filter (start)</label>
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker format="YYYY-MM-DD" value={dateStart} onChange={date => { setDateStart(date) }} />
                          </LocalizationProvider>
                        </FormControl>
                      </Box>
                    </Grid>
                    <Grid item xs={7} sm={4} md={3}>
                      <Box sx={{ minWidth: 120 }}>
                        <FormControl fullWidth><label>Date Filter (end)</label>
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker format="YYYY-MM-DD" value={dateEnd} onChange={date => { setDateEnd(date) }} />
                          </LocalizationProvider>
                        </FormControl>
                      </Box>
                    </Grid>
                    {/* <Grid item xs={5} sm={4} md={2}>
                      <Box className={classes.btnPeriod}>
                        <Button variant='contained' className="buttonFilter" color='primary'>
                          Searcher
                        </Button>
                      </Box>
                    </Grid> */}
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
                        <FormControl fullWidth ><label>Date Filter (start)</label>
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker format="YYYY-MM-DD" value={dateStart} onChange={date => { setDateStart(date) }} />
                          </LocalizationProvider>
                        </FormControl>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ minWidth: 120 }}>
                        <FormControl fullWidth><label>Date Filter (end)</label>
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker format="YYYY-MM-DD" value={dateEnd} onChange={date => { setDateEnd(date) }} />
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
                            isDisabled={true}
                          />
                        </FormControl>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      {/* <FormControl fullWidth><label>Magnitude ({magnitude.toString()})</label> */}
                      <FormControl fullWidth><label>Magnitude Filter</label>
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
                      {/* <FormControl fullWidth><label>Diameter (0 and 600Km)</label> */}
                      <FormControl fullWidth><label> Diameter Filter (Km)</label>
                        <Slider
                            value={diameter}
                            step={1}
                            min={0}
                            max={600}
                            valueLabelDisplay="auto"
                            onChange={handleChangeDiameterValue}
                            disabled
                          />
                      </FormControl>
                    </Grid>
                    {/* <Grid item xs={12} sm={6} md={3}>
                      <Box className={classes.btnPeriod}>
                        <Button variant='contained' className="buttonFilter" color='primary'>
                          Searcher
                        </Button>
                      </Box>
                    </Grid> */}
                  </Grid>
                </form>
              </CardContent>
            </Card>
          </Grid></Grid></>
      }
      <br></br>
      <Grid item xs={12}>
        <OccultationTable
          loadData={loadData}
          tableData={tableData}
          totalCount={totalCount}
          /> 
      </Grid>
    </>
  )
}

export default PublicOcutation
