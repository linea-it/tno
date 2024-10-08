import PropTypes from 'prop-types'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'

function MaginitudeDropSelect({ value, onChange, min, max, ...props }) {
  const options = Array.from({ length: max - min + 1 }, (_, i) => i + min)

  const handleChange = (e) => {
    let newValue = e.target.value
    if (newValue === '') {
      newValue = undefined
    }
    onChange(newValue)
  }

  return (
    <FormControl size='normal' fullWidth>
      <InputLabel id='magnitude-drop-select-label'>Magnitude Drop</InputLabel>
      <Select
        labelId='magnitude-drop-select-label'
        id='magnitude-drop-select'
        value={value !== undefined ? `${value}` : ''}
        label='Magnitude Drop'
        onChange={handleChange}
        {...props}
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
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired
}

export default MaginitudeDropSelect
