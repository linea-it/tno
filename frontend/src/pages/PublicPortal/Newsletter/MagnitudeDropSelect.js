import PropTypes from 'prop-types'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import { Box, Card, CardContent, Grid } from '@mui/material'
import { WidthFull } from '@mui/icons-material'

function MagnitudeDropSelect({ value }) {
  //console.log(value)
  //console.log(value.filterValue)
  return (
    <FormControl size='normal' fullWidth >
        <CardContent >
      <TextField  label='fiter-type-select-label' id='fiter-type-select' value={value.magnitude_drop} label='Magnitude Drop' >
      </TextField >
      </CardContent>
    </FormControl>
  )
}

export default MagnitudeDropSelect