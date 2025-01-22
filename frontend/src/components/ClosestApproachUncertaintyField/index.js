import PropTypes from 'prop-types'
import TextField from '@mui/material/TextField'

function ClosestApproachUncertaintyField({ value, onChange, ...props }) {
  const handleChange = (e) => {
    const newValue = e.target.value
    if (newValue === '') {
      onChange(undefined) // Clear the value
    } else {
      onChange(parseFloat(newValue)) // Ensure value is parsed as a number
    }
  }

  return (
    <TextField
      type='number'
      label='Uncertainty (km)'
      variant='outlined'
      value={value !== undefined ? value : ''}
      onChange={handleChange}
      fullWidth
      {...props}
    />
  )
}

ClosestApproachUncertaintyField.defaultProps = {
  value: undefined
}

ClosestApproachUncertaintyField.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired
}

export default ClosestApproachUncertaintyField
