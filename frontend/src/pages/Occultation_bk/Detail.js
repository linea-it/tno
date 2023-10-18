import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { useParams } from 'react-router-dom'
import {
  Grid,
  Card,
  CardHeader,
  CardContent} from '@material-ui/core';
import List from '../../components/List';

import Aladin from '../../components/Aladin/index';
import {
  getOccultationById,
  // getOccultationMap,
  getStarByOccultationId
} from '../../services/api/Occultation';
import useStyles from './styles'
import PredictOccultationMap from './partials/PredictMap';

function OccultationDetail() {
  const { id } = useParams();
  const [occultation, setOccultation] = useState({});
  const [starObj, setStarObj] = useState({});
  const [circumstances, setCircumstances] = useState([]);
  const [star, setStar] = useState([]);
  const [object, setObject] = useState([]);
  const [map, setMap] = useState(null);
  const [erroMap, setErroMap] = useState(false);


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

  // const createJsonOcc = (occ) =>{
  //   return {'name': occ.name,
  //   'radius': occ.diameter?occ.diameter:0,
  //   'coord': occ.ra_star_candidate + " " + occ.dec_star_candidate, 
  //   'time': new Date(occ.date_time).toISOString(), 
  //   'ca': occ.closest_approach,
  //   'pa': occ.position_angle,
  //   'vel': occ.velocity,
  //   'dist': occ.delta,
  //   'mag': occ.g,
  //   'longi': occ.long
  //   }
  // }

  // useEffect(() => {
  //   if (occultation.date_time) {
  //     const conteudo = createJsonOcc(occultation)
  //     getOccultationMap(conteudo)
  //       .then((res) => {
  //       setMap(res.config.baseURL + res.config.url + '?name=' + encodeURI(occultation.name) + '&time=' + encodeURI(new Date(occultation.date_time).toISOString()));
  //     },
  //     ).catch((err) =>{
  //       setErroMap(true);
  //     });
  //   }
  // }, [occultation])

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
        value: `${occultation.ra_star_candidate}, ${occultation.dec_star_candidate}`,
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
        value: `${occultation.g_mag_vel_corrected ? occultation.g_mag_vel_corrected.toFixed(3) : null}`,
      },
      {
        title: 'RP* mag*',
        tooltip: 'Gaia RP magnitude corrected from velocity',
        value: `${occultation.g_mag_vel_corrected ? occultation.g_mag_vel_corrected.toFixed(3) : null}`,
      },
      {
        title: 'H* mag*',
        tooltip: '2MASS H magnitude corrected from velocity',
        value: `${occultation.h_mag_vel_corrected ? occultation.h_mag_vel_corrected.toFixed(3) : null}`,
      },
      {
        title: 'Magnitude Drop',
        value: `${occultation.magnitude_drop ? occultation.magnitude_drop.toFixed(3) : null}`,
      },
      {
        title: 'Uncertainty in Time',
        value: `${occultation.instant_uncertainty ? occultation.instant_uncertainty.toFixed(1) : null}`,
      },
      {
        title: 'Creation Date',
        tooltip: 'Date of the prediction\'s computation',
        value: `${occultation.created_at ? moment(occultation.created_at).utc() : null}`
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
        value: `${starObj.ra ? starObj.ra.toFixed(8) : null} ${starObj.dec ? starObj.dec.toFixed(7) : null}`,
      },
      {
        title: 'Star astrometric position with proper motion (ICRF)',
        value: `${occultation.ra_star_with_pm} ${occultation.dec_star_with_pm}`,
      },
      {
        title: 'Star apparent position (date)',
        value: `${occultation.ra_star_to_date} ${occultation.dec_star_to_date}`
      },
      {
        title: 'Proper motion',
        value: `RA: ${starObj.pmra ? starObj.pmra.toFixed(1) : null} ±${starObj.pmra_error ? starObj.pmra_error.toFixed(1) : null}, Dec: ${starObj.pmdec ? starObj.pmdec.toFixed(1) : null} ±${starObj.pmdec_error ? starObj.pmdec_error.toFixed(1) : null} (mas/yr)`,
      },
      {
        title: 'Source of proper motion',
        value: 'Gaia DR2',
      },
      {
        title: 'Uncertainty in the star position',
        value: `${starObj.ra_error ? starObj.ra_error.toFixed(1) : null} ${starObj.dec_error ? starObj.dec_error.toFixed(1) : null} (mas)`,
      },
      {
        title: 'G magnitude',
        value: `${starObj.phot_g_mean_mag ? starObj.phot_g_mean_mag.toFixed(3) : null}`,
      },
      {
        title: 'RP magnitude (source: GaiaDR2)',
        value: `${starObj.phot_g_mean_mag ? starObj.phot_g_mean_mag.toFixed(3) : null}`,
      },
      {
        title: 'BP magnitude (source: GaiaDR2)',
        value: `${starObj.phot_bp_mean_mag ? starObj.phot_bp_mean_mag.toFixed(3) : null}`,
      },
      {
        title: 'J magnitude (source: 2MASS)',
        value: `${occultation.j ? occultation.j.toFixed(3) : null}`,
      },
      {
        title: 'H magnitude (source: 2MASS)',
        value: `${occultation.h ? occultation.h.toFixed(3) : null}`,
      },
      {
        title: 'K magnitude (source: 2MASS)',
        value: `${occultation.k ? occultation.k.toFixed(3) : null}`,
      },
    ]);

    setObject([
      {
        title: 'Object',
        value: `${occultation.name} ${occultation.number ? '(' + occultation.number + ')' : ''}`,
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
        value: `RA: ${occultation.e_ra_target}, Dec: ${occultation.e_dec_target} (mas)`,
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
          {occultation.id !== undefined && (
            <PredictOccultationMap
              occultationId={occultation.id}
            />
          )}
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
