import React, { useEffect, useState } from 'react';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { withRouter } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import { Card, CardHeader, CardContent, Typography, CardActions } from '@material-ui/core';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import { getOccultations, url } from '../api/Occultation';
import SearchIcon from '@material-ui/icons/Search';
import CardMedia from '@material-ui/core/CardMedia';
import Fab from '@material-ui/core/Fab';
import Slider from '@material-ui/core/Slider';
import DateFnsUtils from '@date-io/date-fns';
import TextField from '@material-ui/core/TextField';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import FormControl from '@material-ui/core/FormControl';
import Divider from '@material-ui/core/Divider';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    overflow: 'hidden',
    backgroundColor: theme.palette.background.paper,
  },
  cardMedia: {
    height: '80%',
    paddingTop: '56.25%', // 16:9
    width: "90%"
  },
  extendedIcon: {
    marginRight: theme.spacing(1),
  },
  gridList: {
    width: "100%",
    height: 800,
  },
  img: {
    width: '80%',
    height: '50%',
  },
  imgCard: {
    height: 750,
    width: "100%",
  },
  titleImg: {
    textAlign: 'center',
  },
  buttonImg: {
    marginLeft: '35%',
  },
  leftIcon: {
    marginRight: theme.spacing(1),
  },
  startDate: {
    marginLeft: '2%',
    width: '40%',
  },
  finalDate: {
    float: 'right',
    marginRight: '2%',
    width: '40%',
  },
  fab: {
    // marginLeft: '30%',
  },
  sliderCard: {
    height: 102,
    marginRight: 10,
  },
  slider: {
    width: '85%',
    marginLeft: '8%',
    marginTop: 30,
  },
  diameter: {
    marginLeft: '8%',
    width: '85%',
    marginTop: 30,
  },
  magnitudeCard: {
    height: 103,
  },
  titleMagnitude: {
    marginBottom: 20,
  },
  titleDiameter: {
    marginBottom: 20,
  },
  objectTextField: {
    marginLeft: 5,
    marginRight: 5,
    width: '95%',
  },
  dynamicClassSelect: {
    width: '96%',
    marginLeft: 5,
    marginTop: 10,
  },
  dynamicClassLabel: {
    marginTop: 15,
    marginLeft: 5,
  },
  dynamicClassCard: {
    height: 55,
  },
  gridObject: {
    marginTop: 10,
  },

  gridZone: {
    marginLeft: 60,
  },
  zoneCard: {
    height: 55,
  },
  zoneSelect: {
    width: '96%',
    marginLeft: 5,
    marginTop: 10,
  },
  cards: {
    marginLeft: 10,
  },
  cardActions:{
    justifyContent:"center",
  },
  gridListContainer: {
    marginTop: 15,
  },
  sortGridList: {
    width: '100%',
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  underTitle: {
    alignContent: "center",
    justifyContent: "center",
    textAlign: "center",

  }
}));

const AirbnbSlider = withStyles({
  root: {

    height: 3,
    padding: '13px 0',
  },

  active: {},
  valueLabel: {
    left: 'calc(-50% + 4px)',
  },
  track: {
    height: 3,
  },
  rail: {
    color: '#d8d8d8',
    opacity: 1,
    height: 3,
  },
})(Slider);

