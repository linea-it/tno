import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import FormControl from '@mui/material/FormControl'
import Slider from '@mui/material/Slider'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Icon from '@mui/material/Icon'
import Tooltip from '@mui/material/Tooltip'
import Checkbox from '@mui/material/Checkbox'
import styles from './style'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Select from 'react-select';
import {
  getDynClassList,
  getBaseDynClassList,
  getAsteroidsWithPredictionList,
  getFilteredWithPredictionList
} from '../../services/api/Asteroid';
import dayjs from 'dayjs';


function OccultationFilter({ dateStart, setDateStart, dateEnd, setDateEnd, filterType, setFilterType, filterValue, setFilterValue, magnitude, setMagnitude, latitude, setLatitude, longitude, setLongitude, radius, setRadius, geoFilter, setGeoFilter, loadingLocation, erroLocation, filter }) {

  const classes = styles();
  const [filterTypeList] = useState([{ value: 'name', label: 'Object name' }, { value: 'dynclass', label: 'Dynamic class (with subclasses)' }, { value: 'base_dynclass', label: 'Dynamic class' }]);
  const [asteroidsList, setAsteroidsList] = useState([]);
  const [dynClassList, setDynClassList] = useState([]);
  const [baseDynClassList, setBaseDynClassList] = useState([]);
  const [erroLatitude, setErroLatitude] = useState(false);
  const [erroLongitude, setErroLongitude] = useState(false);
  const useMountEffect = (fun) => useEffect(fun, []);

  const filterTypehandleChange = (event) => {
    if (event) {
      setFilterValue("");
      setFilterType(event);
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

  const onKeyUp = async (event) => {
    if (event.target.value.length > 1) {
      getFilteredWithPredictionList(event.target.value).then((list) => {
        setAsteroidsList(list.map(x => { return { value: x.name, label: x.name } }));
      })
    }
  }

  const filterValueNameshandleChange = (event) => {
    if (event) {
      let stringArray = event.map(x => { return x.value }).toString().replaceAll(',', ';');
      setFilterValue({ value: stringArray, label: stringArray });
    }
  };

  const filterValuehandleChange = (event) => {
    if (event) {
      setFilterValue(event);
    }
  };

  const handleChangeMagnitudeValue = (event, value) => {

    setMagnitude(value);
  };

  const handleChangeRadiusValue = (event, value) => {

    setRadius(value);
  };

  const handleChangeGeoFilter = (event, value) => {
    setGeoFilter(value);
  };

  function isValidLatitude(latitudeStr) {
    const value = parseFloat(latitudeStr);
    if ((!isNaN(value) && value >= -90 && value <= 90) || !geoFilter) {
      setErroLatitude(false);
      return true;
    }
    setErroLatitude(true);
    return false;
  }

  function isValidLongitude(longitudeStr) {
    const value = parseFloat(longitudeStr);
    if ((!isNaN(value) && value >= -180 && value <= 180) || !geoFilter) {
      setErroLongitude(false);
      return true;
    }
    setErroLongitude(true);
    return false;
  }

  const clearFilter = () => {
    setDateStart('');
    setDateEnd('');
    setFilterType('');
    setFilterValue('');
    setMagnitude([4, 14]);
    setLatitude('');
    setLongitude('');
    setRadius(500);
  }

  const filterClick = () => {
    var validLatitude = isValidLatitude(latitude)
    var validLongitude = isValidLongitude(longitude)
    if ((validLatitude && validLongitude) || !geoFilter)
      filter()
  }


  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <form noValidate autoComplete="off">
                <Grid container spacing={2} alignItems='stretch'>
                  <Grid item xs={12} sm={6} md={2}>
                    <Box sx={{ minWidth: 120 }}>
                      <FormControl fullWidth ><label>Date Start</label>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker
                            format="YYYY-MM-DD"
                            defaultValue={dayjs('2022-04-17')}
                            value={dateStart}
                            onChange={date => { setDateStart(date) }} />
                        </LocalizationProvider>
                      </FormControl>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={2}>
                    <Box sx={{ minWidth: 120 }}>
                      <FormControl fullWidth><label>Date End</label>
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
                        {filterType.value === "name" &&
                          <Select
                            id="filterName"
                            onChange={filterValueNameshandleChange}
                            isMulti
                            options={asteroidsList}
                            menuPortalTarget={document.body}
                            menuPosition={'fixed'}
                          />
                        }
                        {filterType.value === "dynclass" &&
                          <Select
                            value={filterValue}
                            id="filterDynClass"
                            onChange={filterValuehandleChange}
                            options={dynClassList}
                            menuPortalTarget={document.body}
                            menuPosition={'fixed'}
                          />
                        }
                        {filterType.value === "base_dynclass" &&
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
                  <Grid item xs={12} sm={6} md={2}>
                    <FormControl fullWidth><label>Magnitude</label>
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
                  <Grid item xs={12}>
                    <Grid item xs={12}>
                      <label>Geo Filter</label>
                      <Checkbox
                        value={geoFilter}
                        onChange={handleChangeGeoFilter}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Card>
                        <CardContent>
                          <Grid container spacing={2} alignItems='stretch'>
                            <Grid item xs={12} sm={6} md={3}>
                              <Box sx={{ minWidth: 120 }}>
                                <Tooltip title="Latitude in degrees. North is positive, and South is negative.">
                                  <FormControl fullWidth ><label>Latitude (deg)</label>
                                    <TextField
                                      disabled={!geoFilter}
                                      name="latitude"
                                      value={latitude}
                                      onChange={e => setLatitude(e.target.value)}
                                    />
                                    {erroLatitude && <i className={classes.warningMsg}>The value provided to latitude is invalid.</i>}
                                  </FormControl>
                                </Tooltip>
                              </Box>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <Box sx={{ minWidth: 120 }}>
                                <Tooltip title="Longitude in degrees. East is positive, and West is negative.">
                                  <FormControl fullWidth ><label>Longitude (deg)</label>
                                    <TextField
                                      disabled={!geoFilter}
                                      name="longitude"
                                      value={longitude}
                                      onChange={e => setLongitude(e.target.value)}
                                    />
                                    {erroLongitude && <i className={classes.warningMsg}>The value provided to longitude is invalid.</i>}
                                  </FormControl>
                                </Tooltip>
                              </Box>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <Box sx={{ minWidth: 120 }}>
                                <Tooltip title="Search radius in Km.'">
                                  <FormControl fullWidth ><label>Radius (Km)</label>
                                    <Slider
                                      disabled={!geoFilter}
                                      value={radius}
                                      step={10}
                                      min={10}
                                      max={5000}
                                      valueLabelDisplay="auto"
                                      onChange={handleChangeRadiusValue}
                                    />
                                  </FormControl>
                                </Tooltip>
                              </Box>
                            </Grid>
                            <Grid item xs={12}>
                              <i>This is an experimental feature and may take some time to process. To prevent timeouts, we recommend using date and magnitude ranges that restrict the supplied list to a maximum of 200 objects. You can find this information in 'Total Occultation Predictions' after performing a search.</i>
                            </Grid>
                            {erroLocation &&
                              <Grid item xs={12}>
                                <i className={classes.warningMsg}>A response was not returned within the allotted time. Try refining the filters fields.</i>
                              </Grid>
                            }
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                  <Grid item xs={12}>
                    <Box className={classes.btnFilter}>
                      <Button onClick={clearFilter} variant='contained' className="buttonClear" color='primary'>
                        <Icon className='fas fa-trash' fontSize='inherit' />
                        <Typography variant='button' sx={{ margin: '0 5px' }}>
                          Clean
                        </Typography>
                      </Button>
                    </Box>
                    <Box className={classes.btnFilter}>
                      <Button disabled={loadingLocation} onClick={filterClick} variant='contained' className="buttonClear" color='primary'>
                        <Icon className='fas fa-search' fontSize='inherit' />
                        {loadingLocation &&
                          <CircularProgress size={25} color="primary" />

                        }{!loadingLocation &&
                          <Typography variant='button' sx={{ margin: '0 5px' }}>
                            Search
                          </Typography>
                        }
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  )
}

OccultationFilter.propTypes = {
  filter: PropTypes.func,
  dateStart: PropTypes.string,
  setDateStart: PropTypes.func,
  dateEnd: PropTypes.string,
  setDateEnd: PropTypes.func,
  filterType: PropTypes.string,
  setFilterType: PropTypes.func,
  filterValue: PropTypes.string,
  setFilterValue: PropTypes.func,
  magnitude: PropTypes.array,
  setMagnitude: PropTypes.func,
  latitude: PropTypes.string,
  setLatitude: PropTypes.func,
  longitude: PropTypes.string,
  setLongitude: PropTypes.func,
  radius: PropTypes.number,
  setRadius: PropTypes.func,
  loadingLocation: PropTypes.bool,
  setLoadingLocation: PropTypes.func,
  erroLocation: PropTypes.bool,
  setErroLocation: PropTypes.func,

}

OccultationFilter.defaultProps = {
  filter: () => null,
  dateStart: "",
  setDateStart: () => null,
  dateEnd: "",
  setDateEnd: () => null,
  filterType: "",
  setFilterType: () => null,
  filterValue: "",
  setFilterValue: () => null,
  magnitude: [],
  setMagnitude: () => null,
  latitude: "",
  setLatitude: () => null,
  longitude: "",
  setLongitude: () => null,
  radius: 500,
  setRadius: () => null,
  loadingLocation: false,
  setLoadingLocation: () => null,
  erroLocation: false,
  setErroLocation: () => null,
}

export default OccultationFilter
