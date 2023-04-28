/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable react/style-prop-object */
/* eslint-disable react/jsx-indent */
/* eslint-disable max-len */
import React from 'react'
import { Grid, Container, Typography, Breadcrumbs, Link } from '@material-ui/core'
import styles from './styles'

function PublicAboutUs() {
  const classes = styles()
  return (
    <div className={classes.initContainer}>
      <Container>
        <Grid item xs={12} className={classes.grid}>
          <Breadcrumbs aria-label='breadcrumb'>
            <Link color='inherit' to='/'>
              Home
            </Link>
            <Typography color='textPrimary'>About</Typography>
          </Breadcrumbs>
          <Typography gutterBottom className={classes.textFormat} variant='overline' component='h2'>
            <Grid item md={7} sm={10} className={classes.grid}>
              <div>
                <p>
                  <strong>
                    <em>About us</em>
                  </strong>
                </p>
                <p>
                  <span>
                    Em construção
                  </span>
                </p>
              </div>
            </Grid>
          </Typography>
        </Grid>
      </Container>
    </div>
  )
}

export default PublicAboutUs
