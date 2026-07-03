import { useContext, useMemo } from 'react'

import Box from '@mui/material/Box'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import Grid from '@mui/material/Grid'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import SearchIcon from '@mui/icons-material/Search'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import TuneIcon from '@mui/icons-material/Tune'
import LocationOnIcon from '@mui/icons-material/LocationOn'

import MaginitudeSelect from '../MaginitudeSelect/index'
import MaginitudeDropSelect from '../MaginitudeDropSelect/index'
import ObjectDiameterFilter from '../ObjectDiameterFilter/index'
import EventDurationField from '../EventDurationField/index'
import AsteroidSelect from '../AsteroidSelect/AsteroidSelect'
import GeoFilter from '../GeoFilter/index'
import { PredictionEventsContext } from '../../contexts/PredictionContext'
import SolarTimeFilter from '../SolarTimeFilter'
import ClosestApproachUncertaintyField from '../ClosestApproachUncertaintyField/index'

const defaultFilters = {
  maginitudeMax: 15,
  filterType: '',
  filterValue: undefined,
  solar_time_enabled: true,
  nightside: true,
  maginitudeDropMin: undefined,
  diameterMin: undefined,
  diameterMax: undefined,
  closestApproachUncertainty: undefined,
  eventDurationMin: undefined,
  geo: false,
}

const accordionSx = { '&:before': { display: 'none' } }

function buildChips(filters) {
  const chips = []

  if (filters.filterType && filters.filterValue !== undefined) {
    const label = filters.filterType === 'name' ? 'Object' : filters.filterType === 'base_dynclass' ? 'Base Class' : 'Dyn Class'
    const value = Array.isArray(filters.filterValue) ? filters.filterValue.join(', ') : filters.filterValue
    chips.push({ key: 'object', label: `${label}: ${value}` })
  }
  if (filters.maginitudeMax < defaultFilters.maginitudeMax) {
    chips.push({ key: 'mag', label: `Mag ≤ ${filters.maginitudeMax}` })
  }
  if (!filters.solar_time_enabled) {
    chips.push({ key: 'solar', label: 'Any local time' })
  }
  if (!filters.nightside) {
    chips.push({ key: 'nightside', label: 'Diurnal events' })
  }
  if (filters.maginitudeDropMin !== undefined) {
    chips.push({ key: 'magdrop', label: `Mag drop ≥ ${filters.maginitudeDropMin}` })
  }
  if (filters.eventDurationMin !== undefined) {
    chips.push({ key: 'duration', label: `Duration ≥ ${filters.eventDurationMin}s` })
  }
  if (filters.closestApproachUncertainty !== undefined) {
    chips.push({ key: 'uncertainty', label: `Uncert. ≤ ${filters.closestApproachUncertainty} km` })
  }
  if (filters.diameterMin !== undefined || filters.diameterMax !== undefined) {
    const d = []
    if (filters.diameterMin !== undefined) d.push(`≥ ${filters.diameterMin}`)
    if (filters.diameterMax !== undefined) d.push(`≤ ${filters.diameterMax}`)
    chips.push({ key: 'diameter', label: `Diameter ${d.join(', ')} km` })
  }
  return chips
}

