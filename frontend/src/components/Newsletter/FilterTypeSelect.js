import FormControl from '@mui/material/FormControl'
import TextField from '@mui/material/TextField'
import { CardContent } from '@mui/material'

function FilterTypeSelect({ value }) {
  //console.log(value.filterType)
  //console.log(value.filterValue)
  return (
    <FormControl size='normal' fullWidth>
      <CardContent>
        <TextField sx={{ paddingRight: '20px' }} id='fiter-type-select' value={value.filterType} label='Filter Type'></TextField>
        <TextField sx={{ paddingRight: '20px' }} id='fiter-type-select' value={value.filterValue} label='Filter Value'></TextField>
      </CardContent>
    </FormControl>
  )
}

export default FilterTypeSelect
