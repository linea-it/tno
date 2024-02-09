
import PropTypes from 'prop-types';
import Stack from '@mui/material/Stack';
import FilterTypeSelect from './FilterTypeSelect';
import AsteroidNameSelect from './AsteroidNameSelect';
import BaseDynclassSelect from './BaseDynclassSelect';
import DynclassSelect from './DynclassSelect';

function AsteroidSelect({ value, onChange }) {

  return (
    <Stack direction="row" spacing={1} alignItems="stretch">
      <FilterTypeSelect
        value={value.filterType}
        onChange={(event) => {
          console.log("Change Filter Type: ", event.target.value)
          // setFilterType(event.target.value)
          onChange({
            filterType: event.target.value,
            filterValue: undefined
          })
        }}
      />
      {value.filterType === 'name' && (
        <AsteroidNameSelect
          onChange={(value) => {
            console.log("Change Filter Name: ", value)
            onChange({
              ...value,
              filterValue: value
            })
          }} />)}
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
    </Stack>
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
};

export default AsteroidSelect
