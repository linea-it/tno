import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import SearchIcon from '@material-ui/icons/Search';
import { TextField } from '@material-ui/core';
import PropTypes from 'prop-types';

const useStyles = makeStyles((theme) => ({
  grow: {
    marginBottom: theme.spacing(6),
    float: 'right',
    marginLeft: 10,
  },
  input: {
    width: 170,
  },
}));

export default function PrimarySearchAppBar({ setSearch, setHasSearch, value }) {
  const classes = useStyles();

  const handleChange = (event) => {
    let fetch = event.target.value;
    setSearch(fetch === "" ? "" : fetch);
    setHasSearch(true);
  }


  return (
    <div className={classes.grow}>

      <SearchIcon />

      <TextField
        id="standard-search"
        label=""
        placeholder="Search…"
        onChange={handleChange}
        value={value}
        className={classes.input}
        inputProps={{ 'aria-label': 'search' }}
        autoFocus={true}
        type="search"
        fullWidth={false}
      />
    </div>
  );
}

PrimarySearchAppBar.propTypes = {
  setSearch: PropTypes.func.isRequired,
  setHasSearch: PropTypes.func.isRequired,
  value: PropTypes.string,
};
