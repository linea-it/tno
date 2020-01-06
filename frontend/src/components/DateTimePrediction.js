import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import PropTypes from 'prop-types';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  date: {
    marginTop: 10,
    marginBottom: 15,
    width: '90%',
  },
});

export default function DateAndTimePickers(props) {
  const classes = useStyles();
  const { label } = props;

  const [id] = useState(props.titleId);

  const handleChange = (date) => {

    if (id === "initialDate") {
      props.setSubmition({
        ...props.valueSubmition,
        ephemeris_initial_date: date,
      });
      props.setInitialDate(date);
    }
    else {
      props.setSubmition({
        ...props.valueSubmition,
        ephemeris_final_date: date,
      });
      props.setFinalDate(date);
    }
  }

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <KeyboardDatePicker
        className={classes.date}
        format="yyyy-MM-dd"
        label={label}
        value={props.defaultDate}
        onChange={handleChange}
      />
    </MuiPickersUtilsProvider>
  );
}

DateAndTimePickers.propTypes = {
  label: PropTypes.string.isRequired,
};
