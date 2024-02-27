import PropTypes from 'prop-types'
import FilterTypeSelect from './FilterTypeSelect'
import AsteroidNameSelect from './AsteroidNameSelect'
import BaseDynclassSelect from './BaseDynclassSelect'
import DynclassSelect from './DynclassSelect'
import Grid from '@mui/material/Grid'
function AsteroidSelect({ value, onChange }) {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={5} md={4}>
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
      <Grid item xs={12} sm={7} md={8}>
        {value.filterType === 'name' && (
          <AsteroidNameSelect
            onChange={(value) => {
              console.log('Change Filter Name: ', value)
              onChange({
                ...value,
                filterValue: value
              })
            }}
          />
        )}
        {value.filterType === 'base_dynclass' && (
          <BaseDynclassSelect
            value={value.filterValue}
            onChange={(event) => {
              onChange({
                ...value,
                filterValue: event.target.value
              })
            }}
          />
        )}
        {value.filterType === 'dynclass' && (
          <DynclassSelect
            value={value.filterValue}
            onChange={(event) => {
              onChange({
                ...value,
                filterValue: event.target.value
              })
            }}
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
  }
}

AsteroidSelect.propTypes = {
  value: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired
}

export default AsteroidSelect
