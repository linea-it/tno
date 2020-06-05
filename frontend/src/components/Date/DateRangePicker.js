import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // main css file
import 'react-date-range/dist/theme/default.css'; // theme css file
import './styles.css';

function DateRangePicker({ selectedDate, setSelectedDate }) {
  const handleChange = ({ selection }) => {
    console.log(selection);

    const startDate = moment(selection.startDate).format('YYYY-MM-DD');
    const endDate = moment(selection.endDate).format('YYYY-MM-DD');
    setSelectedDate([startDate, endDate]);
  };

  return (
    <DateRange
      startDatePlaceholder="Initial Date"
      endDatePlaceholder="End Date"
      dateDisplayFormat="yyyy-MM-dd"
      maxDate={new Date()}
      editableDateInputs
      onChange={handleChange}
      moveRangeOnFirstSelection={false}
      ranges={[
        {
          startDate:
            selectedDate[0] !== ''
              ? new Date(`${selectedDate[0]} 00:00`)
              : new Date(),
          endDate:
            selectedDate[1] !== ''
              ? new Date(`${selectedDate[1]} 00:00`)
              : new Date(),
          key: 'selection',
        },
      ]}
    />
  );
}

DateRangePicker.propTypes = {
  selectedDate: PropTypes.arrayOf(PropTypes.string).isRequired,
  setSelectedDate: PropTypes.func.isRequired,
};

export default DateRangePicker;
