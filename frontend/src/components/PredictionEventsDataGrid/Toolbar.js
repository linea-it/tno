import React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Input from '@mui/material/Input';
import FilledInput from '@mui/material/FilledInput';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import FormHelperText from '@mui/material/FormHelperText';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Toolbar from '@mui/material/Toolbar';
import ComputerIcon from '@mui/icons-material/Computer';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import FilterListIcon from '@mui/icons-material/FilterList';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import { styled } from '@mui/material/styles';
import SearchAsteroid from '../SearchAsteroid'
// import { purple } from '@mui/material/colors';

const ColorButton = styled(Button)(({ theme }) => ({
  // color: theme.palette.getContrastText(purple[500]),
  // backgroundColor: purple[500],
  // '&:hover': {
  //   backgroundColor: purple[700],
  // },
}));



function PredictEventToolbar({ }) {

  // const handleDevices = (event, newDevice) => {
  //   if (newDevice !== null) {
  //     setDevice(newDevice);
  //   }
  // };

  // const [device, setDevice] = React.useState('computer');

  return (
    <Box sx={{ mb: 2 }}>
      <Stack
        direction="row"
        justifyContent="flex-start"
        alignItems="center"
        spacing={2}
      >
        <SearchAsteroid />
        {/* <Box sx={{ flex: 1 }} />
        <ColorButton endIcon={<FilterListIcon />}>
          Filter
        </ColorButton>
        <ColorButton endIcon={<ExpandMoreIcon />}>
          Sort By: C/A Instant
        </ColorButton>
        <ToggleButtonGroup
          // value={device}
          value={"computer"}
          // onChange={handleDevices}
          exclusive
          aria-label="device"
        >
          <ToggleButton value="computer" aria-label="computer">
            <ComputerIcon />
          </ToggleButton>
          <ToggleButton value="phone" aria-label="phone">
            <PhoneAndroidIcon />
          </ToggleButton>
        </ToggleButtonGroup> */}
      </Stack>
    </Box >
  );
}

PredictEventToolbar.defaultProps = {}

PredictEventToolbar.propTypes = {};

export default PredictEventToolbar
