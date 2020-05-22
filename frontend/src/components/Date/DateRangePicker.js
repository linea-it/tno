import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // main css file
import 'react-date-range/dist/theme/default.css'; // theme css file
import './styles.css';

function DateRangePicker({ selectedDate, setSelectedDate }) {
  const handleChange = ({ selection }) => {
    const startDate = moment(selection.startDate).format('YYYY-MM-DD');
    const endDate = moment(selection.endDate).format('YYYY-MM-DD');
    setSelectedDate([startDate, endDate]);
  };

  return (
    <DateRange
      editableDateInputs
      onChange={handleChange}
      moveRangeOnFirstSelection={false}
      ranges={[
        {
          startDate: new Date(`${selectedDate[0]} 00:00`),
          endDate: new Date(`${selectedDate[1]} 00:00`),
          key: 'selection',
        },
      ]}
    />
  );
}

DateRangePicker.propTypes = {
  selectedDate: PropTypes.string.isRequired,
  setSelectedDate: PropTypes.func.isRequired,
};

export default DateRangePicker;
