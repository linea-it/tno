/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable react/style-prop-object */
/* eslint-disable react/jsx-indent */
/* eslint-disable max-len */
import React from 'react'
import Grid from '@mui/material/Grid'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Link from '@mui/material/Link'
import styles from './styles'
import Box from '@mui/material/Box'

function PublicContact() {
  const classes = styles()
  return (
    <Box className={classes.initContainer}>
      <Container maxWidth='lg'>
        <Breadcrumbs aria-label='breadcrumb'>
          <Link color='inherit' href='/'>
            Home
          </Link>
          <Typography color='textPrimary'>Contact Us</Typography>
        </Breadcrumbs>
        <Grid item xs={9} className={classes.grid}>
          <Card sx={{ margin: '16px 0' }}>
            <CardContent>
              <Typography variant='h4' align='center' color='textPrimary'>
                Contact
              </Typography>
              <p>
                <span>
                  If you have any problems related to the usage of the applications,
                  <Link href='/docs/' variant='body2' target="_blank">
                    &nbsp;click here&nbsp;
                  </Link>
                  <br />
                  <p>To get in touch with technical support you can send an email to: helpdesk at linea dot org dot br</p>
                  We stand ready to assist you with any inquiries, ideas, or remarks you may have.
                </span>
              </p>
            </CardContent>
          </Card>
        </Grid>
      </Container>
    </Box>
  )
}
export default PublicContact
