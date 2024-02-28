import * as React from 'react'
import PropTypes from 'prop-types'
import { useQuery } from 'react-query'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import { listAllAsteroidsWithEvents } from '../../services/api/Occultation'
import { listAllAsteroids } from '../../services/api/Asteroid'
import CircularProgress from '@mui/material/CircularProgress'
function AsteroidNameSelect({ value, onChange, source, error, required }) {
  const [inputValue, setInputValue] = React.useState('')

  const qKey = source === 'prediction' ? 'asteroidsWithEvents' : 'asteroids'
  const qFn = source === 'prediction' ? listAllAsteroidsWithEvents : listAllAsteroids

  const { data, isLoading } = useQuery({
    queryKey: [qKey, { name: inputValue }],
    queryFn: qFn,
    keepPreviousData: true,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnmount: false,
    refetchOnReconnect: false,
    // retry: 1,
    staleTime: 1 * 60 * 60 * 1000
  })

  return (
    <Autocomplete
      multiple
      options={data !== undefined ? data.results : []}
      getOptionLabel={(option) => option.name}
      loading={isLoading}
      limitTags={1}
      filterSelectedOptions
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue)
      }}
      onChange={(event, newValue) => {
        onChange(newValue)
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label='Asteroid Name'
          variant='outlined'
          fullWidth
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {isLoading ? <CircularProgress color='inherit' size={20} /> : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            )
          }}
          error={error}
          required={required}
        />
      )}
    />
  )
}

AsteroidNameSelect.defaultProps = {
  value: 'name',
  source: 'prediction',
  error: false
}

AsteroidNameSelect.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  source: PropTypes.oneOf(['asteroid', 'prediction']),
  error: PropTypes.bool
}

export default AsteroidNameSelect
