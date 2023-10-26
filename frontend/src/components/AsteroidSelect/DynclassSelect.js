import { useQuery } from 'react-query';
import PropTypes from 'prop-types';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { allDynclassWithEvents } from '../../services/api/Occultation';

function DynclassSelect({ value, onChange }) {

  const { data } = useQuery({
    queryKey: ['dynclassWithEvents'],
    queryFn: allDynclassWithEvents,
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
      <InputLabel id="filter-dynclass-select-label">Dynamic class (With Subclasses)</InputLabel>
      <Select
        labelId="filter-dynclass-select-label"
        id="filter-dynclass-select"
        value={value !== undefined ? value : ''}
        label="Dynamic class (With Subclasses)"
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

DynclassSelect.defaultProps = {
  value: undefined
}
DynclassSelect.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired
};

export default DynclassSelect
