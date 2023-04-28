/* eslint-disable max-len */
/* eslint-disable eqeqeq */
import React, { useState, useEffect } from 'react'
import {
  Container,
  Typography,
  Grid, 
  Breadcrumbs,
  Link
} from '@material-ui/core'
import styles from './styles'

function PublicTutorials() {
  const classes = styles()
  const opts = { width: '100%' }
  
  return (
    <div className={classes.initContainer}>
      <Container>
        <Breadcrumbs aria-label='breadcrumb'>          
          <Link color='inherit' to='/'>
            Home
          </Link>
          <Typography color='textPrimary'>Tutorials</Typography>
        </Breadcrumbs>
        <Grid container spacing={9} direction='row' justifyContent='space-evenly' alignItems='flex-start' className={classes.root}>
          <Grid item xs={12}>
            <label>Em construção</label>
          </Grid>          
        </Grid>
      </Container>
    </div>
  )
}

export default PublicTutorials
