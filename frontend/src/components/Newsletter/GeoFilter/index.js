import PropTypes from 'prop-types'
import TextField from '@mui/material/TextField'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import { useEffect, useState } from 'react'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import { geoFilterIsValid } from '../../../services/api/Occultation'
import Grid from '@mui/material/Grid'
import Alert from '@mui/material/Alert'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import LocationOffIcon from '@mui/icons-material/LocationOff'
import TravelExploreIcon from '@mui/icons-material/TravelExplore'
import SearchOffIcon from '@mui/icons-material/SearchOff'

function GeoFilter({ value, onChange }) {
  const [error, setError] = useState(false)
  const [enabled, setEnabled] = useState(false)

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

  const handleEnabled = (e) => {
    handleChange({
      ...value,
      geo: false
    })
    setEnabled(e.target.checked)
  }

  useEffect(() => {
    setError(!geoFilterIsValid(value))
  }, [value.latitude, value.longitude, value])

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Stack direction='row' spacing={2} alignItems='stretch'>
            <Button variant='text' startIcon={<LocationOnIcon />} disabled={enabled} onClick={setUserLocation}>
              My location
            </Button>
          {value.latitude !== undefined && value.longitude !== undefined && (
            <Button variant='text' startIcon={<LocationOffIcon />} onClick={handleClearLocation} disabled={enabled}>
              Clear location
            </Button>
          )}
        </Stack>
      </Grid>
      <Grid item xs={12} sm={3}>
        <TextField
          type='number'
          label='Latitude (deg)'
          variant='outlined'
          required
          disabled={!enabled}
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
      <Grid item xs={12} sm={3}>
        <TextField
          type='number'
          label='Longitude (deg)'
          variant='outlined'
          required
          disabled={!enabled}
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
      </Grid>
      <Grid item xs={12} sm={3}>
        <FormControl fullWidth>
          <InputLabel id='radius-select-label'>Loc. Radius (Km)</InputLabel>
          <Select
            labelId='radius-select--label'
            variant='outlined'
            id='radius-select-'
            value={value.radius === undefined ? '' : value.radius}
            label='Loc. Radius (Km)'
            disabled={!enabled}
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
      </Grid>
      {/*
      <Grid item xs={12} sm={3}>
        {value.geo === false && (
          <Stack direction='row' justifyContent='flex-start' alignItems='center' spacing={2} sx={{ height: '100%' }}>
            <Button
              variant='contained'
              startIcon={<TravelExploreIcon />}
              onClick={(event) => {
                handleChange({
                  ...value,
                  geo: true
                })
              }}
              size='large'
              disabled={!enabled || value.latitude === undefined || value.longitude === undefined}
            >
              Search By Location
            </Button>
          </Stack>
        )}
        {value.geo === true && (
          <Stack direction='row' justifyContent='flex-start' alignItems='center' spacing={2} sx={{ height: '100%' }}>
            <Button
              variant='contained'
              startIcon={<SearchOffIcon />}
              onClick={(event) => {
                handleChange({
                  ...value,
                  geo: false
                })
              }}
              size='large'
              disabled={!enabled || value.latitude === undefined || value.longitude === undefined}
            >
              Stop Search
            </Button>
          </Stack>
        )}
      </Grid>
      
      {enabled === true && (
        <Grid item xs={12}>
          <Alert severity='info'>
            The Geo Filter feature is experimental and should be used with caution. To prevent timeouts, we recommend to use date and
            magnitude constraints to restrict the supplied list to be filtered to a maximum of 2000 records. You can find this information
            below as 'Retrieved Predictions' after applying a filter.
          </Alert>
        </Grid>
      )}
      */}
    </Grid>
  )
}

GeoFilter.defaultProps = {
  value: {
    //geo: 'name',
    latitude: undefined,
    longitude: undefined,
    radius: undefined
  }
}

GeoFilter.propTypes = {
  value: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired
}

export default GeoFilter
