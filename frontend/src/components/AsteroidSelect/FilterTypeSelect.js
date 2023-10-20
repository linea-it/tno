import PropTypes from 'prop-types';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

function FilterTypeSelect({ value, onChange }) {

  return (
    <FormControl size="normal" sx={{width: '30ch'}}>
      <InputLabel id="fiter-type-select-label">Filter Type</InputLabel>
      <Select
        labelId="fiter-type-select-label"
        id="fiter-type-select"
        value={value}
        label="Filter Type"
        onChange={onChange}
        // sx={{height: '100%'}}
      >
        <MenuItem value={'name'}>Object name</MenuItem>
        <MenuItem value={'base_dynclass'}>Dynamic class</MenuItem>
        <MenuItem value={'dynclass'}>Dynamic class (with subclasses)</MenuItem>
      </Select>
    </FormControl>
  )

  // return (
  //     <Select
  //       value={value}
  //       label="Filter Type"
  //       onChange={onChange}
  //       sx={{width: '25ch'}}
  //     >
  //       <MenuItem value={'name'}>Object name</MenuItem>
  //       <MenuItem value={'base_dynclass'}>Dynamic class</MenuItem>
  //       <MenuItem value={'dynclass'}>Dynamic class (with subclasses)</MenuItem>
  //     </Select>
  // )
}

FilterTypeSelect.defaultProps = {
  value: 'name'
}

FilterTypeSelect.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
};

export default FilterTypeSelect
