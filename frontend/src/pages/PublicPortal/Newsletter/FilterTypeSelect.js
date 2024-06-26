import PropTypes from 'prop-types'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import { Box, Card, CardContent, Grid } from '../../../../node_modules/@mui/material/index'
import { WidthFull } from '../../../../node_modules/@mui/icons-material/index'

function FilterTypeSelect({ value }) {
  //console.log(value.filterType)
  //console.log(value.filterValue)
  return (
    <FormControl size='normal' fullWidth >
      
        <CardContent >
      <TextField sx={{ paddingRight: '20px' }} label='fiter-type-select-label' id='fiter-type-select' value={value.filterType} label='Filter Type' >
      </TextField >
      <TextField sx={{ paddingRight: '20px' }} label='fiter-type-select-label' id='fiter-type-select' value={value.filterValue} label='Filter Value' >
      
      </TextField >
      </CardContent>
    </FormControl>
  )
}

export default FilterTypeSelect