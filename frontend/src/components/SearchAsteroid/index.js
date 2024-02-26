import React, { useContext, useRef } from 'react'
import PropTypes from 'prop-types'
import SearchIcon from '@mui/icons-material/Search'
import IconButton from '@mui/material/IconButton'
import OutlinedInput from '@mui/material/OutlinedInput'
import InputLabel from '@mui/material/InputLabel'
import InputAdornment from '@mui/material/InputAdornment'
import FormControl from '@mui/material/FormControl'
import ClearIcon from '@mui/icons-material/Clear'
import { PredictionEventsContext } from '../../contexts/PredictionContext'

function SearchInput(props) {
  const { debounceTimeout, ...rest } = props

  const { queryOptions, setQueryOptions } = useContext(PredictionEventsContext)

  const timerRef = useRef()
  const fieldRef = useRef()

  const handleChange = (event) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    timerRef.current = window.setTimeout(() => {
      handleDebounce(event.target.value)
    }, debounceTimeout)
  }

  const handleDebounce = (value) => {
    console.log('TESTE: %o', value)
    if (value === '') {
      value = undefined
    }
    setQueryOptions((prev) => {
      return {
        ...prev,
        search: value
      }
    })
  }

  const handleClearSearch = () => {
    fieldRef.current.value = ''
    setQueryOptions((prev) => {
      return {
        ...prev,
        search: undefined
      }
    })
  }
  const handleMouseDownPassword = (event) => {
    event.preventDefault()
  }

  return (
    <FormControl fullWidth>
      <InputLabel htmlFor='search-asteroid-input'>Search</InputLabel>
      <OutlinedInput
        id='search-asteroid-input'
        inputRef={fieldRef}
        {...rest}
        startAdornment={
          <InputAdornment position='start'>
            <SearchIcon />
          </InputAdornment>
        }
        label='Search'
        onChange={handleChange}
        endAdornment={
          queryOptions.search && (
            <InputAdornment position='end'>
              <IconButton
                aria-label='toggle password visibility'
                onClick={handleClearSearch}
                onMouseDown={handleMouseDownPassword}
                edge='end'
              >
                <ClearIcon />
              </IconButton>
            </InputAdornment>
          )
        }
      />
    </FormControl>
  )
}

SearchInput.defaultProps = {
  debounceTimeout: 400
}

SearchInput.propTypes = {
  debounceTimeout: PropTypes.number
}

export default SearchInput
