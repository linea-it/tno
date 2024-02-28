import { useQuery } from 'react-query'
import PropTypes from 'prop-types'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import { allBaseDynclassWithEvents } from '../../services/api/Occultation'
import { listAllBaseDynClass } from '../../services/api/Asteroid'

function BaseDynclassSelect({ value, onChange, source, error, required }) {
  const qKey = source === 'prediction' ? 'baseDynclassWithEvents' : 'baseDynclass'
  const qFn = source === 'prediction' ? allBaseDynclassWithEvents : listAllBaseDynClass

  const { data } = useQuery({
    queryKey: [qKey],
    queryFn: qFn,
    keepPreviousData: true,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnmount: false,
    refetchOnReconnect: false,
    retry: 1,
    staleTime: 1 * 60 * 60 * 1000
  })

  return (
    <FormControl size='normal' fullWidth required={required}>
      <InputLabel id='filter-base-dynclass-select-label'>Dynamic class</InputLabel>
      <Select
        labelId='filter-base-dynclass-select-label'
        id='filter-base-dynclass-select'
        value={value !== undefined ? value : ''}
        label='Dynamic class'
        onChange={onChange}
        error={error}
      >
        {data !== undefined &&
          data.results.map((row) => {
            return (
              <MenuItem key={row} value={row}>
                {row}
              </MenuItem>
            )
          })}
      </Select>
    </FormControl>
  )
}

BaseDynclassSelect.defaultProps = {
  value: undefined,
  source: 'prediction',
  error: false,
  required: false
}
BaseDynclassSelect.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  source: PropTypes.oneOf(['asteroid', 'prediction']),
  error: PropTypes.bool,
  required: PropTypes.bool
}

export default BaseDynclassSelect
