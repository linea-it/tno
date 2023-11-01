import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import { Typography } from '../../../node_modules/@mui/material/index';
// import { debounce } from '@mui/material/utils';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

function MaginitudeSelect({ value, onChange, min, max }) {

  const options = Array.from({length: max-min+1}, (_, i) => i + min);
  return (
    <FormControl size="normal" sx={{minWidth:'12ch'}}>
      <InputLabel id="magnitude-max-select-label">Mag Limit</InputLabel>
      <Select
        labelId="magnitude-max-select-label"
        id="magnitude-max-select"
        value={value !== undefined ? value : ''}
        label="Mag Limit"
        onChange={onChange}
      >
        {(
          options.map(row => {
            // return (<MenuItem key={row} value={`${row}`}>{row}</MenuItem>)
            return (<MenuItem key={row} value={row}>{row}</MenuItem>)
          })
        )}
      </Select>
    </FormControl>
  )
}

MaginitudeSelect.defaultProps = {
  min: 4,
  max: 23,
}
MaginitudeSelect.propTypes = {
  min: PropTypes.number,
  max: PropTypes.number,
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired
};

export default MaginitudeSelect

