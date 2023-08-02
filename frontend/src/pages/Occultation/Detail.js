import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { useParams } from 'react-router-dom'
import {
  Grid,
  Card,
  CardHeader,
  CardContent,
  CircularProgress
} from '@material-ui/core';
import List from '../../components/List';

import Aladin from '../../components/Aladin/index';
import {
  getOccultationById,
  getOccultationMap,
  getStarByOccultationId
} from '../../services/api/Occultation';
import useStyles from './styles'

function OccultationDetail() {
  const { id } = useParams();
  const [occultation, setOccultation] = useState({});
  const [starObj, setStarObj] = useState({});
  const [circumstances, setCircumstances] = useState([]);
  const [star, setStar] = useState([]);
  const [object, setObject] = useState([]);
  const [map, setMap] = useState(null);
  const [erroMap, setErroMap] = useState(false);
  const classes = useStyles()


  useEffect(() => {
    getOccultationById({ id }).then((res) => {
      setOccultation({
        ...res,
      });
    });
    getStarByOccultationId({ id }).then((res) => {
      setStarObj({
        ...res,
      });
    });
  }, [id]);

  useEffect(() => {
    if (occultation.date_time) {
      getOccultationMap({ object: occultation.name, date: occultation.date_time.split('T')[0], time: occultation.date_time.split('T')[1].replaceAll('Z', '') })
        .then((res) => {
        setMap(res.config.baseURL + res.config.url + '?body=' + encodeURI(occultation.name) + '&date=' + encodeURI(occultation.date_time.split('T')[0]) + '&time=' + encodeURI(occultation.date_time.split('T')[1].replaceAll('Z', '')));
      },
      ).catch((err) =>{
        setErroMap(true);
      });
    }
  }, [occultation])

  useEffect(() => {
    setCircumstances([
      {
        title: 'Instant of the Closest Approach',
        value: moment(occultation.date_time).utc().format(
          'ddd. DD MMMM YYYY HH:mm:ss'),
      },
      {
        title: 'Star position (ICRF)',
        tooltip:
          'Right Ascension and Declination with assumed proper motion in ICRF/J2000',
        value: `${occultation.ra_star_candidate} ${occultation.dec_star_candidate}`,
      },
      {
        title: 'Closest Approach',
        tooltip: 'Geocentric closest approach',
        value: `${occultation.closest_approach} (arcsec)`,
      },
      {
        title: 'Position Angle',
        tooltip: "Planet's position angle with respect to the star at closest approach",
        value: `${occultation.position_angle} (deg)`
      },
      {
        title: 'Velocity',
        tooltip:
          'Velocity on the plane of the sky. Positive is prograde, negative is retrograde',
        value: `${occultation.velocity} (km/s)`,
      },
      {
        title: 'Geocentric distance Δ',
        value: `${occultation.delta} (AU)`,
      },
      {
        title: 'G* mag*',
        tooltip: 'Gaia magnitude corrected from velocity',
        value: occultation.g_mag_vel_corrected,
      },
      {
        title: 'RP* mag*',
        tooltip: 'Gaia RP magnitude corrected from velocity',
        value: occultation.g_mag_vel_corrected,
      },
      {
        title: 'H* mag*',
        tooltip: '2MASS H magnitude corrected from velocity',
        value: occultation.h_mag_vel_corrected,
      },
      {
        title: 'Magnitude Drop',
        value: occultation.magnitude_drop,
      },
      {
        title: 'Uncertainty in Time',
        value: occultation.instant_uncertainty,
      },
    ]);

    setStar([
      {
        title: 'Star source ID',
        tooltip: 'Unique source identifier',
        value: `${starObj.source_id}`
      },
      {
        title: 'Stellar catalogue',
        value: 'Gaia DR2',
      },
      {
        title: 'Star astrometric position in catalogue (ICRF)',
        value: `${starObj.ra} ${starObj.dec}`,
      },
      {
        title: 'Star astrometric position with proper motion (ICRF)',
        value: `${occultation.ra_star_with_pm } ${occultation.dec_star_with_pm}`,
      },
      {
        title: 'Star apparent position (date)',
        value: `${occultation.ra_star_to_date } ${occultation.dec_star_to_date}`
      },
      {
        title: 'Proper motion',
        value: `${starObj.pmra?starObj.pmra.toFixed(4):0} ±${starObj.pmra_error?starObj.pmra_error.toFixed(4):0} ${starObj.pmdec?starObj.pmdec.toFixed(4):0} ±${starObj.pmdec_error?starObj.pmdec_error.toFixed(4):0} (mas/yr)`,
      },
      {
        title: 'Source of proper motion',
        value: 'Gaia DR2',
      },
      {
        title: 'Uncertainty in the star position',
        value: `${starObj.ra_error?starObj.ra_error.toFixed(4):0} ${starObj.dec_error?starObj.dec_error.toFixed(4):0} (mas)`,
      },
      {
        title: 'G magnitude',
        value: `${starObj.phot_g_mean_mag?starObj.phot_g_mean_mag.toFixed(4):0}`,
      },
      {
        title: 'RP magnitude (source: GaiaDR2)',
        value: `${starObj.phot_g_mean_mag?starObj.phot_g_mean_mag.toFixed(4):0}`,
      },
      {
        title: 'BP magnitude (source: GaiaDR2)',
        value:  `${starObj.phot_bp_mean_mag?starObj.phot_bp_mean_mag.toFixed(4):0}`,
      },
      {
        title: 'J magnitude (source: 2MASS)',
        value: `${occultation.j?occultation.j.toFixed(4):0}`,
      },
      {
        title: 'H magnitude (source: 2MASS)',
        value: `${occultation.h?occultation.h.toFixed(4):0}`,
      },
      {
        title: 'K magnitude (source: 2MASS)',
        value: `${occultation.k?occultation.k.toFixed(4):0}`,
      },
    ]);

    setObject([
      {
        title: 'Object',
        value: `${occultation.name} ${occultation.number?'('+occultation.number +')' :'' }`,
      },
      {
        title: 'Diameter',
        value: `${occultation.diameter} (Km)`
      },
      {
        title: 'Aparent Diameter',
        value: `${occultation.aparent_diameter} (mas)`,
      },
      {
        title: "Object's Astrometric Position (ICRF)",
        value: `${occultation.ra_target} ${occultation.dec_target}`,
      },
      {
        title: "Object's Apparent Position (date)",
        tooltip: "Relative to the Earth's center",
        value: `${occultation.ra_target_apparent} ${occultation.dec_target_apparent}`,
      },
      {
        title: 'Uncertainty in position',
        value: `RA: ${occultation.e_ra_target}, DEC: ${occultation.e_dec_target} (mas)`,
      },
      {
        title: 'Apparent Magnitude',
        value: `${occultation.apparent_magnitude}`,
      },
      {
        title: 'Ephemeris',
        value: `${occultation.ephemeris_version}`,
      },
      {
        title: 'Dynamic class',
        value: `${occultation.dynamic_class}`,
      },
      {
        title: 'Semimajor Axis',
        value: `${occultation.semimajor_axis} (AU)`,
      },
      {
        title: 'Eccentricity',
        value: `${occultation.eccentricity}`,
      },
      {
        title: 'Inclination',
        value: `${occultation.inclination} (deg)`,
      },
      {
        title: 'Perihelion',
        value: `${occultation.perihelion} (AU)`,
      },
      {
        title: 'Aphelion',
        value: `${occultation.aphelion} (AU)`,
      },
    ]);
  }, [occultation, starObj]);

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Occultation Prediction Map" />
            <CardContent className={classes.divImg}>
              { map && !erroMap &&
                <img
                  className={classes.mapImg}
                  src={map}
                  alt={occultation.name}
                />
              }
              {!map && !erroMap &&
                <CircularProgress
                  className={classes.circularProgress}
                  disableShrink
                  size={50}
                />
              }
              { erroMap &&
                <span className={classes.erroMap}>An error occurred while generating the map.</span>
              }
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Occultation Prediction Circumstances" />
            <CardContent>
              <List data={circumstances} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Occulted Star" />
            <CardContent>
              <List data={star} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Object" />
            <CardContent>
              <List data={object} />
            </CardContent>
          </Card>
        </Grid>
        {occultation.ra_star_candidate && occultation.dec_star_candidate ? (
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Sky map (Aladin)" />
              <CardContent>
                <Aladin
                  ra={occultation.ra_star_candidate}
                  dec={occultation.dec_star_candidate}
                />
              </CardContent>
            </Card>
          </Grid>
        ) : null}
      </Grid>
    </>
  );
}

export default OccultationDetail;
