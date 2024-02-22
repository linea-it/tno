
import PropTypes from 'prop-types';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { useEffect, useState } from 'react';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { geoFilterIsValid } from '../../services/api/Occultation';
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
function GeoFilter({ value, onChange }) {

  const [error, setError] = useState(false);

  const options1 = Array.from({ length: 10 }, (_, i) => i * 10 + 10); // 10-100
  const options2 = Array.from({ length: 18 }, (_, i) => (i * 50) + 150); // 150-1000
  const options3 = Array.from({ length: 6 }, (_, i) => (i * 250) + 1250); // 1250-2500
  const options4 = Array.from({ length: 5 }, (_, i) => (i * 500) + 3000); // 3000-5000

  const options = options1.concat(options2).concat(options3).concat(options4)

  const setUserLocation = (newValue) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function (position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        // console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
        newValue.latitude = latitude.toFixed(4)
        newValue.longitude = longitude.toFixed(4)
        onChange(newValue)
      });
    }
  }

  const handleChange = (newValue) => {
    // console.log("handleChange()", newValue)
    if ((newValue.geo === true && newValue.latitude === undefined) && (newValue.longitude === undefined)) {
      setUserLocation(newValue)
    } else {
      onChange(newValue)
    }
  }

  useEffect(() => {
    setError(!geoFilterIsValid(value))
  }, [value.latitude, value.longitude, value])

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <FormControlLabel control={
          <Switch
            checked={value.geo}
            onChange={(event) => {
              handleChange({
                ...value,
                geo: event.target.checked
              })
            }}
          />} label="Geo Filter" />
      </Grid>
      <Grid
        item xs={12} sm={4}
      >
        <TextField
          type="number"
          label="Latitude (deg)"
          variant="outlined"
          required
          disabled={!value.geo}
          value={value.latitude === undefined ? '' : value.latitude}
          min={-90}
          max={90}
          onChange={(event) => {
            handleChange({
              ...value,
              latitude: event.target.value
            })
          }}
          error={error}
          helperText={error ? 'must be a value between -90 and 90' : ''}
          fullWidth
        />
      </Grid>
      <Grid
        item xs={12} sm={4}
      >
        <TextField
          type="number"
          label="Longitude (deg)"
          variant="outlined"
          required
          disabled={!value.geo}
          value={value.longitude === undefined ? '' : value.longitude}
          min={0}
          max={360}
          onChange={(event) => {
            handleChange({
              ...value,
              longitude: event.target.value
            })
          }}
          error={error}
          helperText={error ? 'must be a value between -180 and 180' : ''}
          fullWidth
        />
      </Grid>
      <Grid
        item xs={12} sm={4}
      >
        <FormControl fullWidth>
          <InputLabel id="radius-select-label">Radius (Km)</InputLabel>
          <Select
            labelId="radius-select--label"
            variant="outlined"
            id="radius-select-"
            value={value.radius === undefined ? '' : value.radius}
            label="Radius (Km)"
            disabled={!value.geo}
            onChange={(event) => {
              handleChange({
                ...value,
                radius: event.target.value
              })
            }
            }
          >
            {(
              options.map(row => {
                return (<MenuItem key={row} value={row}>{row}</MenuItem>)
              })
            )}
          </Select>
        </FormControl>
      </Grid>
      {value.geo === true && (
        <Grid item xs={12}>
          <Alert severity="info">The Geo Filter feature is experimental and should be used with caution. To prevent timeouts, we recommend to use date and magnitude constraints to restrict the supplied list to be filtered to a maximum of 2000 records. You can find this information below as 'Retrieved Predictions' after applying a filter.</Alert>
        </Grid>
      )}
    </Grid>
  )
}

GeoFilter.defaultProps = {
  value: {
    geo: 'name',
    latitude: undefined,
    longitude: undefined,
    radius: undefined,
  }
}

GeoFilter.propTypes = {
  value: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired
};

export default GeoFilter
