import React, { useEffect } from 'react';
import {
  Grid, Card, makeStyles, CardHeader, CardContent,
} from '@material-ui/core';
import histogramExposures from '../assets/img/dashboard/histogramExposures.png';
import histogramExposureTime from '../assets/img/dashboard/histogramExposureTime.png';
import exposuresbyclass from '../assets/img/dashboard/ExposuresByClass.png';
import histogramSemimajoraxis from '../assets/img/dashboard/histogramSemimajoraxis.png';
import histogramBands from '../assets/img/dashboard/histogramBands.png';
import animation from '../assets/img/dashboard/animation.gif';

const useStyles = makeStyles({
  btn: {
    textTransform: 'none',
    padding: '1px 5px',
    width: '7em',
    minHeight: '1em',
    display: 'block',
    textAlign: 'center',
    lineHeight: '2',
    boxShadow: `0px 1px 5px 0px rgba(0, 0, 0, 0.2),
    0px 2px 2px 0px rgba(0, 0, 0, 0.14),
    0px 3px 1px -2px rgba(0, 0, 0, 0.12)`,
    borderRadius: '4px',
    boxSizing: 'border-box',
  },
  btnSuccess: {
    backgroundColor: '#009900',
    color: '#fff',
  },
  imgResponsive: {
    maxWidth: '100%',
    height: 'auto',
  },
});

function Dashboard({ setTitle }) {
  const classes = useStyles();

  useEffect(() => {
    setTitle('Dashboard');
  }, []);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Plot exposure" />
              <CardContent>
                <img src={histogramExposures} className={classes.imgResponsive} alt="Plot exposure" title="Plot exposure" />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="CCD x Exposure time" />
              <CardContent>
                <img src={histogramExposureTime} className={classes.imgResponsive} alt="CCD x Exposure time" title="CCD x Exposure time" style={{ maxHeight: 383 }} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="CCDs x Band" />
              <CardContent>
                <img src={histogramBands} className={classes.imgResponsive} alt="CCDs x Band" title="CCDs x Band" style={{ maxHeight: 295 }} />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="DES Exposition" />
              <CardContent>
                <img src={animation} className={classes.imgResponsive} alt="DES Exposition" title="DES Exposition" />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Plot Exposure" />
              <CardContent>
                <img src={exposuresbyclass} className={classes.imgResponsive} alt="Plot Exposure" title="Plot Exposure" style={{ maxHeight: 325 }} />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Histogram Asteroid-Sun distance" />
              <CardContent>
                <img src={histogramSemimajoraxis} className={classes.imgResponsive} alt="Histogram Asteroid-Sun distance" title="Histogram Asteroid-Sun distance" />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}

export default Dashboard;
