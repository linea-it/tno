import { useContext } from 'react';

import Box from '@mui/material/Box';
import { Typography } from '../../../../node_modules/@material-ui/core/index';
import { PredictionEventsContext } from '../../../contexts/PredictionContext';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Stack from '@mui/material/Stack';
import AsteroidSelect from '../../../components/AsteroidSelect/AsteroidSelect';
import MaginitudeSelect from '../../../components/MaginitudeSelect/index';
import GeoFilter from '../../../components/GeoFilter/index';
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
              />} label="Nightside" />
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
      <Typography m={1} variant="body2">This is an experimental feature and may take some time to process. To prevent timeouts, we recommend using date and magnitude ranges that restrict the supplied list to a maximum of 200 objects. You can find this information in 'Total Occultation Predictions' after performing a search.</Typography>

    </Box >


  )
}

export default PredictionEventsFilter
