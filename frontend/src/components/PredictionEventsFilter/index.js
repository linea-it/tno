import { useContext } from 'react'

import Box from '@mui/material/Box'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import Grid from '@mui/material/Grid'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import MaginitudeSelect from '../MaginitudeSelect/index'
import MaginitudeDropSelect from '../MaginitudeDropSelect/index'
import ObjectDiameterFilter from '../ObjectDiameterFilter/index'
import EventDurationField from '../EventDurationField/index'
import AsteroidSelect from '../AsteroidSelect/AsteroidSelect'
import GeoFilter from '../GeoFilter/index'
import { PredictionEventsContext } from '../../contexts/PredictionContext'
import SolarTimeFilter from '../SolarTimeFilter'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import ClosestApproachUncertaintyField from '../ClosestApproachUncertaintyField/index'

function PredictionEventsFilter() {
  const { queryOptions, setQueryOptions, clearFilter } = useContext(PredictionEventsContext)

  return (
    <Box component='form' noValidate autoComplete='off'>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Grid container spacing={2} alignItems='center'>
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={5} md={4}>
                <DateTimePicker
                  slotProps={{ textField: { fullWidth: true } }}
                  label='Date Start'
                  name='date_time_after'
                  value={queryOptions.filters.dt_after_local}
                  onChange={(value) => {
                    setQueryOptions((prev) => {
                      return {
                        ...prev,
                        filters: {
                          ...prev.filters,
                          dt_after_local: value,
                          date_time_after: value.utc().format()
                        }
                      }
                    })
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={5} md={4}>
                <DateTimePicker
                  slotProps={{ textField: { fullWidth: true } }}
                  label='Date End'
                  name='date_time_before'
                  value={queryOptions.filters.dt_before_local}
                  onChange={(value) => {
                    setQueryOptions((prev) => {
                      return {
                        ...prev,
                        filters: {
                          ...prev.filters,
                          dt_before_local: value,
                          date_time_before: value !== null ? value.utc().format() : value
                        }
                      }
                    })
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={2} md={4}>
                <MaginitudeSelect
                  value={queryOptions.filters.maginitudeMax}
                  onChange={(event) => {
                    setQueryOptions((prev) => {
                      return {
                        ...prev,
                        filters: {
                          ...prev.filters,
                          maginitudeMax: event.target.value
                        }
                      }
                    })
                  }}
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <AsteroidSelect
              source={'prediction'}
              value={{
                filterType: queryOptions.filters.filterType,
                filterValue: queryOptions.filters.filterValue
              }}
              onChange={(value) => {
                setQueryOptions((prev) => {
                  return {
                    ...prev,
                    filters: {
                      ...prev.filters,
                      ...value
                    }
                  }
                })
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <Divider />
          </Grid>
          <Grid item xs={12}>
            <SolarTimeFilter
              value={{
                solar_time_enabled: queryOptions.filters.solar_time_enabled,
                solar_time_after: queryOptions.filters.solar_time_after,
                solar_time_before: queryOptions.filters.solar_time_before
              }}
              onChange={(value) => {
                setQueryOptions((prev) => {
                  return {
                    ...prev,
                    filters: {
                      ...prev.filters,
                      ...value
                    }
                  }
                })
              }}
            ></SolarTimeFilter>
          </Grid>
          <Grid item xs={12}>
            <Divider />
          </Grid>
          {/* <Grid item xs={12} md={3} container justifyContent='flex-end'> */}
          <Grid item xs={12} container>
            <FormControlLabel
              label='Hide Diurn Events'
              control={
                <Switch
                  checked={queryOptions.filters.nightside}
                  onChange={(event) => {
                    setQueryOptions((prev) => {
                      return {
                        ...prev,
                        filters: {
                          ...prev.filters,
                          nightside: event.target.checked
                        }
                      }
                    })
                  }}
                />
              }
            />
          </Grid>
          <Grid item xs={12}>
            <Divider />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <MaginitudeDropSelect
              value={queryOptions.filters.maginitudeDropMin}
              onChange={(newValue) => {
                setQueryOptions((prev) => {
                  return {
                    ...prev,
                    filters: {
                      ...prev.filters,
                      maginitudeDropMin: newValue
                    }
                  }
                })
              }}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <EventDurationField
              value={queryOptions.filters.eventDurationMin}
              onChange={(e) => {
                setQueryOptions((prev) => {
                  return {
                    ...prev,
                    filters: {
                      ...prev.filters,
                      eventDurationMin: e.target.value
                    }
                  }
                })
              }}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <ClosestApproachUncertaintyField
              value={queryOptions.filters.closestApproachUncertainty}
              onChange={(e) => {
                setQueryOptions((prev) => {
                  return {
                    ...prev,
                    filters: {
                      ...prev.filters,
                      closestApproachUncertainty: e.target.value
                    }
                  }
                })
              }}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={8}>
            <ObjectDiameterFilter
              value={{
                diameterMin: queryOptions.filters.diameterMin,
                diameterMax: queryOptions.filters.diameterMax
              }}
              onChange={(value) => {
                setQueryOptions((prev) => {
                  return {
                    ...prev,
                    filters: {
                      ...prev.filters,
                      ...value
                    }
                  }
                })
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <Divider />
          </Grid>
          <Grid item xs={12}>
            <GeoFilter
              value={{
                geo: queryOptions.filters.geo,
                latitude: queryOptions.filters.latitude,
                longitude: queryOptions.filters.longitude,
                radius: queryOptions.filters.radius
              }}
              onChange={(value) => {
                setQueryOptions((prev) => {
                  return {
                    ...prev,
                    filters: {
                      ...prev.filters,
                      ...value
                    }
                  }
                })
              }}
            />
          </Grid>
          <Grid item container xs={12} spacing={2} alignItems='center'>
            <Grid item>
              <Button variant='outlined' onClick={clearFilter}>
                Clear
              </Button>
            </Grid>
            <Grid item xs />
            <Grid item>
              <Button variant='outlined' href='/docs/user-guide/filter-events/' target='blank'>
                Help
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </LocalizationProvider>
    </Box>
  )
}

export default PredictionEventsFilter
