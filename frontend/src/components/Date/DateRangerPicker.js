import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {
  DateRangePicker,
  defaultStaticRanges,
  createStaticRanges,
} from 'react-date-range';
import {
  addDays,
  endOfDay,
  startOfDay,
  startOfMonth,
  endOfMonth,
  addMonths,
  startOfWeek,
  endOfWeek,
  startOfYear,
  endOfYear,
  addYears,
} from 'date-fns';
import 'react-date-range/dist/styles.css'; // main css file
import 'react-date-range/dist/theme/default.css'; // theme css file
import './styles.css';

const defineds = {
  startOfTomorrow: startOfDay(addDays(new Date(), 1)),
  endOfTomorrow: endOfDay(addDays(new Date(), 1)),
  startOfNextWeek: startOfWeek(addDays(new Date(), 7)),
  endOfNextWeek: endOfWeek(addDays(new Date(), 7)),
  startOfNextMonth: startOfMonth(addMonths(new Date(), 1)),
  endOfNextMonth: endOfMonth(addMonths(new Date(), 1)),
  startOfNextSixMonths: startOfMonth(addMonths(new Date(), 6)),
  endOfNextSixMonths: endOfMonth(addMonths(new Date(), 6)),
  startOfNextYear: startOfYear(addYears(new Date(), 1)),
  endOfNextYear: endOfYear(addYears(new Date(), 1)),
  startOfNextTenYears: startOfYear(addYears(new Date(), 10)),
  endOfNextTenYears: endOfYear(addYears(new Date(), 10)),
};

const futureStaticRanges = createStaticRanges([
  {
    label: 'Tomorrow',
    range: () => ({
      startDate: defineds.startOfTomorrow,
      endDate: defineds.endOfTomorrow,
    }),
  },
  {
    label: 'Next Week',
    range: () => ({
      startDate: defineds.startOfNextWeek,
      endDate: defineds.endOfNextWeek,
    }),
  },
  {
    label: 'Next Month',
    range: () => ({
      startDate: defineds.startOfNextMonth,
      endDate: defineds.endOfNextMonth,
    }),
  },
  {
    label: 'Next 6 Months',
    range: () => ({
      startDate: defineds.startOfNextSixMonths,
      endDate: defineds.endOfNextSixMOnths,
    }),
  },
  {
    label: 'Next Year',
    range: () => ({
      startDate: defineds.startOfNextYear,
      endDate: defineds.endOfNextYear,
    }),
  },
  {
    label: 'Next 10 Years',
    range: () => ({
      startDate: defineds.startOfNextTenYears,
      endDate: defineds.endOfNextTenYears,
    }),
  },
]);

function DateRanger({
  selectedDate,
  setSelectedDate,
  minDate,
  maxDate,
  definedRangeFuture,
}) {
  // Default Preset Date Ranges:
  const staticRange = definedRangeFuture
    ? futureStaticRanges
    : defaultStaticRanges;

  const handleChange = ({ selection }) => {
    const startDate = moment(selection.startDate).format('YYYY-MM-DD');
    const endDate = moment(selection.endDate).format('YYYY-MM-DD');

    setSelectedDate([startDate, endDate]);
  };

  return (
    <DateRangePicker
      startDatePlaceholder="Initial Date"
      endDatePlaceholder="End Date"
      dateDisplayFormat="yyyy-MM-dd"
      onChange={handleChange}
      months={1}
      minDate={minDate}
      maxDate={maxDate}
      direction="vertical"
      scroll={{ enabled: true }}
      moveRangeOnFirstSelection={false}
      color="#34465d"
      rangeColors="#34465d"
      ranges={[
        {
          startDate:
            selectedDate[0] !== ''
              ? new Date(`${selectedDate[0]} 00:00`)
              : minDate,
          endDate:
            selectedDate[1] !== ''
              ? new Date(`${selectedDate[1]} 00:00`)
              : minDate,
          key: 'selection',
        },
      ]}
      staticRanges={staticRange}
    />
  );
}

DateRanger.propTypes = {
  selectedDate: PropTypes.arrayOf(PropTypes.string).isRequired,
  setSelectedDate: PropTypes.func.isRequired,
  minDate: PropTypes.instanceOf(Date),
  maxDate: PropTypes.instanceOf(Date),
  definedRangeFuture: PropTypes.bool,
};

DateRanger.defaultProps = {
  minDate: null,
  maxDate: new Date(),
  definedRangeFuture: false,
};

export default DateRanger;
