import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import PropTypes from 'prop-types';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  textField: {
    marginTop: 10,
    marginBottom: 15,
    width: '90%',
  },
});


export default function DateAndTimePickers(props) {
  const classes = useStyles();
  const { label } = props;

  const handleChange = (event) => {

    const id = event.currentTarget.id;
    const value = event.currentTarget.value;

    if (id === "initialDate") {

      props.setSubmition({
        ...props.valueSubmition,
        ephemeris_initial_date: value,
      });
    }
    else {
      props.setSubmition({
        ...props.valueSubmition,
        ephemeris_final_date: value,
      });
    }
  }

  return (
    <form className={classes.container} noValidate>
      <TextField
        id={props.title}
        label={label}
        title={props.title}
        type="datetime-local"
        defaultValue={props.defaultDateTime}
        onChange={handleChange}
        className={classes.textField}
        InputLabelProps={{
          shrink: true,
        }}
      />
    </form>
  );
}

DateAndTimePickers.propTypes = {
  label: PropTypes.string.isRequired,
};
