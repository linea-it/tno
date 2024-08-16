import PropTypes from 'prop-types'
import TextField from '@mui/material/TextField'
import { useEffect, useState } from 'react'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import { geoFilterIsValid } from '../../../services/api/Occultation'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import LocationOffIcon from '@mui/icons-material/LocationOff'
import AltitudeField from '../AltitudeField/index'

function GeoFilter({ value, onChange }) {
  const [error, setError] = useState(false)

  const options1 = Array.from({ length: 10 }, (_, i) => i * 10 + 10) // 10-100
  const options2 = Array.from({ length: 18 }, (_, i) => i * 50 + 150) // 150-1000
  const options3 = Array.from({ length: 6 }, (_, i) => i * 250 + 1250) // 1250-2500
  const options4 = Array.from({ length: 5 }, (_, i) => i * 500 + 3000) // 3000-5000

  const options = options1.concat(options2).concat(options3).concat(options4)

  const setUserLocation = () => {
    const newValue = value
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function (position) {
        const latitude = position.coords.latitude
        const longitude = position.coords.longitude
        // console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
        newValue.latitude = latitude.toFixed(4)
        newValue.longitude = longitude.toFixed(4)
        onChange(newValue)
      })
    }
  }

  const handleClearLocation = () => {
    const newValue = value
    newValue.latitude = undefined
    newValue.longitude = undefined
    onChange(newValue)
  }

  const handleChange = (newValue) => {
    onChange(newValue)
  }

  useEffect(() => {
    setError(!geoFilterIsValid(value))
  }, [value.latitude, value.longitude, value])

  return (
    <Stack spacing={2}>
      <Stack direction='row' spacing={2}>
        <Button variant='text' startIcon={<LocationOnIcon />} onClick={setUserLocation}>
          My location
        </Button>
        {value.latitude !== undefined && value.longitude !== undefined && (
          <Button variant='text' startIcon={<LocationOffIcon />} onClick={handleClearLocation}>
            Clear location
          </Button>
        )}
      </Stack>
      <Stack direction='row' spacing={2}>
        <TextField
          type='number'
          label='Latitude (deg)'
          variant='outlined'
          required
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
        <TextField
          type='number'
          label='Longitude (deg)'
          variant='outlined'
          required
          value={value.longitude === undefined ? '' : value.longitude}
          min={-180}
          max={180}
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
      </Stack>
      <Stack direction='row' spacing={2}>
        <FormControl fullWidth>
          <InputLabel id='radius-select-label'>Loc. Radius (Km)</InputLabel>
          <Select
            labelId='radius-select--label'
            variant='outlined'
            id='radius-select-'
            value={value.radius === undefined ? '' : value.radius}
            label='Loc. Radius (Km)'
            onChange={(event) => {
              handleChange({
                ...value,
                radius: event.target.value
              })
            }}
          >
            {options.map((row) => {
              return (
                <MenuItem key={row} value={row}>
                  {row}
                </MenuItem>
              )
            })}
          </Select>
        </FormControl>
        <AltitudeField
          name='altitude'
          value={value.altitude === undefined ? '' : value.altitude}
          onChange={(value) => {
            handleChange({
              ...value,
              altitude: value
            })
          }}
        />
      </Stack>
    </Stack>
  )
}

GeoFilter.defaultProps = {
  value: {
    latitude: undefined,
    longitude: undefined,
    radius: undefined,
    altitude: undefined
  }
}

GeoFilter.propTypes = {
  value: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired
}

export default GeoFilter
