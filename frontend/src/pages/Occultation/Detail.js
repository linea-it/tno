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
  getOccultationMap
} from '../../services/api/Occultation';
import useStyles from './styles'

function OccultationDetail() {
  const { id } = useParams();
  const [occultation, setOccultation] = useState({});
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
  }, [id]);

  const s2ab = (s) => {
    var buf = new ArrayBuffer(s.length);
    var view = new Uint8Array(buf);
    for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
  }

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

    setCircumstances([
      {
        title: 'Date',
        value: moment(occultation.date_time).format(
          'ddd. DD MMMM YYYY HH:mm:ss'
        ),
      },
      {
        title: 'Star position (ICRF)',
        tooltip:
          'Right ascension and declination with assumed proper motion in ICRF/J2000',
        value: `${occultation.ra_star_candidate} ${occultation.dec_star_candidate}`,
      },
      {
        title: 'C/A',
        tooltip: 'Geocentric closest approach (arcsec)',
        value: `${occultation.closest_approach} arcsec`,
      },
      {
        title: 'P/A',
        tooltip: 'Planet position angle wrt to star at C/A (deg)',
        value: occultation.position_angle,
      },
      {
        title: 'Velocity',
        tooltip:
          'Velocity in plane of sky (positive= prograde, negative= retrograde)',
        value: `${occultation.velocity} km/s`,
      },
      {
        title: 'Geocentric distance Δ',
        value: `${occultation.delta} au`,
      },
      {
        title: 'G mag*',
        tooltip: 'Gaia magnitude corrected from velocity (Source: Gaia DR1)',
        value: occultation.g,
      },
      {
        title: 'RP mag*',
        tooltip: 'RP magnitude corrected from velocity (Source: GaiaDR2)',
        value: '-',
      },
      {
        title: 'H mag*',
        tooltip: 'H magnitude corrected from velocity (Source: 2MASS)',
        value: '-',
      },
      {
        title: 'Magnitude drop',
        value: '-',
      },
      {
        title: 'Uncertainty in time',
        value: '-',
      },
    ]);

    setStar([
      {
        title: 'Star source ID',
        value: '-',
      },
      {
        title: 'Stellar catalogue',
        value: '-',
      },
      {
        title: 'Star astrometric position in catalogue (ICRF)',
        value: '-',
      },
      {
        title: 'Star astrometric position with proper motion (ICRF)',
        value: '-',
      },
      {
        title: 'Star apparent position (date)',
        value: '-',
      },
      {
        title: 'Proper motion',
        value: '-',
      },
      {
        title: 'Source of proper motion',
        value: '-',
      },
      {
        title: 'Uncertainty in the star position',
        value: '-',
      },
      {
        title: 'G magnitude',
        value: '-',
      },
      {
        title: 'RP magnitude (source: GaiaDR2)',
        value: '-',
      },
      {
        title: 'J magnitude (source: 2MASS)',
        value: '-',
      },
      {
        title: 'H magnitude (source: 2MASS)',
        value: '-',
      },
      {
        title: 'K magnitude (source: 2MASS)',
        value: '-',
      },
    ]);

    setObject([
      {
        title: 'Object',
        value: occultation.name,
      },
      {
        title: 'Diameter',
        value: '-',
      },
      {
        title: 'Apparent diameter',
        value: '-',
      },
      {
        title: 'Object astrometric position (ICRF)',
        value: '-',
      },
      {
        title: 'Object apparent position (date)',
        value: '-',
      },
      {
        title: 'Uncertainty in position',
        value: '-',
      },
      {
        title: 'Apparent magnitude',
        value: '-',
      },
      {
        title: 'Ephemeris',
        value: '-',
      },
      {
        title: 'Dynamic class',
        value: '-',
      },
      {
        title: 'Semi major axis',
        value: '-',
      },
      {
        title: 'Eccentricity',
        value: '-',
      },
      {
        title: 'Inclination',
        value: '-',
      },
      {
        title: 'Perihelion',
        value: '-',
      },
      {
        title: 'Aphelion',
        value: '-',
      },
    ]);
  }, [occultation]);

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Occultation Map" />
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
            <CardHeader title="Occultation Circumstances" />
            <CardContent>
              <List data={circumstances} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Occulted star" />
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