function Occultation({ setTitle, ...props }) {

  const [page, setPage] = useState(1);
  const [pageSize, setPagesize] = useState(25);
  const [first, setFirst] = useState(0);
  const [sortField, setSortField] = useState(null);
  const [tileData, setTileData] = useState();
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const [magnitudeValue, setMagnitudeValue] = useState([4, 10]);
  const [diameter, setDiameter] = useState([0, 600]);
  const [objectValue, setValueObject] = useState();
  const [dynamicClass, setDynamicClass] = useState(" ");
  const [zoneValue, setZoneValue] = useState(" ");
  const [sortGridListValue, setSortGridListValue] = useState(" ");

  const loadOccultations = () => {
    getOccultations(page, pageSize, first, sortField).then((res) => {
      console.log(res);
      setTileData(res.results);
    });
  };

  useEffect(() => {
    setTitle("Occultations");
    loadOccultations();
  }, []);

  const classes = useStyles();

  const handleImgDetail = () => {

    console.log('TODO: open  here the detail of the asteroids.');
  };

  const handleStartDateChange = date => {
    setStartDate(date);
  };

  const handleEndDateChange = date => {
    setEndDate(date);
  };

  const valueTextMagnitude = (value) => {

    return `${value}`;
  };

  const valueTextDiameter = (value) => {

    return `${value}`;
  };

  const handleDiameter = (event, value) => {
    setDiameter(value);
  };

  const handleChangeObjectValue = (event) => {
    setValueObject(event.target.value);
  };

  const handleChangeDynamicClass = (event) => {
    setDynamicClass(event.target.value);
  };

  const handleChangeSortGridList = (event) => {
    setSortGridListValue(event.target.value);
  };

  const sortGridArray = [
    { name: "Newest First", value: "Newest First", title: "Newest First" },
    { name: "Oldest First", value: "Oldest First", title: "Oldest First" },
  ]

  const dynamicClassArray = [
    { name: "Centaurs", value: "Centaurs", title: "Centaurs" },
    { name: "KBOs", value: "KBOs", title: "KBOs" },
  ]

  const zoneArray = [
    { name: "East-Asia", value: "East-Asia", title: "East-Asia" },
    { name: "Europe & North Africa", value: "Europe & North Africa", title: "Europe & North Africa" },
    { name: "Oceania", value: "Oceania", title: "Oceania" },
    { name: "Southern Africa", value: "Southern Africa", title: "Southern Africa" },
    { name: "North America", value: "North America", title: "North America" },
    { name: "South America", value: "South America", title: "South America" },
  ]

  const loadDynamicClassMenuItems = () => {

    if (dynamicClassArray && dynamicClassArray.length > 0) {
      return dynamicClassArray.map((el, i) => (
        <MenuItem
          key={i}
          value={i}
          title={el.title}
        >
          {el.value}
        </MenuItem>
      ));
    }
  };

  const loadZoneMenuItems = () => {
    if (zoneArray && zoneArray.length > 0) {
      return zoneArray.map((el, i) => (
        <MenuItem
          key={i}
          value={i}
          title={el.title}
        >
          {el.value}
        </MenuItem>
      ));
    }
  };

  const handleChangeZone = (event) => {
    setZoneValue(event.target.value);
  };

  const loadSelectSortGridList = () => {
    if (zoneArray && zoneArray.length > 0) {
      return (
        <>
          <FormControl variant="filled" className={classes.formControl}>
            <InputLabel htmlFor="sort">Sort by</InputLabel>
            <Select
              className={classes.sortGridList}
              value={sortGridListValue}
              onChange={handleChangeSortGridList}
              inputProps={{
                name: 'sort',
                id: 'sort',
              }}
            >
              Sort
          {
                sortGridArray.map((el, i) => (
                  <MenuItem
                    key={i}
                    value={i}
                    title={el.title}
                  >
                    {el.value}
                  </MenuItem>
                ))
              }
            </Select>
          </FormControl>
        </>
      );
    }
  };

  const handleChangeMagnitudeValue = (event, value) => {
    setMagnitudeValue(value);
  };

  console.log(tileData);

  return (
    <Grid>
      <Grid container spacing={8}>
        <Grid item lg={12} xl={12}>
          <Card>
            <CardHeader
              title={"Predictions of occultations for TNOs"}
            />
            <CardContent>
              <Typography>
                This page presents the prediction of occultations by TNOs and Centaurs
                of Dark Energy Survey for 2019.
                These predictions are made in the framework of Lucky Star project
                (led by B. Sicardy) and in collaboration with groups from Paris,
                Meudon, Granada and Rio.
                Information about the predictions can be found in Assafin et al.
                (2012) and Camargo et al. (2014). Predictions make use of ephemerides
                presented in DES Ephemerides section and of Gaia DR2
                (Gaia Collaboration, 2018) for the position of the stars and the
                proper motions.
                Occultations for objects with too uncertain orbit are not presented.
                (2060) Chiron, (136199) Eris, (47171) 1999TC36, (120348) 2004TY364,
                (144897) 2004UX10, (303775) 2005QU182, (145452) 2005RN43, (145480)
                2005TB190 are presented in the main Lucky Star webpage.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Paper>
        <Grid container spacing={3}>
          <Grid item lg={6} xl={6}>
            <Card className={classes.cards}>
              <CardHeader
                title="Date Filter"
              />
              {/* Start Date */}
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <KeyboardDatePicker
                  className={classes.startDate}
                  disableToolbar
                  variant="inline"
                  format="MM/dd/yyyy"
                  margin="normal"
                  id="date-picker-inline"
                  label="Start Date"
                  value={startDate}
                  onChange={handleStartDateChange}
                  KeyboardButtonProps={{
                    'aria-label': 'change date',
                  }}
                />
                <KeyboardDatePicker
                  className={classes.finalDate}
                  disableToolbar
                  variant="inline"
                  format="MM/dd/yyyy"
                  margin="normal"
                  id="date-picker-inline"
                  label="Final Date"
                  value={endDate}
                  onChange={handleEndDateChange}
                  KeyboardButtonProps={{
                    'aria-label': 'change date',
                  }}
                />
              </MuiPickersUtilsProvider>
            </Card>
          </Grid>
          {/* Magnitude */}
          <Grid item lg={3} xl={3}>
            <Card className={classes.magnitudeCard} >
              <CardHeader
                title={`Magnitude: ${magnitudeValue}`}
              />
              <AirbnbSlider
                className={classes.slider}
                getAriaValueText={valueTextMagnitude}
                defaultValue={magnitudeValue}
                aria-labelledby="discrete-slider-small-steps"
                step={1}
                min={4}
                max={23}
                valueLabelDisplay="auto"
                onChange={handleChangeMagnitudeValue}
              />
            </Card>
          </Grid>
          <Grid item lg={3} xl={3}>
            {/* Diameter */}
            <Card className={classes.sliderCard} >
              <CardHeader
                title={`Diameter(Km): ${diameter}`}
              />
              <AirbnbSlider
                className={classes.diameter}
                getAriaValueText={valueTextDiameter}
                defaultValue={diameter}
                aria-labelledby="discrete-slider-small"
                step={50}
                min={0}
                max={5000}
                valueLabelDisplay="auto"
                onChange={handleDiameter}
              />
            </Card>
          </Grid>
        </Grid>
        {/* Object */}
        <Grid container spacing={3} className={classes.gridObject}>
          <Grid item lg={3} xl={3}>
            <Card className={classes.cards}>
              <CardHeader
                title="Object"
              />
              <TextField
                id="standard-name"
                className={classes.objectTextField}
                placeholder={"Number, name, designation"}
                value={objectValue}
                onChange={handleChangeObjectValue}
                margin="normal"
              />
            </Card>
          </Grid>
          {/* DynamicClass */}
          <Grid item lg={3} xl={3}>
            <CardHeader
              title="Dynamic Class"
            >
            </CardHeader>
            <Card className={classes.dynamicClassCard}>
              <Select
                className={classes.dynamicClassSelect}
                value={dynamicClass}
                onChange={handleChangeDynamicClass}
                inputProps={{ name: 'input', id: 'input-simple', }}
              >
                {/* Load here the menuItems automatically */}
                {loadDynamicClassMenuItems()}
              </Select>
            </Card>
          </Grid>
          <Grid item lg={3} xl={3} className={classes.gridZone}>
            <CardHeader
              title="Zone"
            >
            </CardHeader>
            <Card className={classes.zoneCard}>
              <Select
                className={classes.zoneSelect}
                value={zoneValue}
                onChange={handleChangeZone}
                inputProps={{ name: 'input', id: 'input-simple', }}
              >
                {/* Load here the menuItems automatically */}
                {loadZoneMenuItems()}
              </Select>
            </Card>
          </Grid>
        </Grid>
      </Paper>
      <Grid container spacing={2} className={classes.gridListContainer} >
        <Grid item lg={12} xl={12}>
          <Card>
            <CardHeader
              title={loadSelectSortGridList()}
            />
            <GridList cellHeight={600} cols={window.innerWidth <= 1280 ? 2 : 4} spacing={15} className={classes.gridList}>
              {!tileData ? null : tileData.map(tile => (
                <GridListTile key={tile.id} cols={1}>
                  <Card className={classes.imgCard}>
                    <CardHeader
                      title={<span className={classes.titleImg}>{tile.asteroid_name}</span>}
                    />
                    <CardMedia
                      className={classes.cardMedia}
                      image={url + tile.src} className={classes.img}
                      title={tile.title}
                    />
                    <Divider />
                    <p className={classes.underTitle}>{tile.date_time}</p>
                    <p className={classes.underTitle}>G mag*: {tile.g}</p>
                    <CardActions className={classes.cardActions}>
                      <Fab variant="extended" size={"small"} aria-label="extended" className={classes.fab} onClick={handleImgDetail}>
                        <SearchIcon className={classes.leftIcon}></SearchIcon>
                        Detail
                    </Fab>
                    </CardActions>
                  </Card>
                </GridListTile>
              ))}
            </GridList>
          </Card>
        </Grid>
      </Grid>
      <Grid container spacing={3}>
        <Grid item lg={12} xl={12}>
          <Card>
            <CardHeader
              title={"Information about the table"}
            />
            <CardContent>
              <Typography>
                Predictions can be filtered by date, object, size, precision, zone, and/or magnitude;
                The G* magnitude is the G magnitude (from Gaia), normalized to a body moving at 20km/s
                in order to enhance very slow events (G* = G + 2.5 log (v/20) with v is the velocity
                in the skyplane (km/s));
                The precision filter is for the 1-σ precision perpendicular to the path in km on the
                Bessel plan;
                The size filter allow to filter object with diamter in km;
                Zones are defined approximately as large areas covering East-Asia, Europe & North Africa,
                Oceania, Southern Africa, North America, South America according to the map.
                By clicking on one map, you will find a specific page of the event, with the prediction
                map, occultation circumstances and the field of view with the occulted star.
                As the table may be long to display, events with a solar elongation greater than 20° are
                considered and filters on date and magnitude are initially applied. Do not hesitate to
                change the filters to see all the events.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Grid container spacing={3}>
        <Grid item lg={12} xl={12}>
          <Card>
            <CardHeader
              title={"Information about the maps"}
            />
            <CardContent>
              <Typography>
                The straight and continue lines represents the shadow limits considering the estimated radius; when the
                shadow crosses the Earth's surface, the path is projected on the Earth;
                The blue dots are separated by a one-minute interval and the big blue dot corresponds to the nominal
                occultation time (which is the geocentric closest approach);
                The arrow shows the direction of the shadow motion;
                The 1-σ precision along the path is represented by the red dotted line;
                The G*, RP* and H* parameters are the G (visible from Gaia), RP (red photometry from Gaia) and H
                (from 2MASS) magnitudes, normalized to a body moving at 20km/s in order to enhance very slow events
                 (G* = G + 2.5 log (v/20) with v is the velocity in the skyplane (km/s));
                The body offset is at the upper right corner, if JPL ephemeris is used;
                Areas in dark grey correspond to full night (Sun elevation below -18 degrees) and areas in light
                grey correspond to twilight (Sun elevation between -18 and 0 degrees) while daytime is in white;
                Be careful, that the dates are in Universal Time, the night of the event may begin the day before.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Grid >
  );
};
export default withRouter(Occultation);





