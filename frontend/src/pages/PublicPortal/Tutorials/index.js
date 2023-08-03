/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable react/style-prop-object */
/* eslint-disable react/jsx-indent */
/* eslint-disable max-len */
import React from 'react'
import { Grid, Container, Typography, Breadcrumbs, Link } from '@material-ui/core'
import styles from './styles'

function PublicTutorials() {
  const classes = styles()
  return (
    <div className={classes.initContainer}>
      <Container>
        <Grid item xs={12} className={classes.grid}>
          <Breadcrumbs aria-label='breadcrumb'>
            <Link color='inherit' to='/'>
              Home
            </Link>
            <Typography color='textPrimary'>Tutorials</Typography>
          </Breadcrumbs>
          <Typography gutterBottom className={classes.textFormat} variant='overline' component='h2'>
            <Grid item md={7} sm={10} className={classes.grid}>
              <div>
                <p>
                  <strong>
                    <em>Filtering Occultations</em>
                  </strong>
                </p>
                <p>
                  <span>                  
                    <p>In this database, we have a vast number of stellar occultation predictions. Let's explore some filtering options to help you find more interesting events. Along with advanced filters, you can also sort the output lists by any visible (or hidden) column.</p>
                    <p>The <b>Period filter</b> allows you to constrain the date range of interest.</p>
                    <p><b>All events</b> displays every event available in our database.</p>
                    <p>The <b>Next 20 events</b> will show the upcoming 20 occurrences based on the current access date.</p>
                    <p>If you choose <b>User Selected</b>, you gain access to more advanced options to refine your events as follows:</p>
                    <ol>
                      <li><em>Date range:</em> Select an initial and final date range of interest.</li>
                      <li><em>Filter Type:</em> Customize the name or dynamical type of the objects of interest.
                        <ul>
                          <li>When choosing <b>Object name</b>, you can type the asteroid number or designated name in the <b>Filter Value</b> field to perform a lookup in the database. If the object doesn't show up during typing, it means it's not registered in our database.</li>
                          <li>When selecting <b>Dynamical class</b> or <b>Dynamical class (with subclasses)</b>, you can choose the relevant class or subclass in the <b>Filter Value</b> field.</li>
                        </ul>
                      </li>
                      <li><em>Magnitude:</em> Filter events based on the stellar magnitude range of interest. The default value is 14, but predictions are available for much deeper values.</li>
                      <li><em>Geo Filter</em> (experimental): This feature allows finding occultations occurring within a specified latitude and longitude on Earth, with a given radius in kilometers. Please note that due to its time-consuming nature, <b>you must use other filters in advance to reduce the list to a maximum of 200 predictions</b>. This is necessary to avoid server timeouts since the default connection limit is 120 seconds. Sorting is disabled by default when using the Geo Filter. We are working to make this functionality faster in future releases.</li>
                    </ol>
                    <p>Direct API search methods will be available soon.</p>
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
export default PublicTutorials
