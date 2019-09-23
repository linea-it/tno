import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import PropTypes from 'prop-types';
import moment from 'moment';


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




  return (
    <form className={classes.container} noValidate>
      <TextField
        id="datetime-local"
        label={label}
        type="date"
        // defaultValue={"2019-05-08"}
        defaultValue={props.defaultDate}
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
