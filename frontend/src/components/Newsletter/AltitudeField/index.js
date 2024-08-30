import PropTypes from 'prop-types'
import TextField from '@mui/material/TextField'

function AltitudeField({ value, onChange, ...props }) {
  const handleChange = (e) => {
    let newValue = e.target.value

    if (newValue === '') {
      onChange(undefined)
    }
    if (newValue !== '') {
      onChange(parseFloat(newValue))
    }
  }

  return (
    <TextField
      type='number'
      label='Altitude (m)'
      variant='outlined'
      value={value !== undefined ? value : ''}
      onChange={handleChange}
      fullWidth
      {...props}
    />
  )
}

AltitudeField.defaultProps = {
  value: undefined
}
AltitudeField.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired
}

export default AltitudeField
