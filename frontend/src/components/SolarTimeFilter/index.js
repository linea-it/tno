import React from 'react'
import PropTypes from 'prop-types'
import dayjs from 'dayjs'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { TimeField } from '@mui/x-date-pickers/TimeField'
import Grid from '@mui/material/Grid'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'

function SolarTimeFilter({ value, onChange }) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Grid container spacing={2} alignItems='center'>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={value.solar_time_enabled}
                onChange={(e) => {
                  onChange({
                    solar_time_enabled: e.target.checked,
                    solar_time_after: value.solar_time_after,
                    solar_time_before: value.solar_time_before
                  })
                }}
              />
            }
            label={'Local Solar Time'}
          />
        </Grid>
        <Grid item xs={12}>
          <Grid container spacing={2} alignItems='center'>
            <Grid item xs={12} sm={4}>
              <TimeField
                label='Show Events After'
                slotProps={{ textField: { fullWidth: true } }}
                value={value.solar_time_after}
                onChange={(newValue) =>
                  onChange({
                    solar_time_enabled: value.solar_time_enabled,
                    solar_time_after: newValue,
                    solar_time_before: value.solar_time_before
                  })
                }
                disabled={!value.solar_time_enabled}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TimeField
                label='Local Solar Time'
                slotProps={{ textField: { fullWidth: true } }}
                value={value.solar_time_before}
                onChange={(newValue) =>
                  onChange({
                    solar_time_enabled: value.solar_time_enabled,
                    solar_time_after: value.solar_time_after,
                    solar_time_before: newValue
                  })
                }
                disabled={!value.solar_time_enabled}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </LocalizationProvider>
  )
}

SolarTimeFilter.defaultProps = {
  value: {
    solar_time_enabled: true,
    solar_time_after: dayjs('2024-01-01T18:00'),
    solar_time_before: dayjs('2024-01-02T06:00')
  }
}

SolarTimeFilter.propTypes = {
  value: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired
}

export default SolarTimeFilter
