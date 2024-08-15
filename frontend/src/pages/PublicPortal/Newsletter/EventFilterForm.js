import React from 'react'
import PropTypes from 'prop-types'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import FrequencyTypeSelect from '../../../components/Newsletter/Frequency/FrequencyTypeSelect'

export default function EventFilterForm({ data, onChange }) {
  const handleChange = (e) => {
    const newData = { ...data, [e.target.name]: e.target.value }
    onChange(newData)
  }
  return (
    <Box component='form' autoComplete='off'>
      <Stack spacing={2}>
        <Stack direction='row' spacing={2}>
          <TextField required name='filter_name' label='Filter Name' value={data.filter_name} onChange={handleChange} fullWidth />
          <FrequencyTypeSelect value={data.frequency} onChange={handleChange} name='frequency' />
        </Stack>
        <TextField label='Description' name='description' value={data.description} onChange={handleChange} multiline rows={4} />
      </Stack>
    </Box>
  )
}

EventFilterForm.defaultProps = {
  data: undefined
}
EventFilterForm.propTypes = {
  data: PropTypes.object
}
