import * as React from 'react';
import PropTypes from 'prop-types';
import { useQuery } from 'react-query';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { listAllAsteroidsWithEvents } from '../../services/api/Occultation';
import CircularProgress from '@mui/material/CircularProgress';
// import { debounce } from '@mui/material/utils';
function AsteroidNameSelect({ value, onChange }) {

  const [inputValue, setInputValue] = React.useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['asteroidsWithEvents', {name: inputValue}],
    queryFn: listAllAsteroidsWithEvents ,
    keepPreviousData: true,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnmount: false,
    refetchOnReconnect: false,
    // retry: 1,
    staleTime: 1 * 60 * 60 * 1000,
  })

  return (
    <Autocomplete
      multiple
      options={ data !== undefined ? data.results : []}
      getOptionLabel={(option) => option.name}
      loading={isLoading}
      limitTags={1}
      sx={{minWidth: '50ch'}}
      filterSelectedOptions
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      onChange={(event, newValue) => {
        onChange(newValue)
      }}

      renderInput={(params) => (
        <TextField
          {...params}
          label="Asteroid Name"
          variant="outlined"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
        />
      )}
    />
  )
}

AsteroidNameSelect.defaultProps = {
  value: 'name'
}

AsteroidNameSelect.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
};

export default AsteroidNameSelect

// return (
//   {/* <FormControl sx={{width: '50ch'}}> */}
//   {/* <FormControl fullWidth> */}
//    {/* <InputLabel id="asteroid-name-select-label">Asteroid Name</InputLabel> */}
//    <Autocomplete
//      multiple
//      // id="asteroid-name-select"
//      options={ data !== undefined ? data.results : []}
//      getOptionLabel={(option) => option.name}
//      loading={isLoading}
//      limitTags={3}
//      size="small"
//      // filterOptions={(x) => x}
//      // defaultValue={[]}
//      // filterSelectedOptions
//      onInputChange={(event, newInputValue) => {
//        console.log("InputValue:", newInputValue)
//        setInputValue(newInputValue);
//      }}
//      renderInput={(params) => (
//        <TextField
//          {...params}
//          label="Asteroid Name"
//          // labelId="asteroid-name-select-label"
//          variant="outlined"
//          InputProps={{
//            ...params.InputProps,
//            endAdornment: (
//              <React.Fragment>
//                {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
//                {params.InputProps.endAdornment}
//              </React.Fragment>
//            ),
//          }}
//        />
//      )}
//    />
//  {/*  </FormControl> */}
// )

// return (
//     <FormControl>
//       <InputLabel id="asteroid-name-select-label">Filter Type</InputLabel>
//       <Select
//         labelId="asteroid-name-select-label"
//         id="asteroid-name-select"
//         name="name"
//         value={value}
//         label="Asteroid Name"
//         onChange={onChange}
//       >
//         <MenuItem value={'name'}>Object name</MenuItem>
//         <MenuItem value={'base_dynclass'}>Dynamic class</MenuItem>
//         <MenuItem value={'dynclass'}>Dynamic class (with subclasses)</MenuItem>
//       </Select>
//     </FormControl>
