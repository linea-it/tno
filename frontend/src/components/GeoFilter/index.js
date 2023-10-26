
import PropTypes from 'prop-types';
import TextField from '@mui/material/TextField';
import { Stack } from '../../../node_modules/@mui/material/index';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { useEffect, useState } from 'react';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

function GeoFilter({ value, onChange }) {
  
  const [isOn, setIsOn] = useState(false);
  // const [lat, setLat] = useState(undefined);
  // const [long, setLong] = useState(undefined);
  // const [radius, setRadius] = useState(500);
  const [error, setError] = useState(false);

  const options1 = Array.from({length: 10}, (_, i) => i * 10 + 10); // 10-100
  const options2 = Array.from({length: 18}, (_, i) => (i * 50) + 150); // 150-1000
  const options3 = Array.from({length: 6}, (_, i) => (i * 250) + 1250); // 1250-2500
  const options4 = Array.from({length: 5}, (_, i) => (i * 500) + 3000); // 3000-5000

  const options = options1.concat(options2).concat(options3).concat(options4)

  const setUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        // setLat(latitude.toFixed(4))
        // setLong(longitude.toFixed(4))
        // console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
        // isValid()
      });
    }              
  }

  const handleChange = (newValue) => {
    console.log("handleChange()", newValue)
    onChange(newValue)
  }
  // useEffect(() => {
  //   const isValid = () => {
  //     if (isOn) {
  //       if ((lat === undefined) || (lat === '')) {
  //         setError(true)
  //         return
  //       }
  //       if ((long === undefined) || (long === '')) {
  //         setError(true)
  //         return
  //       }
  
  //       if ((lat < -90 || lat > 90)) {
  //         setError(true)
  //         return
  //       }
  //       if ((long < -180 || long > 180)) {
  //         setError(true)
  //         return
  //       }
  
  //       if ((radius < 10 || radius > 5000)) {
  //         setError(true)
  //         return
  //       }
  
  //       if (lat && long && radius) {
  //         setError(false)

  //       }
  //     } else {
  //       setError(false)
  //     }
  //     onChange({
  //       geo: isOn,
  //       latitude: lat,
  //       longitude: long,
  //       radius: radius
  //     })
  //   }
  //   isValid()
  // }, [isOn, lat, long, radius])

  return (
    <Stack direction="row" spacing={1} alignItems="stretch" mb={2}>
      <FormControlLabel control={
        <Switch
          checked={value.geo}
          onChange={(event) => {
            handleChange({
              ...value,
              geo: event.target.checked
            })
            // setIsOn(event.target.checked);
            // if ((lat === undefined) || (long === undefined)) {
            //   // Sugere preencher automaticamente
            //   setUserLocation()
            // }
          }}
        />} label="Geo Filter" />
      <TextField
        type="number"
        label="Latitude (deg)"
        variant="outlined"
        required
        disabled={!value.isOn}
        value={value.lat === undefined ? '' : value.lat}
        min={-90}
        max={90}
        onChange={(event) => {
          // setLat(event.target.value);
          handleChange({
            ...value,
            latitude: event.target.value
          })
        }}
        error={error}
        helperText={error ? 'must be a value between -90 and 90' : ''}
        sx={{minWidth: '25ch'}}
      />
      <TextField
        type="number"
        label="Longitude (deg)"
        variant="outlined"
        required
        disabled={!value.isOn}
        value={value.long === undefined ? '' : value.long}
        min={0}
        max={360}
        onChange={(event) => {
          // setLong(event.target.value);
          handleChange({
            ...value,
            longitude: event.target.value
          })
        }}
        error={error}
        helperText={error ? 'must be a value between -180 and 180' : ''}
        sx={{minWidth: '25ch'}}
      />
      <FormControl sx={{minWidth: '18ch'}}>
        <InputLabel id="radius-select-label">Radius (Km)</InputLabel>
        <Select
          labelId="radius-select--label"
          variant="outlined"
          id="radius-select-"
          value={value.radius === undefined ? '' : value.radius}
          label="Radius (Km)"
          disabled={!value.isOn}
          onChange={(event) => {
            // setRadius(event.target.value)
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
    </Stack>
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

