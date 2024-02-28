import React from 'react'
import { useQuery } from 'react-query'
import PropTypes from 'prop-types'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import { listAllCatalogs } from '../../services/api/PredictJobs'

function StarCatalogSelect(props) {
  const { value, onChange, readOnly, ...rest } = props
  const { data, isLoading } = useQuery({
    queryKey: ['starCatalogs'],
    queryFn: listAllCatalogs,
    keepPreviousData: true,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnmount: false,
    refetchOnReconnect: false,
    retry: 1,
    staleTime: 5 * 60 * 60 * 1000
  })

  const handleChange = (newValue) => {
    // console.log('handleChange')
    if (newValue !== value) {
      onChange(newValue)
    }
  }

  return (
    <FormControl fullWidth sx={{ mb: 2 }} {...rest}>
      <InputLabel id='star-catalog-select-label'>Star Catalog</InputLabel>
      <Select
        labelId='star-catalog-select-label'
        id='star-catalog-select'
        value={value !== undefined && data !== undefined ? value : ''}
        label='Star Catalog'
        onChange={(e) => handleChange(e.target.value)}
        readOnly={readOnly}
      >
        {!isLoading &&
          data !== undefined &&
          data.map((row) => {
            return (
              <MenuItem key={row.id} value={row.id}>
                {row.display_name}
              </MenuItem>
            )
          })}
      </Select>
    </FormControl>
  )
}

StarCatalogSelect.defaultProps = {
  readOnly: false,
  error: false,
  required: false
}
StarCatalogSelect.propTypes = {
  value: PropTypes.number,
  onChange: PropTypes.func.isRequired,
  readOnly: PropTypes.bool,
  error: PropTypes.bool,
  required: PropTypes.bool
}

export default StarCatalogSelect
