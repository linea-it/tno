import PropTypes from 'prop-types'
import TextField from '@mui/material/TextField'

function ClosestApproachUncertaintyField({ value, onChange, ...props }) {
  /*const handleChange = (e) => {
    let newValue = e.target.value

    if (newValue === '') {
      onChange(undefined)
    }
    if (newValue !== '') {
      onChange(parseFloat(newValue))
    }
  }*/

  return (
    <TextField
      type='number'
      label='Uncertainty (km)'
      variant='outlined'
      value={value !== undefined ? value : ''}
      onChange={onChange}
      fullWidth
      {...props}
    />
  )
}

ClosestApproachUncertaintyField.defaultProps = {
  value: undefined
}
ClosestApproachUncertaintyField.propTypes = {
  value: PropTypes.number,
  onChange: PropTypes.func.isRequired
}

export default ClosestApproachUncertaintyField
