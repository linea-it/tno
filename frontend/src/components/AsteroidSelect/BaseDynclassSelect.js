import { useQuery } from 'react-query';
import PropTypes from 'prop-types';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { allBaseDynclassWithEvents } from '../../services/api/Occultation';

function BaseDynclassSelect({ value, onChange }) {

  const { data } = useQuery({
    queryKey: ['baseDynclassWithEvents'],
    queryFn: allBaseDynclassWithEvents,
    keepPreviousData: true,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnmount: false,
    refetchOnReconnect: false,
    retry: 1,
    staleTime: 1 * 60 * 60 * 1000,
  })


  return (
    <FormControl size="normal" sx={{ minWidth: '50ch' }}>
      <InputLabel id="filter-base-dynclass-select-label">Dynamic class</InputLabel>
      <Select
        labelId="filter-base-dynclass-select-label"
        id="filter-base-dynclass-select"
        value={value !== undefined ? value : ''}
        label="Dynamic class"
        onChange={onChange}
      >
        {data !== undefined && (
          data.results.map(row => {
            return (<MenuItem key={row} value={row}>{row}</MenuItem>)
          })
        )}
      </Select>
    </FormControl>
  )
}

BaseDynclassSelect.defaultProps = {
  value: undefined
}
BaseDynclassSelect.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired
};

export default BaseDynclassSelect
