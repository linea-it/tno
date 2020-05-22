import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import moment from 'moment';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Slider,
  TextField,
  MenuItem,
} from '@material-ui/core';
import { LocalizationProvider, DatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { url } from '../../services/api/Auth';
import { getOccultations } from '../../services/api/Occultation';
import Image from '../../components/List/Image';

function Occultation({ setTitle }) {
  const history = useHistory();
  const [data, setData] = useState();
  const [startDate, setStartDate] = useState(
    moment().startOf('year').format('YYYY-MM-DD')
  );
  const [endDate, setEndDate] = useState(
    moment().endOf('year').format('YYYY-MM-DD')
  );
  const [magnitude, setMagnitude] = useState([4, 23]);
  const [diameter, setDiameter] = useState([0, 600]);
  const [objectName, setObjectName] = useState();
  const [dynamicClass, setDynamicClass] = useState('');
  const [zoneValue, setZoneValue] = useState('');
  const pageSize = 25;

  useEffect(() => {
    setTitle('Occultations');
  }, [setTitle]);

  useEffect(() => {
    const filters = [];
    // Busca por Periodo, necessario pelo menos o start date.
    if (startDate) {
      // Se tiver start e end date usa filtro Between
      if (endDate) {
        filters.push({
          property: 'date_time__range',
          value: [
            moment(startDate).format('YYYY-MM-DD'),
            moment(endDate).format('YYYY-MM-DD'),
          ].join(),
        });
      } else {
        // Se nao tiver endDate buca por datas maiores que o start date.
        filters.push({
          property: 'date_time__gte',
          value: moment(startDate).format('YYYY-MM-DD'),
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

      // Por enquanto nao pode filtrar por numero, backend nao aceita OR ainda so AND.
    }

    // TODO no backend criar um filtro customizado para a identificacao do asteroid.
    // TODO Busca por Dynclass, precisa de alteracao no backend.
    // TODO Busca por Zona ou Regiao, precisa de alteracao no backend.
    // TODO Busca por Diametro, precisa de alteracao no backend.

    if (filters.length === 0) {
      setData([]);
    } else {
      getOccultations({ filters, pageSize }).then((res) => {
        res.results.map((row) => ({
          ...row,
          src: row.src ? url + row.src : null,
        }));

        setData(res.results);
      });
    }
  }, [startDate, endDate, objectName, magnitude]);

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
    {
      name: 'Europe & North Africa',
      value: 'Europe & North Africa',
      title: 'Europe & North Africa',
    },
    { name: 'Oceania', value: 'Oceania', title: 'Oceania' },
    {
      name: 'Southern Africa',
      value: 'Southern Africa',
      title: 'Southern Africa',
    },
    { name: 'North America', value: 'North America', title: 'North America' },
    { name: 'South America', value: 'South America', title: 'South America' },
  ];

  const loadDynamicClassMenuItems = () => {
    if (dynamicClassArray && dynamicClassArray.length > 0) {
      return dynamicClassArray.map((el, i) => (
        <MenuItem key={i} value={i} title={el.title}>
          {el.value}
        </MenuItem>
      ));
    }
  };

  const loadZoneMenuItems = () => {
    if (zoneArray && zoneArray.length > 0) {
      return zoneArray.map((el, i) => (
        <MenuItem key={i} value={i} title={el.title}>
          {el.value}
        </MenuItem>
      ));
    }
  };

  const handleRecordClick = (id) => history.push(`/occultation/${id}`);

  return (
    <Grid>
      <Grid container spacing={3}>
        <Grid item lg={12}>
          <Card>
            <CardContent>
              <form noValidate autoComplete="off">
                <LocalizationProvider utils={DateFnsUtils}>
                  <DatePicker
                    disableToolbar
                    variant="inline"
                    format="yyyy-MM-dd"
                    margin="normal"
                    label="Start Date"
                    value={startDate}
                    onChange={handleStartDateChange}
                  />
                  <DatePicker
                    disableToolbar
                    variant="inline"
                    format="yyyy-MM-dd"
                    margin="normal"
                    label="Final Date"
                    value={endDate}
                    onChange={handleEndDateChange}
                  />
                </LocalizationProvider>
                <TextField
                  label="Object Name"
                  value={objectName}
                  onChange={handleChangeobjectName}
                  margin="normal"
                />
                <div>
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
                  />
                </div>
                <div>
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
                </div>
                <TextField
                  select
                  label="Dynamic Class"
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
              <Image
                data={data}
                baseUrl={url}
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
  setTitle: PropTypes.func.isRequired,
};

export default Occultation;
