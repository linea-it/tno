import React from 'react'
import PropTypes from 'prop-types'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'

function ObjectDiameterFilter({ value, onChange }) {
  const handleChange = (newValue) => {
    onChange(newValue)
  }
  return (
    <Grid container spacing={2} alignItems='center'>
      <Grid item xs={12}>
        <Grid container spacing={2} alignItems='center'>
          <Grid item xs={12} sm={6}>
            <TextField
              type='number'
              label='Diameter Min (Km)'
              variant='outlined'
              value={value.diameterMin !== undefined ? value.diameterMin : ''}
              onChange={(event) => {
                handleChange({
                  ...value,
                  diameterMin: event.target.value
                })
              }}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              type='number'
              label='Diameter Max (Km)'
              variant='outlined'
              value={value.diameterMax !== undefined ? value.diameterMax : ''}
              onChange={(event) => {
                handleChange({
                  ...value,
                  diameterMax: event.target.value
                })
              }}
              fullWidth
            />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}

ObjectDiameterFilter.defaultProps = {
  value: {
    diameter_min: undefined,
    diameter_max: undefined
  }
}

ObjectDiameterFilter.propTypes = {
  value: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired
}

export default ObjectDiameterFilter
