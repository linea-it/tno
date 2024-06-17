import PropTypes from 'prop-types'
import FrequencyTypeSelect from './FrequencyTypeSelect'
import Grid from '@mui/material/Grid'

function FrequencySelect({ value, onChange, source, error, required }) {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={6}>
        <FrequencyTypeSelect
          value={value.frequency}
          onChange={(event) => {
            onChange({
              frequency: event.target.value,
              //frequencyValue: undefined
            })
          }}
        />
      </Grid>
    </Grid>
  )
}

FrequencySelect.defaultProps = {
  value: {
    //frequencyType: 1,
    frequencyValue: 1 //'Monthly'
  },
  source: 'period',
  error: false,
  required: false
}

FrequencySelect.propTypes = {
  value: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  //source: PropTypes.oneOf(['period']),
  //error: PropTypes.bool,
  //required: PropTypes.bool
}

export default FrequencySelect