function PredictionEventsFilter() {
  const { queryOptions, setQueryOptions, clearFilter } = useContext(PredictionEventsContext)

  const filters = queryOptions.filters

  const activeChips = useMemo(() => buildChips(filters), [filters])

  const handleDeleteChip = (key) => {
    setQueryOptions((prev) => {
      const next = { ...prev, filters: { ...prev.filters } }
      switch (key) {
        case 'mag':
          next.filters.maginitudeMax = defaultFilters.maginitudeMax
          break
        case 'object':
          next.filters.filterType = ''
          next.filters.filterValue = undefined
          break
        case 'solar':
          next.filters.solar_time_enabled = true
          break
        case 'nightside':
          next.filters.nightside = true
          break
        case 'magdrop':
          next.filters.maginitudeDropMin = undefined
          break
        case 'duration':
          next.filters.eventDurationMin = undefined
          break
        case 'uncertainty':
          next.filters.closestApproachUncertainty = undefined
          break
        case 'diameter':
          next.filters.diameterMin = undefined
          next.filters.diameterMax = undefined
          break
      }
      return next
    })
  }

  return (
    <Box component='form' noValidate autoComplete='off'>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        {/* Active filter chips */}
        {activeChips.length > 0 && (
          <Stack direction='row' flexWrap='wrap' spacing={0.5} sx={{ mb: 1.5 }}>
            {activeChips.map((chip) => (
              <Chip
                key={chip.key}
                label={chip.label}
                size='small'
                onDelete={() => handleDeleteChip(chip.key)}
                color='primary'
                variant='outlined'
              />
            ))}
          </Stack>
        )}

        {/* 1. Date Range */}
        <Accordion defaultExpanded disableGutters sx={accordionSx}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <CalendarMonthIcon color='primary' sx={{ mr: 1 }} />
            <Typography variant='subtitle2'>Date Range (Local Time)</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2} alignItems='center'>
              <Grid item xs={12} sm={5} md={4}>
                <DateTimePicker
                  slotProps={{ textField: { fullWidth: true } }}
                  label='From'
                  format='YYYY-MM-DD hh:mm A'
                  value={filters.dt_after_local}
                  onChange={(value) => {
                    setQueryOptions((prev) => ({
                      ...prev,
                      filters: {
                        ...prev.filters,
                        dt_after_local: value,
                        date_time_after: value.utc().format(),
                      },
                    }))
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={5} md={4}>
                <DateTimePicker
                  slotProps={{ textField: { fullWidth: true } }}
                  label='To'
                  format='YYYY-MM-DD hh:mm A'
                  value={filters.dt_before_local}
                  onChange={(value) => {
                    setQueryOptions((prev) => ({
                      ...prev,
                      filters: {
                        ...prev.filters,
                        dt_before_local: value,
                        date_time_before: value !== null ? value.utc().format() : value,
                      },
                    }))
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={2} md={4}>
                <MaginitudeSelect
                  value={filters.maginitudeMax}
                  onChange={(event) => {
                    setQueryOptions((prev) => ({
                      ...prev,
                      filters: { ...prev.filters, maginitudeMax: event.target.value },
                    }))
                  }}
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* 2. Object */}
        <Accordion defaultExpanded disableGutters sx={accordionSx}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <SearchIcon color='primary' sx={{ mr: 1 }} />
            <Typography variant='subtitle2'>Object</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <AsteroidSelect
              source='prediction'
              value={{
                filterType: filters.filterType,
                filterValue: filters.filterValue,
              }}
              onChange={(value) => {
                setQueryOptions((prev) => ({
                  ...prev,
                  filters: { ...prev.filters, ...value },
                }))
              }}
            />
          </AccordionDetails>
        </Accordion>

        {/* 3. Nighttime */}
        <Accordion disableGutters sx={accordionSx}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <DarkModeIcon color='primary' sx={{ mr: 1 }} />
            <Typography variant='subtitle2'>Nighttime</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={2}>
              <SolarTimeFilter
                value={{
                  solar_time_enabled: filters.solar_time_enabled,
                  solar_time_after: filters.solar_time_after,
                  solar_time_before: filters.solar_time_before,
                }}
                onChange={(value) => {
                  setQueryOptions((prev) => ({
                    ...prev,
                    filters: { ...prev.filters, ...value },
                  }))
                }}
              />
              <FormControlLabel
                label='Nighttime only'
                control={
                  <Switch
                    checked={filters.nightside}
                    onChange={(event) => {
                      setQueryOptions((prev) => ({
                        ...prev,
                        filters: { ...prev.filters, nightside: event.target.checked },
                      }))
                    }}
                  />
                }
              />
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* 4. Advanced */}
        <Accordion disableGutters sx={accordionSx}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <TuneIcon color='primary' sx={{ mr: 1 }} />
            <Typography variant='subtitle2'>Advanced</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6} lg={4}>
                <MaginitudeDropSelect
                  value={filters.maginitudeDropMin}
                  onChange={(newValue) => {
                    setQueryOptions((prev) => ({
                      ...prev,
                      filters: { ...prev.filters, maginitudeDropMin: newValue },
                    }))
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6} lg={4}>
                <EventDurationField
                  value={filters.eventDurationMin}
                  onChange={(e) => {
                    setQueryOptions((prev) => ({
                      ...prev,
                      filters: { ...prev.filters, eventDurationMin: e.target.value },
                    }))
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6} lg={4}>
                <ClosestApproachUncertaintyField
                  value={filters.closestApproachUncertainty}
                  onChange={(newValue) => {
                    setQueryOptions((prev) => ({
                      ...prev,
                      filters: { ...prev.filters, closestApproachUncertainty: newValue },
                    }))
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6} lg={8}>
                <ObjectDiameterFilter
                  value={{
                    diameterMin: filters.diameterMin,
                    diameterMax: filters.diameterMax,
                  }}
                  onChange={(value) => {
                    setQueryOptions((prev) => ({
                      ...prev,
                      filters: { ...prev.filters, ...value },
                    }))
                  }}
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* 5. Geo Location */}
        <Accordion disableGutters sx={accordionSx}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <LocationOnIcon color='primary' sx={{ mr: 1 }} />
            <Typography variant='subtitle2'>Geo Location</Typography>
            {filters.geo && (
              <Chip
                label={`${filters.latitude}, ${filters.longitude} · ${filters.radius} km`}
                size='small'
                color='primary'
                variant='outlined'
                onDelete={(e) => {
                  e.stopPropagation()
                  setQueryOptions((prev) => ({
                    ...prev,
                    filters: { ...prev.filters, geo: false },
                  }))
                }}
                sx={{ ml: 1 }}
              />
            )}
          </AccordionSummary>
          <AccordionDetails>
            <GeoFilter
              value={{
                geo: filters.geo,
                latitude: filters.latitude,
                longitude: filters.longitude,
                radius: filters.radius,
              }}
              onChange={(value) => {
                setQueryOptions((prev) => ({
                  ...prev,
                  filters: { ...prev.filters, ...value },
                }))
              }}
            />
          </AccordionDetails>
        </Accordion>

        {/* Actions */}
        <Stack direction='row' spacing={1} sx={{ mt: 1.5 }}>
          <Button variant='outlined' size='small' onClick={clearFilter}>
            Reset
          </Button>
          <Box sx={{ flex: 1 }} />
          <Button variant='outlined' size='small' href='/docs/user-guide/filter-events/' target='blank'>
            Help
          </Button>
        </Stack>
      </LocalizationProvider>
    </Box>
  )
}

export default PredictionEventsFilter
