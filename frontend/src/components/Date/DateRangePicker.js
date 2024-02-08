import React from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import { DateRange } from 'react-date-range'
// import 'react-date-range/dist/styles.css' // main css file
// import 'react-date-range/dist/theme/default.css' // theme css file


function DateRangePicker({ selectedDate, setSelectedDate, minDate, maxDate }) {
  const handleChange = ({ selection }) => {
    const startDate = moment(selection.startDate).format('YYYY-MM-DD')
    const endDate = moment(selection.endDate).format('YYYY-MM-DD')

    setSelectedDate([startDate, endDate])
  }

  return (
    <DateRange
      startDatePlaceholder='Initial Date'
      endDatePlaceholder='End Date'
      dateDisplayFormat='yyyy-MM-dd'
      maxDate={maxDate}
      minDate={minDate}
      editableDateInputs
      onChange={handleChange}
      moveRangeOnFirstSelection={false}
      color='#34465d'
      ranges={[
        {
          startDate: selectedDate[0] !== '' ? new Date(`${selectedDate[0]} 00:00`) : minDate,
          endDate: selectedDate[1] !== '' ? new Date(`${selectedDate[1]} 00:00`) : minDate,
          key: 'selection'
        }
      ]}
    />
  )
}

DateRangePicker.propTypes = {
  selectedDate: PropTypes.arrayOf(PropTypes.string).isRequired,
  setSelectedDate: PropTypes.func.isRequired,
  minDate: PropTypes.instanceOf(Date),
  maxDate: PropTypes.instanceOf(Date)
}

DateRangePicker.defaultProps = {
  minDate: null,
  maxDate: new Date()
}

export default DateRangePicker
