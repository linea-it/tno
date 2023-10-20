import { useContext } from 'react';

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { Typography } from '../../../../node_modules/@material-ui/core/index';
import { PredictionEventsContext } from '../../../contexts/PredictionContext';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

import Stack from '@mui/material/Stack';
import AsteroidSelect from '../../../components/AsteroidSelect/AsteroidSelect';
import MaginitudeSelect from '../../../components/MaginitudeSelect/index';
function PredictionEventsFilter() {

  const { queryOptions, setQueryOptions, parseFilterOptions } = useContext(PredictionEventsContext)

  return (
    <Box>
      <Box
        component="form"
        // sx={{
        //   '& > :not(style)': { m: 1, width: '25ch' },
        // }}
        noValidate
        autoComplete="off"
      >
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Stack direction="row" spacing={1} alignItems="stretch" mb={2}>
            <DateTimePicker
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
                console.log(event.target.value)
                console.log("Magnitude Value: ", event.target.value)
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
            <AsteroidSelect value={{
              filterType: queryOptions.filters.filterType,
              filterValue: queryOptions.filters.filterValue
            }} onChange={(value) => {
              console.log("Asteroid Select Value: ", value)
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
          </Stack>
        </LocalizationProvider>
      </Box>
      <Box
        component="form"
        sx={{
          '& > :not(style)': { m: 1, width: '25ch' },
        }}
        noValidate
        autoComplete="off"
      >
        <TextField id="outlined-basic" label="Latitude (deg)" variant="outlined" />
        <TextField id="outlined-basic" label="Longitude (deg)" variant="outlined" />
        <TextField id="outlined-basic" label="Radius (Km)" variant="outlined" />
      </Box>
      <Typography m={1} variant="body1">This is an experimental feature and may take some time to process. To prevent timeouts, we recommend using date and magnitude ranges that restrict the supplied list to a maximum of 200 objects. You can find this information in 'Total Occultation Predictions' after performing a search.</Typography>
    </Box >


  )
}

export default PredictionEventsFilter
