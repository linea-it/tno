import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { withRouter } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import {
  Card, CardHeader, CardContent, Typography,
} from '@material-ui/core';
import Slider from '@material-ui/core/Slider';
import DateFnsUtils from '@date-io/date-fns';
import TextField from '@material-ui/core/TextField';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import moment from 'moment';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers';
import { url } from '../api/Auth'
import { getOccultations } from '../api/Occultation';
import CustomGridList from './utils/CustomGridList';

const useStyles = makeStyles((theme) => ({
  filtersContainer: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  filterField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 200,
  },
  filterSlider: {
    width: 200,
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    marginTop: theme.spacing(3),
  },
  filterSliderLabel: {
    color: theme.palette.text.secondary,
  },
  occMapImg: {
    minWidth: 352,
    minHeight: 290,
    width: '100%',
    cursor: 'pointer',
  },
}));

function Occultation({ setTitle, history, ...props }) {
  const [page, setPage] = useState(1);
  const [pageSize, setPagesize] = useState(25);
  const [loading, setLoading] = useState();
  const [data, setData] = useState();
  const [startDate, setStartDate] = useState(moment());
  const [endDate, setEndDate] = useState(moment().add(1, 'months'));
  const [magnitude, setMagnitude] = useState([4, 18]);
  const [diameter, setDiameter] = useState([0, 600]);
  const [objectName, setObjectName] = useState();
  const [dynamicClass, setDynamicClass] = useState('');
  const [zoneValue, setZoneValue] = useState('');
  const [sortGridListValue, setSortGridListValue] = useState();

  const loadData = () => {
    setLoading(true);

    const filters = [];
    // Busca por Periodom, necessario pelo menos o start date.
    if (startDate && startDate !== null) {
      // Se tiver start e end date usa filtro Between
      if (endDate && endDate !== null) {
        filters.push({
          property: 'date_time__range',
          value: [startDate.startOf('day').format('YYYY-MM-DD HH:mm:ss'), endDate.endOf('day').format('YYYY-MM-DD HH:mm:ss')].join(),
        });
      } else {
        // Se nao tiver endDate buca por datas maiores que o start date.
        filters.push({
          property: 'date_time__gte',
          value: startDate.startOf('day').format('YYYY-MM-DD HH:mm:ss'),
        });
      }
    }

    // Busca por Magnitude
    if (magnitude && magnitude.length === 2) {
      filters.push({
        property: 'g__range',
        value: magnitude.join(),
      });
    }

    //  Busca por Asteroid Name ou Number
    if (objectName && objectName !== '') {
      filters.push({
        property: 'asteroid__name__icontains',
        value: objectName,
      });

      // Por enquanto nao pode filtrar por numero, backend nao aceita OR ainda so and.
      //  TODO no backend criar um filtro customizado para a identificacao do asteroid.
      // try {
      //   // tenta converter para Numero, se conseguir adiciona um filtro para Asteroid Number.
      //   parseInt(objectName)
      //   filters.push({
      //     property: 'asteroid__number__icontains',
      //     value: objectName,
      //   });
      // } catch {}
    }

    // TODO Busca por Dynclass, precisa de alteracao no backend

    // TODO Busca por Zona ou Regiao, precisa de alteracao no backend

    // TODO Busca por Diametro, precisa de alteracao no backend

    if (filters.length === 0) {
      setData([]);
      setLoading(false);
    } else {
      getOccultations({ filters, pageSize }).then((res) => {
        res.results.map((row) => {
          row.src = url + row.src;
          return row;
        });

        setData(res.results);
      }).finally(() => {
        setLoading(false);
      });
    }
  };


  useEffect(() => {
    setTitle('Occultations');
  }, []);

  useEffect(() => {
    loadData();
  }, [startDate, endDate, objectName, magnitude]);

  const classes = useStyles();

  const handleImgDetail = () => {
    console.log('TODO: open  here the detail of the asteroids.');
  };


  const handleStartDateChange = (date) => {
    setStartDate(date);
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
  };

  const handleDiameter = (event, value) => {
    setDiameter(value);
  };

  const handleChangeobjectName = (event) => {
    setObjectName(event.target.value);
  };

  const handleChangeDynamicClass = (event) => {
    setDynamicClass(event.target.value);
  };

  const handleChangeZone = (event) => {
    setZoneValue(event.target.value);
  };

  const handleChangeMagnitudeValue = (event, value) => {
    setMagnitude(value);
  };

  const dynamicClassArray = [
    { name: 'Centaurs', value: 'Centaurs', title: 'Centaurs' },
    { name: 'KBOs', value: 'KBOs', title: 'KBOs' },
  ];

  const zoneArray = [
    { name: 'East-Asia', value: 'East-Asia', title: 'East-Asia' },
    { name: 'Europe & North Africa', value: 'Europe & North Africa', title: 'Europe & North Africa' },
    { name: 'Oceania', value: 'Oceania', title: 'Oceania' },
    { name: 'Southern Africa', value: 'Southern Africa', title: 'Southern Africa' },
    { name: 'North America', value: 'North America', title: 'North America' },
    { name: 'South America', value: 'South America', title: 'South America' },
  ];

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

  const handleRecordClick = (id) => history.push(`/occultations/${id}`);

  return (
    <Grid>
      <Grid container spacing={3}>
        <Grid item lg={12} xl={12}>
          <Card>
            <CardContent>
              <form className={classes.filtersContainer} noValidate autoComplete="off">
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <KeyboardDatePicker
                    className={classes.filterField}
                    disableToolbar
                    variant="inline"
                    format="MM/dd/yyyy"
                    margin="normal"
                    label="Start Date"
                    value={startDate}
                    onChange={handleStartDateChange}
                  />
                  <KeyboardDatePicker
                    className={classes.filterField}
                    disableToolbar
                    variant="inline"
                    format="MM/dd/yyyy"
                    margin="normal"
                    label="Final Date"
                    value={endDate}
                    onChange={handleEndDateChange}
                  />
                </MuiPickersUtilsProvider>
                <TextField
                  className={classes.filterField}
                  label="Object Name"
                  value={objectName}
                  onChange={handleChangeobjectName}
                  margin="normal"
                />
                <div className={classes.filterSlider}>
                  <Typography gutterBottom variant="body2" className={classes.filterSliderLabel}>
                    {`Magnitude(g): ${magnitude}`}
                  </Typography>
                  <Slider
                    value={magnitude}
                    step={1}
                    min={4}
                    max={23}
                    valueLabelDisplay="auto"
                    onChange={handleChangeMagnitudeValue}
                  />
                </div>
                <div className={classes.filterSlider}>
                  <Typography gutterBottom variant="body2" className={classes.filterSliderLabel}>
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
                </div>
                <TextField
                  select
                  label="Dynamic Class"
                  className={classes.filterField}
                  value={dynamicClass}
                  onChange={handleChangeDynamicClass}
                  margin="normal"
                  disabled
                >
                  {loadDynamicClassMenuItems()}
                </TextField>
                <TextField
                  select
                  label="Zone"
                  className={classes.filterField}
                  value={zoneValue}
                  onChange={handleChangeZone}
                  margin="normal"
                  disabled
                >
                  {loadZoneMenuItems()}
                </TextField>
              </form>
            </CardContent>
          </Card>
        </Grid>
        {data ? (
          <Grid item lg={12} xl={12}>
            <Grid container spacing={2}>
              <CustomGridList
                data={data}
                handleImageClick={handleRecordClick}
              />
            </Grid>
          </Grid>
        ) : null}
      </Grid>
    </Grid>
  );
}

Occultation.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  setTitle: PropTypes.func.isRequired,
};

export default withRouter(Occultation);
