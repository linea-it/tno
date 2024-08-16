import PropTypes from 'prop-types'
import TextField from '@mui/material/TextField'

function EventDurationField({ value, onChange, ...props }) {
  return (
    <TextField
      type='number'
      label='Event Duration (s)'
      variant='outlined'
      value={value !== undefined ? value : ''}
      onChange={onChange}
      fullWidth
      {...props}
    />
  )
}

EventDurationField.defaultProps = {
  value: undefined
}
EventDurationField.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired
}

export default EventDurationField
