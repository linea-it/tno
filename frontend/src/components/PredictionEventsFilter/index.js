import { useContext } from 'react';

import Box from '@mui/material/Box';
// import { PredictionEventsContext } from '../../../contexts/PredictionContext';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import MaginitudeSelect from '../MaginitudeSelect/index';
import AsteroidSelect from '../AsteroidSelect/AsteroidSelect';
import GeoFilter from '../GeoFilter/index';
import { PredictionEventsContext } from '../../contexts/PredictionContext';

function PredictionEventsFilter() {

  const { queryOptions, setQueryOptions } = useContext(PredictionEventsContext)

  return (
    <Box>
      <Box
        component="form"
        noValidate
        autoComplete="off"
      >
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Stack direction="row" spacing={1} alignItems="stretch" mb={2}>
            <DateTimePicker
              sx={{ minWidth: '25ch' }}
              label="Date Start"
              name="date_time_after"
              value={queryOptions.filters.dt_after_local}
              onChange={(value) => {
                console.log("Teste: ", value.utc().format())
                setQueryOptions(prev => {
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
            <DateTimePicker
              sx={{ minWidth: '25ch' }}
              label="Date End"
              name="date_time_before"
              value={queryOptions.filters.dt_before_local}
              onChange={(value) => {
                setQueryOptions(prev => {
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
            <MaginitudeSelect
              value={queryOptions.filters.maginitudeMax}
              onChange={(event) => {
                setQueryOptions(prev => {

                  return {
                    ...prev,
                    filters: {
                      ...prev.filters,
                      maginitudeMax: event.target.value
                    }
                  }
                })
              }} />
            <FormControlLabel control={
              <Switch
                checked={queryOptions.filters.nightside}
                onChange={(event) => {
                  setQueryOptions(prev => {
                    return {
                      ...prev,
                      filters: {
                        ...prev.filters,
                        nightside: event.target.checked
                      }
                    }
                  })
                }}
              />} label="Nighttime Only" />
          </Stack>
        </LocalizationProvider>
        <AsteroidSelect value={{
          filterType: queryOptions.filters.filterType,
          filterValue: queryOptions.filters.filterValue
        }} onChange={(value) => {
          setQueryOptions(prev => {
            return {
              ...prev,
              filters: {
                ...prev.filters,
                ...value
              }
            }
          })
        }} />
        <Box mt={2}>
          <GeoFilter
            value={{
              geo: queryOptions.filters.geo,
              latitude: queryOptions.filters.latitude,
              longitude: queryOptions.filters.longitude,
              radius: queryOptions.filters.radius,
            }}
            onChange={(value) => {
              setQueryOptions(prev => {
                return {
                  ...prev,
                  filters: {
                    ...prev.filters,
                    ...value
                  }
                }
              })
            }}
          /></Box>
      </Box>
      <Typography m={1} variant="body2" fontSize='1.0rem' color="#1565c0">The Geo Filter feature is experimental and should be used with caution. To prevent timeouts, we recommend to use date and magnitude constraints to restrict the supplied list to be filtered to a maximum of 2000 records. You can find this information below as 'Retrieved Predictions' after applying a filter.</Typography>
    </Box >
  )
}

export default PredictionEventsFilter
