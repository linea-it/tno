import React from 'react'
import PropTypes from 'prop-types'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import Stack from '@mui/material/Stack'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
import FlareOutlinedIcon from '@mui/icons-material/FlareOutlined'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import FrequencyTypeSelect from '../../../components/Newsletter/Frequency/FrequencyTypeSelect'
import AsteroidSelect from '../../../components/AsteroidSelect/AsteroidSelect'
import MaginitudeSelect from '../../../components/MaginitudeSelect/index'
import SolarTimeFilter from '../../../components/SolarTimeFilter/index'
import EventDurationField from '../../../components/EventDurationField/index'
import MaginitudeDropSelect from '../../../components/MaginitudeDropSelect/index'
import ObjectDiameterFilter from '../../../components/ObjectDiameterFilter/index'
import GeoFilter from '../../../components/Newsletter/GeoFilter/index'
import ClosestApproachUncertaintyField from '../../../components/ClosestApproachUncertaintyField/index'

const accordionSx = { '&:before': { display: 'none' } }

export default function EventFilterForm({ data, onChange }) {
  const handleChange = (e) => {
    const value = e.target ? e.target.value : e.value
    const newData = {
      ...data,
      [e.target ? e.target.name : e.name]: value === '' || value === undefined ? null : value,
    }
    onChange(newData)
  }

  return (
    <Stack spacing={1.5}>
      {/* 1. Basic */}
      <Accordion defaultExpanded disableGutters sx={accordionSx}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <DescriptionOutlinedIcon sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant='subtitle2'>Basic</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            <Stack direction='row' spacing={2}>
              <TextField
                required
                name='filter_name'
                label='Filter Name'
                value={data.filter_name ?? ''}
                onChange={handleChange}
                fullWidth
              />
              <FrequencyTypeSelect value={data.frequency} onChange={handleChange} name='frequency' />
            </Stack>
            <TextField
              label='Description'
              name='description'
              value={data.description != null ? data.description : ''}
              onChange={handleChange}
              multiline
              rows={4}
            />
          </Stack>
        </AccordionDetails>
      </Accordion>

      {/* 2. Object */}
      <Accordion defaultExpanded disableGutters sx={accordionSx}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <SearchOutlinedIcon sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant='subtitle2'>Object</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <AsteroidSelect
            source={data.filter_type === 'name' ? 'asteroid' : 'prediction'}
            value={{
              filterType: data.filter_type,
              filterValue: data.filter_value,
            }}
            onChange={(value) => {
              onChange({ ...data, filter_type: value.filterType, filter_value: value.filterValue })
            }}
          />
        </AccordionDetails>
      </Accordion>

      {/* 3. Magnitude */}
      <Accordion defaultExpanded disableGutters sx={accordionSx}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <FlareOutlinedIcon sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant='subtitle2'>Magnitude</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack direction='row' spacing={2}>
            <MaginitudeSelect
              value={data.magnitude_max != null ? data.magnitude_max : ''}
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
        </AccordionDetails>
      </Accordion>

      {/* 4. Nighttime */}
      <Accordion defaultExpanded disableGutters sx={accordionSx}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <DarkModeOutlinedIcon sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant='subtitle2'>Nighttime</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <SolarTimeFilter
            allwaysEnabled
            value={{
              solar_time_enabled: true,
              solar_time_after: data.local_solar_time_after,
              solar_time_before: data.local_solar_time_before,
            }}
            onChange={(value) => {
              onChange({
                ...data,
                solar_time_enabled: value.solar_time_enabled,
                local_solar_time_after: value.solar_time_after,
                local_solar_time_before: value.solar_time_before,
              })
            }}
          />
        </AccordionDetails>
      </Accordion>

      {/* 5. Advanced */}
      <Accordion defaultExpanded disableGutters sx={accordionSx}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <TuneOutlinedIcon sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant='subtitle2'>Advanced</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            <ObjectDiameterFilter
              value={{
                diameterMin: data.diameter_min != null ? data.diameter_min : '',
                diameterMax: data.diameter_max != null ? data.diameter_max : '',
              }}
              onChange={(value) => {
                onChange({
                  ...data,
                  diameter_min: value.diameterMin,
                  diameter_max: value.diameterMax,
                })
              }}
            />
            <Stack direction='row' spacing={2}>
              <EventDurationField
                name='event_duration'
                value={data.event_duration != null ? data.event_duration : ''}
                onChange={handleChange}
                label='Event Duration (seconds)'
              />
              <ClosestApproachUncertaintyField
                name='closest_approach_uncertainty_km'
                value={data.closest_approach_uncertainty_km ?? undefined}
                onChange={(newValue) => handleChange({ target: { name: 'closest_approach_uncertainty_km', value: newValue } })}
                label='Uncertainty (km)'
              />
            </Stack>
          </Stack>
        </AccordionDetails>
      </Accordion>

      {/* 6. Location */}
      <Accordion defaultExpanded disableGutters sx={accordionSx}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <LocationOnOutlinedIcon sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant='subtitle2'>Geo Location</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <GeoFilter
            value={{
              latitude: data.latitude ?? '',
              longitude: data.longitude ?? '',
              radius: data.location_radius ?? '',
              altitude: data.altitude ?? '',
            }}
            onChange={(value) => {
              onChange({
                ...data,
                latitude: value.latitude !== '' ? value.latitude : undefined,
                longitude: value.longitude !== '' ? value.longitude : undefined,
                location_radius: value.radius !== '' ? value.radius : undefined,
                altitude: value.altitude !== '' ? value.altitude : undefined,
              })
            }}
          />
        </AccordionDetails>
      </Accordion>
    </Stack>
  )
}

EventFilterForm.defaultProps = {
  data: {},
}

EventFilterForm.propTypes = {
  data: PropTypes.object,
}
