import PropTypes from 'prop-types'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import { CardContent } from '../../../../node_modules/@mui/material/index'

function FrequencyTypeSelect({ value }) {
  //console.log(value)
  return (
    <FormControl size='normal' fullWidth>
      <CardContent>
      { value.frequency == 1 ?
      <TextField labelId='frequency-type-select-label' id='frequency-type-select' value='Monthly' label='Frequency' >
        Monthly
      </TextField>
      :
      <TextField labelId='frequency-type-select-label' id='frequency-type-select' value='Weekly' label='Frequency' >
        Weekly
      </TextField>
      }
      
      </CardContent>
    </FormControl>
  )
}

export default FrequencyTypeSelect
