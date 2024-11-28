import React from 'react'
import PropTypes from 'prop-types'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Divider from '@mui/material/Divider'
import FrequencyTypeSelect from '../../../components/Newsletter/Frequency/FrequencyTypeSelect'
import AsteroidSelect from '../../../components/AsteroidSelect/AsteroidSelect'
import MaginitudeSelect from '../../../components/MaginitudeSelect/index'
import SolarTimeFilter from '../../../components/SolarTimeFilter/index'
import EventDurationField from '../../../components/EventDurationField/index'
import MaginitudeDropSelect from '../../../components/MaginitudeDropSelect/index'
import ObjectDiameterFilter from '../../../components/ObjectDiameterFilter/index'
import GeoFilter from '../../../components/Newsletter/GeoFilter/index'
import ClosestApproachUncertaintyField from '../../../components/ClosestApproachUncertaintyField/index'

export default function EventFilterForm({ data, onChange }) {
  const handleChange = (e) => {
    const value = e.target ? e.target.value : e.value
    const newData = {
      ...data,
      [e.target ? e.target.name : e.name]: value === '' ? null : value // Map empty string to null
    }
    onChange(newData)
  }

  return (
    <Box component='form' autoComplete='off'>
      <Stack spacing={2}>
        <Stack direction='row' spacing={2}>
          <TextField
            required
            name='filter_name'
            label='Filter Name'
            value={data.filter_name ?? ''} // Set default empty string
            onChange={handleChange}
            fullWidth
          />
          <FrequencyTypeSelect value={data.frequency} onChange={handleChange} name='frequency' />
        </Stack>
        <TextField
          label='Filter Description'
          name='description'
          value={data.description !== null ? data.description : ''}
          onChange={handleChange}
          multiline
          rows={4}
        />
        <Divider />
        <AsteroidSelect
          source={'asteroid'}
          value={{
            filterType: data.filter_type,
            filterValue: data.filter_value
          }}
          onChange={(value) => {
            const newData = { ...data, filter_type: value.filterType, filter_value: value.filterValue }
            onChange(newData)
          }}
        />

        <Divider />
        <Stack direction='row' spacing={2}>
          {/*<MaginitudeSelect
            value={data.magnitude_min !== null ? data.magnitude_min : ''}
            name='magnitude_min'
            onChange={handleChange}
            min={4}
            max={18}
          />*/}
          <MaginitudeSelect
            value={data.magnitude_max !== null ? data.magnitude_max : ''}
            name='magnitude_max'
            onChange={handleChange}
            min={4}
            max={18}
          />
          <MaginitudeDropSelect
            name='magnitude_drop_max'
            value={data.magnitude_drop_max ?? ''}
            onChange={(value) => handleChange({ target: { name: 'magnitude_drop_max', value } })}
            min={1}
            max={24}
          />
        </Stack>
        <Divider />
        <SolarTimeFilter
          allwaysEnabled
          value={{
            solar_time_enabled: true,
            solar_time_after: data.local_solar_time_after,
            solar_time_before: data.local_solar_time_before
          }}
          onChange={(value) => {
            const newData = {
              ...data,
              solar_time_enabled: value.solar_time_enabled,
              local_solar_time_after: value.solar_time_after,
              local_solar_time_before: value.solar_time_before
            }
            onChange(newData)
          }}
        />
        <Divider />
        <Stack direction='row' spacing={2}>
          {/*<MaginitudeDropSelect
            name='magnitude_drop_min'
            value={data.magnitude_drop_min !== null ? data.magnitude_drop_min : ''}
            onChange={(value) => handleChange({ target: { name: 'magnitude_drop_min', value } })}
            min={4}
            max={18}
          />
          <MaginitudeDropSelect
            name='magnitude_drop_max'
            value={data.magnitude_drop_max !== null ? data.magnitude_drop_max : ''}
            onChange={(value) => handleChange({ target: { name: 'magnitude_drop_max', value } })}
            min={4}
            max={18}
          />*/}
        </Stack>
        <ObjectDiameterFilter
          value={{
            diameterMin: data.diameter_min !== null ? data.diameter_min : '',
            diameterMax: data.diameter_max !== null ? data.diameter_max : ''
          }}
          onChange={(value) => {
            const newData = {
              ...data,
              diameter_min: value.diameterMin,
              diameter_max: value.diameterMax
            }
            onChange(newData)
          }}
        />
        <Stack direction='row' spacing={2}>
          <EventDurationField
            name='event_duration'
            value={data.event_duration !== null ? data.event_duration : ''}
            onChange={handleChange}
            label='Event Duration (seconds)'
          />
          <ClosestApproachUncertaintyField
            name='closest_approach_uncertainty_km'
            value={
              data.closest_approach_uncertainty_km !== null && data.closest_approach_uncertainty_km !== ''
                ? parseFloat(data.closest_approach_uncertainty_km)
                : ''
            }
            onChange={handleChange}
            label='Uncertainty (km)'
          />
        </Stack>
        <Divider />
        <GeoFilter
          value={{
            latitude: data.latitude ?? '', // Fallback to an empty string for display
            longitude: data.longitude ?? '',
            radius: data.location_radius ?? '',
            altitude: data.altitude ?? ''
          }}
          onChange={(value) => {
            const newData = {
              ...data,
              latitude: value.latitude !== '' ? value.latitude : undefined,
              longitude: value.longitude !== '' ? value.longitude : undefined,
              location_radius: value.radius !== '' ? value.radius : undefined,
              altitude: value.altitude !== '' ? value.altitude : undefined
            }
            onChange(newData)
          }}
        />
      </Stack>
    </Box>
  )
}

EventFilterForm.defaultProps = {
  data: {} // Default to an empty object if `data` is not provided
}

EventFilterForm.propTypes = {
  data: PropTypes.object
}
