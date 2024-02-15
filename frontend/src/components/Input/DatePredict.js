/* eslint-disable */
import React, { useState } from 'react'
import { makeStyles } from '@mui/styles'
import { LocalizationProvider, DatePicker } from '@material-ui/pickers'
import DateFnsUtils from '@date-io/date-fns'
import PropTypes from 'prop-types'

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  date: {
    marginTop: 10,
    marginBottom: 15,
    width: '90%',
    [theme.breakpoints.down('lg')]: {
      marginLeft: '5%'
    }
  }
}))

export default function DatePredict(props) {
  const classes = useStyles()
  const { label } = props

  const [id] = useState(props.titleId)

  const handleChange = (date) => {
    if (id === 'initialDate') {
      props.setSubmition({
        ...props.valueSubmition,
        ephemeris_initial_date: date
      })
      props.setInitialDate(date)
    } else {
      props.setSubmition({
        ...props.valueSubmition,
        ephemeris_final_date: date
      })
      props.setFinalDate(date)
    }
  }

  return (
    <LocalizationProvider utils={DateFnsUtils}>
      <DatePicker className={classes.date} format='yyyy-MM-dd' label={label} value={props.defaultDate} onChange={handleChange} />
    </LocalizationProvider>
  )
}

DatePredict.propTypes = {
  label: PropTypes.string.isRequired
}
