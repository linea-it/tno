import * as React from 'react';
import PropTypes from 'prop-types';
import { useQuery } from 'react-query';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { listAllAsteroidsWithEvents } from '../../services/api/Occultation';
import CircularProgress from '@mui/material/CircularProgress';
function AsteroidNameSelect({ value, onChange }) {

  const [inputValue, setInputValue] = React.useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['asteroidsWithEvents', { name: inputValue }],
    queryFn: listAllAsteroidsWithEvents,
    keepPreviousData: true,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnmount: false,
    refetchOnReconnect: false,
    // retry: 1,
    staleTime: 1 * 60 * 60 * 1000,
  })

  return (
    <Autocomplete
      multiple
      options={data !== undefined ? data.results : []}
      getOptionLabel={(option) => option.name}
      loading={isLoading}
      limitTags={1}
      sx={{ minWidth: '50ch' }}
      filterSelectedOptions
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      onChange={(event, newValue) => {
        onChange(newValue)
      }}

      renderInput={(params) => (
        <TextField
          {...params}
          label="Asteroid Name"
          variant="outlined"
          fullWidth
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
        />
      )}
    />
  )
}

AsteroidNameSelect.defaultProps = {
  value: 'name'
}

AsteroidNameSelect.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
};

export default AsteroidNameSelect
