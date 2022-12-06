/* eslint-disable */
import React, { useState } from 'react'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import { Select as MuiSelect } from '@material-ui/core'
import PropTypes from 'prop-types'

function SelectAstrometry(props) {
  const [defaultValue, setDefaultValue] = useState(props.default === 'noDefault' ? ' ' : 0)

  function handleChange(event) {
    setDefaultValue(event.target.value)

    const cases = event.currentTarget.getAttribute('case')

    switch (cases) {
      case 'input':
        props.setSubmition({
          ...props.valueSubmition,
          inputId: event.currentTarget.id
        })
        break

      case 'catalog':
        props.setSubmition({
          ...props.valueSubmition,
          refCatalogId: event.currentTarget.id
        })
        break

      case 'configuration':
        props.setSubmition({
          ...props.valueSubmition,
          configId: event.currentTarget.id
        })
        break
      default:
        props.setSubmition({
          ...props.valueSubmition,
          inputId: event.currentTarget.id
        })
    }
  }

  const { title } = props

  const loadMenuItems = () => {
    // Receive the props data from Astrometry.
    const generalArray = props.data

    // Display the names of the list
    // That is effectively shown on select
    // This comes from the props.
    const { display } = props
    const { value } = props

    // Create a map function to define(return) the MenuItems.

    if (generalArray && generalArray.length > 0) {
      return generalArray.map((el, i) => (
        <MenuItem key={i} id={el.id} value={i} title={props.title} case={props.case}>
          {eval(display)}
        </MenuItem>
      ))
    }
  }

  return (
    <form autoComplete='off'>
      <FormControl>
        <InputLabel htmlFor='input'>{title}</InputLabel>
        <MuiSelect
          // value={values.input}
          value={defaultValue}
          onChange={handleChange}
          inputProps={{ name: 'input', id: 'input-simple' }}
          displayEmpty
        >
          {/* Load here the menuItems automatically */}
          {loadMenuItems()}
        </MuiSelect>
      </FormControl>
    </form>
  )
}

SelectAstrometry.propTypes = {
  title: PropTypes.string.isRequired,
  default: PropTypes.string.isRequired,
  setSubmition: PropTypes.func.isRequired
}

export default SelectAstrometry
