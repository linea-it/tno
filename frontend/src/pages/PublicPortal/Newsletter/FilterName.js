import PropTypes from 'prop-types'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import { Box, Card, CardContent, Grid } from '@mui/material'
import { WidthFull } from '@mui/icons-material'

function FilterName({ value }) {
  //console.log(value)
  //console.log(value.filterValue)
  return (
    <FormControl size='normal' fullWidth >
        <CardContent >
      <TextField  labelId='fiter-type-select-label' id='fiter-type-select' value={value.filter_name} label='Magnitude Drop' >
      </TextField >
      </CardContent>
    </FormControl>
  )
}

export default FilterName