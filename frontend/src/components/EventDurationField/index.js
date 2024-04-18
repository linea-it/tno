import PropTypes from 'prop-types'
import TextField from '@mui/material/TextField'

function EventDurationField({ value, onChange }) {
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
      label='Event Duration (s)'
      variant='outlined'
      value={value !== undefined ? parseFloat(value) : ''}
      onChange={handleChange}
      fullWidth
    />
  )
}

EventDurationField.defaultProps = {
  value: undefined
}
EventDurationField.propTypes = {
  value: PropTypes.number,
  onChange: PropTypes.func.isRequired
}

export default EventDurationField
