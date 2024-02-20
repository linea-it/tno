
import PropTypes from 'prop-types';
import Stack from '@mui/material/Stack';

import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimeField } from '@mui/x-date-pickers/TimeField';

function SolarTimeFilter({ value, onChange }) {

  return (
    <Stack direction="row" spacing={1}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <TimeField
          label="Local Solar Time After"
          shouldDisableTime={(value, view) =>
            view === 'hours' && value.hour() > 0 && value.hour() < 12}
          // minTime={midday}
          // maxTime={midnight}
          value={value[0]}
          onChange={(newValue) => onChange([newValue, value[1]])}
        />
        <TimeField
          label="Local Solar Time Before"
          shouldDisableTime={(value, view) =>
            view === 'hours' && value.hour() > 12 && value.hour() < 24}
          value={value[1]}
          onChange={(newValue) => onChange([value[0], newValue])}
        />
      </LocalizationProvider>
    </Stack>
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
