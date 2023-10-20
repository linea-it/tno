import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import { Typography } from '../../../node_modules/@mui/material/index';
// import { debounce } from '@mui/material/utils';

function MagRangeField({ value, onChange }) {

  return (
    <Box sx={{ width: '25ch' }} m={1}>
      <Typography id="input-slider" gutterBottom>
        {`Magnitude: ${value[0]} - ${value[1]}`}
      </Typography>
      <Slider
        value={value}
        onChange={(event, newValue) => {
          onChange(newValue)
        }}
        valueLabelDisplay="auto"
        min={4}
        max={23}
        step={1}
        ml={2}
        // valueLabelDisplay="on"
      />
    </Box>
  )
}

MagRangeField.defaultProps = {
  value: [4,14]
}
MagRangeField.propTypes = {
  value: PropTypes.array,
  onChange: PropTypes.func.isRequired
};

export default MagRangeField

