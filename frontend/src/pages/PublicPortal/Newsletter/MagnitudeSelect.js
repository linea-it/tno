import PropTypes from 'prop-types'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import { Box, Card, CardContent, Grid } from '../../../../node_modules/@mui/material/index'
import { WidthFull } from '../../../../node_modules/@mui/icons-material/index'

function MagnitudeSelect({ value }) {
  //console.log(value)
  //console.log(value.filterValue)
  return (
    <FormControl size='normal' fullWidth >
        <CardContent >
      <TextField  label='fiter-type-select-label' id='fiter-type-select' value={value.magnitude} label='Magnitude' >
      </TextField >
      </CardContent>
    </FormControl>
  )
}

export default MagnitudeSelect