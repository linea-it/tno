import PropTypes from 'prop-types'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'

function MaginitudeDropSelect({ value, onChange, min, max }) {
  const options = Array.from({ length: max - min + 1 }, (_, i) => i + min)
  return (
    <FormControl size='normal' fullWidth>
      <InputLabel id='magnitude-drop-select-label'>Mag Drop</InputLabel>
      <Select
        labelId='magnitude-drop-select-label'
        id='magnitude-drop-select'
        value={value !== undefined ? value : ''}
        label='Mag Drop'
        onChange={onChange}
      >
        <MenuItem value=''>Empty</MenuItem>
        {options.map((row) => {
          return (
            <MenuItem key={row} value={row}>
              {row}
            </MenuItem>
          )
        })}
      </Select>
    </FormControl>
  )
}

MaginitudeDropSelect.defaultProps = {
  min: 1,
  max: 24
}
MaginitudeDropSelect.propTypes = {
  min: PropTypes.number,
  max: PropTypes.number,
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired
}

export default MaginitudeDropSelect
