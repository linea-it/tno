
import PropTypes from 'prop-types';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { Stack } from '../../../node_modules/@mui/material/index';
import FilterTypeSelect from './FilterTypeSelect';
import AsteroidNameSelect from './AsteroidNameSelect';
import { useState } from 'react';
import BaseDynclassSelect from './BaseDynclassSelect';
import DynclassSelect from './DynclassSelect';

function AsteroidSelect({ value, onChange }) {

  // const [filterType, setFilterType] = useState('name');
  // const [filterValue, setFilterValue] = useState('name');

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
