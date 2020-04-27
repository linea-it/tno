import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import { Grid, Card, CardHeader, CardContent } from '@material-ui/core';

import List from '../../components/List';
import Aladin from '../../components/Aladin';

import { url } from '../../services/api/Auth';
import { getOccultationById } from '../../services/api/Occultation';

function OccultationDetail({ setTitle, match }) {
  const { id } = match.params;
  const [occultation, setOccultation] = useState({});
  const [circumstances, setCircumstances] = useState([]);
  const [star, setStar] = useState([]);
  const [object, setObject] = useState([]);

  useEffect(() => {
    setTitle('Occultations');

    getOccultationById({ id }).then((res) => {
      setOccultation({
        ...res,
        source: url + res.src,
      });
    });
  }, []);

  useEffect(() => {
    setCircumstances([
      {
        title: 'Date',
        value: moment(occultation.occ_date).format(
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
        value: '-',
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
            <CardContent>
              <img
                src={occultation.source}
                alt={occultation.asteroid_name}
                title={occultation.asteroid_name}
              />
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

OccultationDetail.propTypes = {
  setTitle: PropTypes.func.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default OccultationDetail;
