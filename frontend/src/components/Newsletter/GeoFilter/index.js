import PropTypes from 'prop-types'
import TextField from '@mui/material/TextField'
import { useEffect, useState } from 'react'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import LocationOffIcon from '@mui/icons-material/LocationOff'
import AltitudeField from '../AltitudeField/index'

function GeoFilter({ value, onChange }) {
  const [error, setError] = useState({ latitude: false, longitude: false, radius: false })
  const [partialWarning, setPartialWarning] = useState(false)

  const setUserLocation = () => {
    if (navigator.geolocation) {
      console.time('Geolocation Response Time') // Start measuring time

      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.timeEnd('Geolocation Response Time') // End measuring time and log

          const latitude = position.coords.latitude.toFixed(6)
          const longitude = position.coords.longitude.toFixed(6)
          const newValue = { ...value, latitude, longitude, radius: 100 }
          onChange(newValue)
        },
        (error) => {
          console.timeEnd('Geolocation Response Time') // Log time even if there’s an error
          console.error('Geolocation error:', error.message)
        }
      )
    } else {
      console.error('Geolocation is not supported by this browser.')
    }
  }

  const handleClearLocation = () => {
    const newValue = { latitude: null, longitude: null, radius: null, altitude: null }
    onChange(newValue)
  }

  const handleChange = (newValue) => {
    onChange(newValue)
  }

  useEffect(() => {
    setError({
      latitude: value.latitude < -90 || value.latitude > 90,
      longitude: value.longitude < -180 || value.longitude > 180,
      radius: value.radius !== undefined && value.radius !== '' && value.radius <= 0
    })
  }, [value])

  useEffect(() => {
    const latitudeValid = value.latitude !== undefined && value.latitude !== '' && !error.latitude
    const longitudeValid = value.longitude !== undefined && value.longitude !== '' && !error.longitude
    const radiusValid = value.radius !== undefined && value.radius !== '' && !error.radius

    setPartialWarning((latitudeValid || longitudeValid || radiusValid) && !(latitudeValid && longitudeValid && radiusValid))
  }, [value, error])

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
          onChange={(event) => {
            const latitude = event.target.value
            handleChange({ ...value, latitude })
          }}
          error={error.latitude}
          helperText={error.latitude ? 'Latitude must be between -90 and 90 degrees.' : ''}
          fullWidth
        />
        <TextField
          type='number'
          label='Longitude (deg)'
          variant='outlined'
          required
          value={value.longitude === undefined ? '' : value.longitude}
          onChange={(event) => {
            const longitude = event.target.value
            handleChange({ ...value, longitude })
          }}
          error={error.longitude}
          helperText={error.longitude ? 'Longitude must be between -180 and 180 degrees.' : ''}
          fullWidth
        />
      </Stack>
      <Stack direction='row' spacing={2}>
        <TextField
          type='number'
          label='Radius (km)'
          variant='outlined'
          required
          value={value.radius === undefined ? '' : value.radius}
          onChange={(event) => {
            const radius = event.target.value
            handleChange({ ...value, radius })
          }}
          error={error.radius}
          helperText={error.radius ? 'Radius must be greater than 0.' : ''}
          fullWidth
        />
        <AltitudeField value={value.altitude} onChange={(altitude) => handleChange({ ...value, altitude })} />
      </Stack>

      {partialWarning && (
        <div style={{ color: '#d32f2f', fontSize: '1em' }}>
          For the location filter to function properly, please ensure that Latitude, Longitude, and Radius are all filled in.
        </div>
      )}
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
  value: PropTypes.shape({
    latitude: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    longitude: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    radius: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    altitude: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  }).isRequired,
  onChange: PropTypes.func.isRequired
}

export default GeoFilter
