import PropTypes from 'prop-types'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import { Box, Card, CardContent, Grid } from '@mui/material'
import { WidthFull } from '@mui/icons-material'

function ObjectDiameterFilter({ value }) {
  //console.log(value)
  //console.log(value.filterValue)
  return (
    <FormControl size='normal' fullWidth >
      <CardContent >
      <TextField sx={{ paddingRight: '10px' }} label='fiter-type-select-label' id='fiter-type-select' value={value.diameter_min} label='Diameter Min' >
      </TextField >
      <TextField  label='fiter-type-select-label' id='fiter-type-select' value={value.diameter_max} label='Diameter Max' >
      </TextField >
      </CardContent>
    </FormControl>
  )
}

export default ObjectDiameterFilter