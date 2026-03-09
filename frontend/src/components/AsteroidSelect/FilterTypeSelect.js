import PropTypes from 'prop-types'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'

function FilterTypeSelect({ value, onChange }) {
  return (
    <FormControl size='small' fullWidth sx={{ minWidth: 0 }}>
      <InputLabel id='fiter-type-select-label'>Filter Type</InputLabel>
      <Select labelId='fiter-type-select-label' id='fiter-type-select' value={value} label='Filter Type' onChange={onChange}>
        <MenuItem value=''>Empty</MenuItem>
        <MenuItem value={'name'}>Object identifier</MenuItem>
        <MenuItem value={'base_dynclass'}>Dynamic class</MenuItem>
        <MenuItem value={'dynclass'}>Dynamic class (with subclasses)</MenuItem>
      </Select>
    </FormControl>
  )
}

FilterTypeSelect.defaultProps = {
  value: 'name'
}

FilterTypeSelect.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
}

export default FilterTypeSelect
