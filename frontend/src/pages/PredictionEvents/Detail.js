import React, { useEffect, useState } from 'react'
import moment from 'moment'
import { useParams } from 'react-router-dom'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Link from '@mui/material/Link'
import Container from '@mui/material/Container'
import IconButton from '@mui/material/IconButton'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'

import List from '../../components/List'
import { getOccultationById, getStarByOccultationId } from '../../services/api/Occultation'
//import PredictOccultationMap from './partials/PredictMap'
import PredictOccultationMap from './partials/OccultationMap/index'
import AladinV3 from '../../components/AladinV3/index'
import AlertEnvironment from '../../components/AlertEnvironment/index'
import { whichEnvironment } from '../../services/api/Auth'

function PredictionEventDetail() {
  const { id } = useParams()
  const [occultation, setOccultation] = useState({})
  const [starObj, setStarObj] = useState({})
  const [circumstances, setCircumstances] = useState([])
  const [star, setStar] = useState([])
  const [object, setObject] = useState([])
  const [isDev, setIsDev] = useState(false)

  useEffect(() => {
    whichEnvironment()
      .then((res) => {
        setIsDev(res.is_dev)
      })
      .catch(() => {
        // TODO: Aviso de erro
      })
  }, [])

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
    const titleText = `Occultation by ${occultation.name} ${occultation.number ? `(${occultation.number})` : ''}`
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
        value: `RA ${occultation.ra_star_candidate}, Dec ${occultation.dec_star_candidate}`,
        breakline: true
      },
      {
        title: 'Closest approach',
        value: occultation.closest_approach
          ? occultation.closest_approach < 0.1
            ? `${(occultation.closest_approach * 1000).toFixed(1)} (mas)`
            : `${occultation.closest_approach.toFixed(3)} (arcsec)`
          : null
      },
      {
        title: 'Position angle',
        value: `${occultation.position_angle} (deg)`
      },
      {
        title: 'Velocity',
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
        value: `${occultation.g_star ? occultation.g_star.toFixed(3) : null}`
      },
      {
        title: 'H mag (2MASS)',
        value: `${occultation.h_star ? occultation.h_star.toFixed(3) : null}`
      },
      {
        title: 'Magnitude drop',
        value: `${occultation.magnitude_drop ? occultation.magnitude_drop.toFixed(1) : null} (mag)`
      },
      {
        title: 'Uncertainty in time (1σ)',
        value: `${
          occultation.instant_uncertainty
            ? occultation.instant_uncertainty > 9999
              ? `${occultation.instant_uncertainty.toExponential(3)} (s)`
              : `${occultation.instant_uncertainty.toFixed(1)} (s)`
            : null
        }`
      },
      {
        title: 'Uncertainty in closest approach (1σ)',
        value: `${
          occultation.closest_approach_uncertainty_km
            ? occultation.closest_approach_uncertainty_km < 1
              ? `${(occultation.closest_approach_uncertainty_km * 1000).toFixed(0)} (m)`
              : occultation.closest_approach_uncertainty_km >= 100000
              ? `${occultation.closest_approach_uncertainty_km.toExponential(3)} (Km)`
              : `${occultation.closest_approach_uncertainty_km.toFixed(0)} (Km)`
            : null
        }`
      },
      {
        title: 'Moon separation',
        value: `${occultation.moon_separation ? occultation.moon_separation.toFixed(1) : null} (deg)`
      },
      {
        title: 'Moon illuminated fraction',
        value: `${occultation.moon_illuminated_fraction ? (occultation.moon_illuminated_fraction * 100).toFixed(1) : null}%`
      },
      {
        title: 'Sun elongation',
        value: `${occultation.sun_elongation ? occultation.sun_elongation.toFixed(1) : null} (deg)`
      },
      {
        title: 'Creation date',
        value: `${occultation.created_at ? moment(occultation.created_at).utc() : null}`
      },
      {
        title: 'Ephemeris Source',
        value: `${occultation.bsp_source ? occultation.bsp_source : null}`
      }
    ])

    setStar([
      {
        title: 'Stellar catalogue',
        value: 'Gaia DR3'
      },
      {
        title: 'Star astrometric position in catalogue (ICRF)',
        value: `RA ${starObj.ra ? starObj.ra.toFixed(8) : null}, Dec ${starObj.dec ? starObj.dec.toFixed(7) : null}`,
        breakline: true
      },
      {
        title: 'Star astrometric position with proper motion (ICRF)',
        value: `RA ${occultation.ra_star_with_pm}, Dec ${occultation.dec_star_with_pm}`,
        breakline: true
      },
      {
        title: 'Star apparent position (date)',
        value: `RA ${occultation.ra_star_to_date}, Dec ${occultation.dec_star_to_date}`,
        breakline: true
      },
      {
        title: 'Proper motion',
        value: `RA ${starObj.pmra ? starObj.pmra.toFixed(2) : null} ±${
          starObj.pmra_error ? starObj.pmra_error.toFixed(2) : null
        } (mas/yr), Dec ${starObj.pmdec ? starObj.pmdec.toFixed(2) : null} ±${
          starObj.pmdec_error ? starObj.pmdec_error.toFixed(2) : null
        } (mas/yr)`,
        breakline: true
      },
      {
        title: 'Source of proper motion',
        value: 'Gaia DR3'
      },
      {
        title: 'Uncertainty in the star position',
        value: `RA ${starObj.ra_error ? starObj.ra_error.toFixed(3) : null} (mas), Dec ${
          starObj.dec_error ? starObj.dec_error.toFixed(3) : null
        } (mas)`,
        breakline: true
      },
      {
        title: 'G magnitude (source: Gaia DR3)',
        value: `${starObj.phot_g_mean_mag ? starObj.phot_g_mean_mag.toFixed(3) : null}`
      },
      {
        title: 'RP magnitude (source: Gaia DR3)',
        value: `${starObj.phot_rp_mean_mag ? starObj.phot_rp_mean_mag.toFixed(3) : null}`
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
        title: 'Identification',
        value: `${occultation.name} ${occultation.number ? `(${occultation.number})` : ''}, ${occultation.principal_designation}`
      },
      {
        title: 'Dynamic class (Skybot)',
        value: `${occultation.dynclass}`
      },
      {
        title: 'Astrometric position (ICRF)',
        value: `RA ${occultation.ra_target}, Dec ${occultation.dec_target}`,
        breakline: true
      },
      {
        title: 'Uncertainty in position (1σ)',
        value: `${
          occultation.e_ra_target
            ? occultation.e_ra_target > 9999 || occultation.e_dec_target > 9999
              ? `RA ${occultation.e_ra_target.toExponential(3)} (arcsec), Dec ${occultation.e_dec_target.toExponential(3)} (arcsec)`
              : occultation.e_ra_target < 0.1 || occultation.e_dec_target < 0.1
              ? `RA ${(occultation.e_ra_target * 1e3).toFixed(1)} (mas), Dec ${(occultation.e_dec_target * 1e3).toFixed(1)} (mas)`
              : `RA ${occultation.e_ra_target.toFixed(1)} (arcsec), Dec ${occultation.e_dec_target.toFixed(1)} (arcsec)`
            : null
        }`,
        breakline: true
      },
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
              ? `${(occultation.diameter * 1000).toFixed(0)} (m)`
              : `${occultation.diameter.toFixed(0)} (Km)`
            : null
        }`
      },
      {
        title: 'Apparent diameter',
        value: `${occultation.apparent_diameter ? occultation.apparent_diameter.toFixed(4) : null} (mas)`
      },
      {
        title: 'Ephemeris',
        value: `${occultation.ephemeris_version ? occultation.ephemeris_version : null}`
      },
      {
        title: 'Semi-major axis',
        value: `${occultation.semimajor_axis ? occultation.semimajor_axis.toFixed(4) : null} (AU)`
      },
      {
        title: 'Eccentricity',
        value: `${occultation.eccentricity ? occultation.eccentricity.toFixed(4) : null}`
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
      {isDev && <AlertEnvironment />}
      <Typography variant='h4' align='center' sx={{ marginTop: 3 }}>
        Occultation by {occultation.name} {occultation.number ? `(${occultation.number})` : ''}
      </Typography>
      <Typography variant='h5' align='center' color='text.secondary'>
        {moment(occultation.date_time).format('ll')}
      </Typography>
      <Grid container spacing={2} sx={{ marginTop: '10px' }}>
        {occultation.id !== undefined && (
          <Grid item xs={12}>
            <PredictOccultationMap occultationId={occultation.id} />
          </Grid>
        )}
        <Grid item xs={12} md={6} lg={6}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              title='Occultation Prediction Circumstances'
              action={
                <IconButton href='/docs/user-guide/occultation-details-page/' target='_blank' aria-label='help'>
                  <HelpOutlineIcon />
                </IconButton>
              }
            />
            <CardContent>
              <List data={circumstances} />
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
          <Card sx={{ height: '100%' }}>
            <CardHeader title='Occulted Star' />
            <CardContent>
              <List data={star} />
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
