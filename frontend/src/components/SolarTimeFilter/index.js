
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimeField } from '@mui/x-date-pickers/TimeField';
import Grid from '@mui/material/Grid';
function SolarTimeFilter({ value, onChange }) {

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TimeField
            label="Local Solar Time After"
            slotProps={{ textField: { fullWidth: true } }}
            // shouldDisableTime={(value, view) =>
            //   view === 'hours' && value.hour() > 0 && value.hour() < 12}
            value={value[0]}
            onChange={(newValue) => onChange([newValue, value[1]])}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TimeField
            label="Local Solar Time Before"
            slotProps={{ textField: { fullWidth: true } }}
            // shouldDisableTime={(value, view) =>
            //   view === 'hours' && value.hour() > 12 && value.hour() < 24}
            value={value[1]}
            onChange={(newValue) => onChange([value[0], newValue])}
          />
        </Grid>
      </Grid>
    </LocalizationProvider>
  );
}

SolarTimeFilter.defaultProps = {
  value: [dayjs('2024-01-01T18:00'), dayjs('2024-01-02T06:00')]
}

SolarTimeFilter.propTypes = {
  value: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired
};

export default SolarTimeFilter
