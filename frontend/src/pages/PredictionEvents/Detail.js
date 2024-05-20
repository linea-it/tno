import React, { useEffect, useState } from 'react'
import moment from 'moment'
import { useParams } from 'react-router-dom'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import List from '../../components/List'
import Typography from '@mui/material/Typography'
import Link from '@mui/material/Link'
import Container from '@mui/material/Container'

import IconButton from '@mui/material/IconButton'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'

import { getOccultationById, getStarByOccultationId } from '../../services/api/Occultation'
import PredictOccultationMap from './partials/PredictMap'
import AladinV3 from '../../components/AladinV3/index'

function PredictionEventDetail() {
  const { id } = useParams()
  const [occultation, setOccultation] = useState({})
  const [starObj, setStarObj] = useState({})
  const [circumstances, setCircumstances] = useState([])
  const [star, setStar] = useState([])
  const [object, setObject] = useState([])

  useEffect(() => {
    getOccultationById({ id }).then((res) => {
      setOccultation({
        ...res
      })
    })
    getStarByOccultationId({ id }).then((res) => {
      setStarObj({
        ...res
      })
    })
  }, [id])

  useEffect(() => {
    const titleText = `Occultation by ${occultation.name} ${occultation.number ? '(' + occultation.number + ')' : ''}`
    document.title = titleText
  }, [occultation])

  useEffect(() => {
    setCircumstances([
      {
        title: 'Instant of the closest approach',
        value: moment(occultation.date_time).utc().format('ddd. DD MMMM YYYY HH:mm:ss')
      },
      {
        title: 'Star position (ICRF)',
        // tooltip: 'Right Ascension and Declination with assumed proper motion in ICRF/J2000',
       },
      {
        title: 'RA',
        // tooltip: 'Right Ascension and Declination with assumed proper motion in ICRF/J2000',
        value: `RA ${occultation.ra_star_candidate}`
      },
      {
        title: 'Dec',
        // tooltip: 'Right Ascension and Declination with assumed proper motion in ICRF/J2000',
        value: `Dec ${occultation.dec_star_candidate}`
      },
      {
        title: 'Closest approach',
        // tooltip: 'Geocentric closest approach',
        value: `${occultation.closest_approach} (arcsec)`
      },
      {
        title: 'Position angle',
        // tooltip: "Planet's position angle with respect to the star at closest approach",
        value: `${occultation.position_angle} (deg)`
      },
      {
        title: 'Velocity',
        // tooltip: 'Velocity on the plane of the sky. Positive is prograde, negative is retrograde',
        value: `${occultation.velocity} (km/s)`
      },
      {
        title: 'Geocentric distance',
        value: `${occultation.delta} (AU)`
      },
      {
        title: 'Event duration',
        value: `${occultation.event_duration ? occultation.event_duration.toFixed(1) : null} (s)`
      },
      {
        title: 'Star magnitude (Gaia)',
        // tooltip: 'Gaia magnitude',
        value: `${occultation.g_star ? occultation.g_star.toFixed(3) : null}`
      },
      {
        title: 'H mag (2MASS)',
        // tooltip: '2MASS H magnitude',
        value: `${occultation.h_star ? occultation.h_star.toFixed(3) : null}`
      },
      {
        title: 'Moon separation',
        value: `${occultation.moon_separation ? occultation.moon_separation.toFixed(1) : null} (deg)`
      },
      {
        title: 'Sun elongation',
        value: `${occultation.sun_elongation ? occultation.sun_elongation.toFixed(1) : null} (deg)`
      },
      {
        title: 'Uncertainty in Time',
        value: `${occultation.instant_uncertainty ? occultation.instant_uncertainty.toFixed(1) : null}`
      },
      {
        title: 'Creation date',
        // tooltip: "Date of the prediction's computation",
        value: `${occultation.created_at ? moment(occultation.created_at).utc() : null}`
      }
    ])

    setStar([
      // {
      //   title: 'Star source ID',
      //   tooltip: 'Unique source identifier',
      //   value: `${starObj.source_id}`
      // },
      {
        title: 'Stellar catalogue',
        value: 'Gaia DR3'
      },
      {
        title: 'Star astrometric position in catalogue (ICRF)'
      },
      {
        title: 'RA',
        value: `RA ${starObj.ra ? starObj.ra.toFixed(8) : null}`
      },
      {
        title: 'Dec',
        value: `Dec ${starObj.dec ? starObj.dec.toFixed(7) : null}`
      },
      {
        title: 'Star astrometric position with proper motion (ICRF)',
        value: `RA ${occultation.ra_star_with_pm}, Dec ${occultation.dec_star_with_pm}`
      },
      {
        title: 'Star apparent position (date)',
        value: `RA ${occultation.ra_star_to_date}, Dec ${occultation.dec_star_to_date}`
      },
      {
        title: 'Proper motion',
        value: `RA ${starObj.pmra ? starObj.pmra.toFixed(1) : null} ±${starObj.pmra_error ? starObj.pmra_error.toFixed(1) : null}, Dec ${
          starObj.pmdec ? starObj.pmdec.toFixed(1) : null
        } ±${starObj.pmdec_error ? starObj.pmdec_error.toFixed(1) : null} (mas/yr)`
      },
      {
        title: 'Source of proper motion',
        value: 'Gaia DR3'
      },
      {
        title: 'Uncertainty in the star position',
        value: `RA ${starObj.ra_error ? starObj.ra_error.toFixed(1) : null}, Dec ${
          starObj.dec_error ? starObj.dec_error.toFixed(1) : null
        } (mas)`
      },
      {
        title: 'G magnitude (source: Gaia DR3)',
        value: `${starObj.phot_g_mean_mag ? starObj.phot_g_mean_mag.toFixed(3) : null}`
      },
      {
        title: 'RP magnitude (source: Gaia DR3)',
        value: `${starObj.phot_g_mean_mag ? starObj.phot_g_mean_mag.toFixed(3) : null}`
      },
      {
        title: 'BP magnitude (source: Gaia DR3)',
        value: `${starObj.phot_bp_mean_mag ? starObj.phot_bp_mean_mag.toFixed(3) : null}`
      },
      {
        title: 'J magnitude (source: 2MASS)',
        value: `${occultation.j_star ? occultation.j_star.toFixed(3) : null}`
      },
      {
        title: 'H magnitude (source: 2MASS)',
        value: `${occultation.h_star ? occultation.h_star.toFixed(3) : null}`
      },
      {
        title: 'K magnitude (source: 2MASS)',
        value: `${occultation.k_star ? occultation.k_star.toFixed(3) : null}`
      }
    ])

    setObject([
      {
        title: 'Object',
        value: `${occultation.name} ${occultation.number ? '(' + occultation.number + ')' : ''}`
      },
      {
        title: "Object's astrometric position (ICRF)"
      },
      {
        title: "RA",
        value: `RA ${occultation.ra_target}`
      },
      {
        title: "Dec",
        value: `Dec ${occultation.dec_target}`
      },
      // {
      //   title: "Object's Apparent Position (date)",
      //   tooltip: "Relative to the Earth's center",
      //   value: `RA ${occultation.ra_target_apparent}, Dec ${occultation.dec_target_apparent}`
      // },
      {
        title: 'Absolute magnitude',
        value: `${occultation.h ? occultation.h.toFixed(3) : null}`
      },
      {
        title: 'Apparent magnitude',
        value: `${occultation.apparent_magnitude ? occultation.apparent_magnitude.toFixed(3) : null}`
      },
      {
        title: 'Diameter',
        value: `${
          occultation.diameter
            ? occultation.diameter < 1
              ? (occultation.diameter * 1000).toFixed(0) + ' (m)'
              : occultation.diameter.toFixed(0) + ' (Km)'
            : null
        }`
      },
      {
        title: 'Apparent diameter',
        value: `${occultation.apparent_diameter ? occultation.apparent_diameter.toFixed(4) : null} (mas)`
      },
      {
        title: 'Uncertainty in position',
        value: `RA ${occultation.e_ra_target}, Dec ${occultation.e_dec_target} (mas)`
      },
      {
        title: 'Ephemeris',
        value: `${occultation.ephemeris_version ? occultation.ephemeris_version : null}`
      },
      {
        title: 'Dynamic class (Skybot)',
        value: `${occultation.dynclass}`
      },
      // {
      //   title: 'Dynamic class (Lowell Observatory)',
      //   value: `${occultation.astorb_dynbaseclass ? occultation.astorb_dynbaseclass : null}`
      // },
      {
        title: 'Semi-major axis',
        value: `${occultation.semimajor_axis ? occultation.semimajor_axis.toFixed(4) : null} (AU)`
      },
      {
        title: 'Eccentricity',
        value: `${occultation.eccentricity ? occultation.eccentricity.toFixed(4) : null} (AU)`
      },
      {
        title: 'Inclination',
        value: `${occultation.inclination ? occultation.inclination.toFixed(4) : null} (deg)`
      },
      {
        title: 'Perihelion',
        value: `${occultation.perihelion ? occultation.perihelion.toFixed(4) : null} (AU)`
      },
      {
        title: 'Aphelion',
        value: `${occultation.aphelion ? occultation.aphelion.toFixed(4) : null} (AU)`
      }
    ])
  }, [occultation, starObj])

  return (
    <Container maxWidth='lg'>
      <Typography variant='h4' align='center' sx={{ marginTop: 3 }}>
        Occultation by {occultation.name} {occultation.number ? `(${occultation.number})` : ''}
      </Typography>
      <Typography variant='h5' align='center' color='text.secondary'>
        {moment(occultation.date_time).format('ll')}
      </Typography>
      <Grid container spacing={2} sx={{ marginTop: '10px' }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              title='Occultation Prediction Circumstances'
              action={
                <>
                  <IconButton href='/docs/user-guide/occultation-details-page/' target='_blank' aria-label='help'>
                    <HelpOutlineIcon />
                  </IconButton>
                </>
              }
            />
            <CardContent>
              <List data={circumstances} />
            </CardContent>
          </Card>
        </Grid>
        {occultation.id !== undefined && (
          <Grid item xs={12} md={6}>
            <PredictOccultationMap occultationId={occultation.id} />
          </Grid>
        )}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title='Occulted Star' />
            <CardContent>
              <List data={star} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title='Object' />
            <CardContent>
              <List data={object} />
              <Box sx={{ marginLeft: 2 }}>
                {occultation.name && (
                  <>
                    <Typography sx={{ marginBottom: '5px' }}>More information:</Typography>
                    <Link
                      href={`https://ssp.imcce.fr/forms/ssocard/${encodeURI(occultation.name.replace(/\s/g, '_'))}`}
                      target='_blank'
                      rel='noopener noreferrer'
                      sx={{ textDecoration: 'none' }}
                    >
                      SsODNet service at IMCCE
                    </Link>
                    <br />
                    <Link
                      href={`https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=${encodeURI(occultation.name)}`}
                      target='_blank'
                      rel='noopener noreferrer'
                      sx={{ textDecoration: 'none' }}
                    >
                      Small-Body Database Lookup NASA/JPL
                    </Link>
                  </>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardHeader title='Aladin Sky Atlas' />
            <CardContent>
              <Box height={800}>
                {occultation?.id !== undefined && <AladinV3 ra={occultation?.ra_star_deg} dec={occultation?.dec_star_deg} />}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  )
}

export default PredictionEventDetail
