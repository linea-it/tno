import React from 'react'
import PropTypes from 'prop-types'
import { Grid, FormControlLabel, Switch as MuiSwitch, Typography } from '@mui/material'
import useStyles from './styles'

function Switch({ isGrid, setIsGrid, titleOn, titleOff }) {
  const classes = useStyles()

  const handleSwitchChange = () => {
    setIsGrid((prev) => !prev)
  }

  return (
    <Grid container spacing={2} alignItems='center'>
      <Grid>
        <Typography variant='button' display='block' gutterBottom>
          {titleOff}
        </Typography>
      </Grid>
      <Grid>
        <FormControlLabel
          className={classes.switch}
          control={<MuiSwitch checked={isGrid} onChange={handleSwitchChange} color='default' />}
        />
      </Grid>
      <Grid>
        <Typography variant='button' display='block' gutterBottom>
          {titleOn}
        </Typography>
      </Grid>
    </Grid>
  )
}

Switch.propTypes = {
  isGrid: PropTypes.bool.isRequired,
  setIsGrid: PropTypes.func.isRequired,
  titleOn: PropTypes.string.isRequired,
  titleOff: PropTypes.string.isRequired
}

export default Switch
