import PropTypes from 'prop-types'
import FilterTypeSelect from './FilterTypeSelect'
import AsteroidNameSelect from './AsteroidNameSelect'
import BaseDynclassSelect from './BaseDynclassSelect'
import DynclassSelect from './DynclassSelect'
import Grid from '@mui/material/Grid'
function AsteroidSelect({ value, onChange, source, error, required }) {
  return (
    <Grid container>
      <Grid item xs={12} sm={6} md={6} pr={2}>
        <FilterTypeSelect
          value={value.filterType}
          onChange={(event) => {
            onChange({
              filterType: event.target.value,
              filterValue: undefined
            })
          }}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={6}>
        {value.filterType === 'name' && (
          <AsteroidNameSelect
            source={source}
            onChange={(newValue) => {
              onChange({
                ...value,
                filterValue: newValue
              })
            }}
            error={error}
            required={required}
          />
        )}
        {value.filterType === 'base_dynclass' && (
          <BaseDynclassSelect
            source={source}
            value={value.filterValue}
            onChange={(event) => {
              onChange({
                ...value,
                filterValue: event.target.value
              })
            }}
            error={error}
            required={required}
          />
        )}
        {value.filterType === 'dynclass' && (
          <DynclassSelect
            source={source}
            value={value.filterValue}
            onChange={(event) => {
              onChange({
                ...value,
                filterValue: event.target.value
              })
            }}
            error={error}
            required={required}
          />
        )}
      </Grid>
    </Grid>
  )
}

AsteroidSelect.defaultProps = {
  value: {
    filterType: 'name',
    filterValue: undefined
  },
  source: 'prediction',
  error: false,
  required: false
}

AsteroidSelect.propTypes = {
  value: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  source: PropTypes.oneOf(['asteroid', 'prediction']),
  error: PropTypes.bool,
  required: PropTypes.bool
}

export default AsteroidSelect
