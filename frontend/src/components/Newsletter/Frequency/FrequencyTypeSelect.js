import PropTypes from 'prop-types'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'

function FrequencyTypeSelect({ value, onChange }) {
  return (
    <FormControl size='normal' fullWidth>
      <InputLabel id='frequency-type-select-label'>Frequency</InputLabel>
      <Select
        //label='frequency-type-select-label'
        id='frequency-type-select' value={value}
        label='Frequency'
        onChange={onChange}
      >
        <MenuItem value={1}>Monthly</MenuItem>
        <MenuItem value={2}>Weekly</MenuItem>
      </Select>
    </FormControl>
  )
}

FrequencyTypeSelect.defaultProps = {
  value: 1 //'Monthly'
}
/*
FrequencyTypeSelect.propTypes = {
  value: PropTypes.number.isRequired, //PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
}
*/
export default FrequencyTypeSelect
