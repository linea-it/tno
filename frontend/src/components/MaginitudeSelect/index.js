import PropTypes from 'prop-types'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'

function MaginitudeSelect({ value, onChange, min, max, ...props }) {
  const options = Array.from({ length: max - min + 1 }, (_, i) => i + min)
  return (
    <FormControl
      size='normal'
      fullWidth
      // sx={{ minWidth: '12ch' }}
    >
      <InputLabel id='magnitude-max-select-label'>Mag Limit</InputLabel>
      <Select
        labelId='magnitude-max-select-label'
        id='magnitude-max-select'
        value={value !== undefined ? value : ''}
        label='Mag Limit'
        onChange={onChange}
        {...props}
      >
        {options.map((row) => {
          // return (<MenuItem key={row} value={`${row}`}>{row}</MenuItem>)
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

MaginitudeSelect.defaultProps = {
  min: 4,
  max: 18
}
MaginitudeSelect.propTypes = {
  min: PropTypes.number,
  max: PropTypes.number,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired
}

export default MaginitudeSelect
