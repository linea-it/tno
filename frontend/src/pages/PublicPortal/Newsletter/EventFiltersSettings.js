import React from 'react'
import { useQuery } from 'react-query'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import { listPreferenceEventFilters } from '../../../services/api/Newsletter'
import { CardHeader } from '@mui/material'
import PropTypes from 'prop-types'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import Divider from '@mui/material/Divider'
import AsteroidSelect from '../../../components/AsteroidSelect/AsteroidSelect'
import SolarTimeFilter from '../../../components/SolarTimeFilter/index'
import GeoFilter from '../../../components/GeoFilter/index'
function EventFiltersSettings({ subscriptionId }) {
  // const { queryOptions, setQueryOptions, clearFilter } = useContext(PredictionEventsContext)

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
    console.log(filter)
    return (
      <Box component='form' noValidate autoComplete='off'>
        <Grid container spacing={2} alignItems='center'>
          <Grid item xs={12}>
            <AsteroidSelect
              source={'prediction'}
              value={{
                filterType: filter.filter_type,
                filterValue: filter.filter_value
              }}
              onChange={(value) => {}}
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
          <Grid item xs={12}>
            <GeoFilter
              value={{
                geo: filter.geo_location,
                latitude: filter.latitude,
                longitude: filter.longitude,
                radius: filter.location_radius
              }}
              onChange={(value) => {}}
            />
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
