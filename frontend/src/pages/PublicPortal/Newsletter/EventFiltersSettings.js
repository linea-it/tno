import React, { useContext } from 'react'
import { useQuery } from 'react-query'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import DeleteIcon from '@mui/icons-material/Delete'
import { listPreferenceEventFilters } from '../../../services/api/Newsletter'
import { CardHeader } from '@mui/material'
import PropTypes from 'prop-types'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import Divider from '@mui/material/Divider'
//import AsteroidSelect from '../../../components/AsteroidSelect/AsteroidSelect'
import FilterTypeSelect from './FilterTypeSelect'
import MagnitudeSelect from './MagnitudeSelect'
import MagnitudeDropSelect from './MagnitudeDropSelect'
//import MagnitudeSelect from '../../../components/Newsletter/MagnitudeSelect/index'
import EventDurationField from './EventDurationField'
import FrequencyTypeSelect from './FrequencyTypeSelect'
import SolarTimeFilter from '../../../components/SolarTimeFilter/index'
//import GeoFilter from '../../../components/GeoFilter/index'
import GeoFilter from './GeoFilter'
import ObjectDiameterFilter from './ObjectDiameterFilter'
//import MaginitudeSelect from '../../../components/MaginitudeSelect/index'
import { PredictionEventsContext } from '../../../contexts/PredictionContext'
import PredictionEventsDataGrid from '../../../components/PredictionEventsDataGrid/index'
//import handleRemove from '../../../components/Newsletter/index'
import RemoveFilters from './RemoveFilters'

function EventFiltersSettings({ subscriptionId }) {
  //const { queryOptions, setQueryOptions, clearFilter } = useContext(PredictionEventsContext)

  const { data, isLoading } = useQuery({
    queryKey: ['preferenceEventFilters', { subscriptionId: subscriptionId }],
    queryFn: listPreferenceEventFilters,
    keepPreviousData: true,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnmount: false,
    refetchOnReconnect: false
    // retry: 1,
    // staleTime: 1 * 60 * 60 * 1000
  })

  if (isLoading) {
    return <Box>Loading...</Box>
  }

  const generate_filter_form = (filter) => {
    //console.log(filter)
    return (
      <Box component='form' noValidate autoComplete='off'>
        <Grid container spacing={2} alignItems='center'>
          <Grid item xs={12} sx={{ display: 'inlineFlex' }}>
            <FrequencyTypeSelect
              value={{
                frequency: filter.frequency
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <Divider />
          </Grid>
          <Grid item xs={12}>
            <MagnitudeSelect
                  value={{
                    magnitude: filter.magnitude
                  }}
              />
          </Grid>
          <Grid item xs={12}>
            <Divider />
          </Grid>
          <Grid item xs={12} sx={{ display: 'inlineFlex' }}>
            <FilterTypeSelect
              value={{
                filterType: filter.filter_type,
                filterValue: filter.filter_value
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <Divider />
          </Grid>
          <Grid item xs={12}>
            <SolarTimeFilter
              value={{
                solar_time_enabled: filter.solar_time_enabled,
                solar_time_after: filter.solar_time_after,
                solar_time_before: filter.solar_time_before
              }}
              onChange={(value) => {}}
            ></SolarTimeFilter>
          </Grid>
          <Grid item xs={12}>
            <Divider />
          </Grid>
          <Grid container item xs={12}>
            <Grid item xs={12}>
              <MagnitudeDropSelect
                    value={{
                      magnitude_drop: filter.magnitude_drop
                    }}
              />
          </Grid>
            <Grid item xs={12}>
              <EventDurationField
                    value={{
                      event_duration: filter.event_duration
                    }}
              />
          </Grid>
          <Grid item xs={12}>
            <ObjectDiameterFilter
                  value={{
                    diameter_min: filter.diameter_min,
                    diameter_max: filter.diameter_max
                  }}
              />
          </Grid>
          </Grid>
          <Grid item xs={12}>
            <Divider />
          </Grid>
          <Grid item xs={12}>
            <GeoFilter
              value={{
                //geo_location: filter.geo_location,
                latitude: filter.latitude,
                longitude: filter.longitude,
                radius: filter.location_radius
              }}
              onChange={(value) => {
                return {
                    ...value
                  }
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <Divider />
          </Grid>
          <Grid container item xs={12} >
          <CardContent>
              <Button
                  type="submit"
                  fullWidth 
                  variant="contained"
                  sx={{ width: '20vw', height:'34px'}}
                  >
                  Editar
              </Button>
              </CardContent>
          </Grid>
        </Grid>
      </Box>
    )
  }

  return (
    <Box>
      {data.results.map((row) => {
        return (
          <Card key={`filter_setting_${row.id}`} sx={{ mb: 2 }}>
            <CardHeader title={row.filter_name}>{/* <PredictionEventsFilter /> */}</CardHeader>
            <CardContent>{generate_filter_form(row)}</CardContent>
            {/*
              <Grid item xs={12}>
                <PredictionEventsDataGrid />
              </Grid>
            */}
              <Grid item xs={12}>
                <RemoveFilters subscriptionId={row.id} />
              </Grid>
          </Card>
        )
      })}
    </Box>
  )
}

EventFiltersSettings.defaultProps = {}

EventFiltersSettings.propTypes = {
  subscriptionId: PropTypes.number.isRequired
}

export default EventFiltersSettings
