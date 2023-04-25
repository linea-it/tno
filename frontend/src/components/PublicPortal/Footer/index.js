import React from 'react'
import { Grid } from '@material-ui/core'
import clsx from 'clsx'
import useStyles from './styles'

function PublicFooter() {
  const classes = useStyles()

  return (
    <footer className={clsx(classes.root, classes.appBarDrawerClose)}>
      <Grid container direction='row' alignItems='center'>
        <Grid item xs={12} alignItems='center'>
          <label className={classes.poweredBy}>LIneA Solar System Portal</label>
        </Grid>
      </Grid>
    </footer>
  )
}
export default PublicFooter
