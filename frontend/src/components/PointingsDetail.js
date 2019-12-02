import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Grid, Card, makeStyles, CardHeader, CardContent,
} from '@material-ui/core';
import Icon from '@material-ui/core/Icon';
import Button from '@material-ui/core/Button';
import clsx from 'clsx';
import { withRouter } from 'react-router';
import CustomList from './utils/CustomList';
import { getPointing } from '../api/Pointings';
import moment from 'moment';

const useStyles = makeStyles({
  cardContentWrapper: {
    overflow: 'auto',
  },
  iconDetail: {
    fontSize: 18,
  },
  buttonIcon: {
    margin: '0 2px',
  },
});

function PointingsDetail({ setTitle, match, history }) {
  const classes = useStyles();
  const { id } = match.params;

  const [pointingDetailsList, setPointingDetailsList] = useState([]);

  useEffect(() => {
    setTitle('Pointings');

    getPointing({ id }).then((res) => {
      setPointingDetailsList([
        {
          title: 'Image Id',
          tooltip: 'Unique identifier for each image (1 image is composed by 62 CCDs)',
          value: res.pfw_attempt_id,
        },
        {
          title: 'CCD Id',
          tooltip: 'Unique identifier for each CCD.',
          value: res.desfile_id,
        },
        {
          title: 'Night',
          tooltip: 'Night at which the observation was made.',
          value: moment(res.nite).format("YYYY-MM-DD"),
        },
        {
          title: 'Observation Date',
          tooltip: 'Date and time of observation',
          value: moment(res.date_obs).format("YYYY-MM-DD"),
        },
        {
          title: 'Exposure',
          tooltip: 'Unique identifier for each image, same function as pfw_attenp_id (it also recorded in the file name)',
          value: res.expnum,
        },
        {
          title: 'CCD Number',
          tooltip: 'CCD Number (1, 2, ..., 62)',
          value: res.ccdnum,
        },
        {
          title: 'Filter',
          tooltip: 'Filter used to do the observation (u, g, r, i, z, Y).',
          value: res.band,
        },

        {
          title: 'Exposure time',
          tooltip: 'Exposure time of observation.',
          value: res.exptime,
        },

        {
          title: 'Cloud apass',
          tooltip: 'Atmospheric extinction in magnitudes',
          value: res.cloud_apass,
        },

        {
          title: 'Cloud nomad',
          tooltip: 'Atmospheric extinction in magnitudes',
          value: res.cloud_nomad,
        },

        {
          title: 't_eff',
          tooltip: 'Parameter related to image quality',
          value: res.t_eff,
        },

        {
          title: 'Cross RA 0',
          value: (res.crossra0 ? (
            <span title={res.crossra0}>
              <Icon className={clsx(`fas fa-check ${classes.iconDetail}`)} style={{ color: '#009900' }} />
            </span>
          ) : (
              <span title="False">
                <Icon className={clsx(`fas fa-times ${classes.iconDetail}`)} style={{ color: '#ff1a1a' }} />
              </span>
            )),
        },
        {
          title: 'RA (deg)',
          tooltip: 'Right Ascension of DECam image (CCDs mosaic center)',
          value: res.radeg,
        },
        {
          title: 'Dec (deg)',
          tooltip: 'Declination of DECam image (CCDs mosaic center)',
          value: res.decdeg,
        },
        {
          title: 'racmin (deg)',
          tooltip: 'Minimal right ascension respectively of the CCD cover.',
          value: res.racmin,
        },
        {
          title: 'racmax (deg)',
          tooltip: 'Maximum right ascension respectively of the CCD cover.',
          value: res.racmax,
        },
        {
          title: 'deccmin (deg)',
          tooltip: 'Minimum declination respectively of the CCD cover.',
          value: res.deccmin,
        },
        {
          title: 'deccmax (deg)',
          tooltip: 'Maximum declination respectively of the CCD cover.',
          value: res.deccmax,
        },
        {
          title: 'ra_cent (deg)',
          tooltip: 'Right ascension of the CCD center',
          value: res.ra_cent,
        },
        {
          title: 'dec_cent (deg)',
          tooltip: 'Declination of the CCD center',
          value: res.dec_cent,
        },
        {
          title: 'rac1 (deg)',
          tooltip: 'CCD Corner Coordinates 1 - upper left.',
          value: res.rac1,
        },
        {
          title: 'rac2 (deg)',
          tooltip: 'CCD Corner Coordinates 2 - lower left.',
          value: res.rac2,
        },
        {
          title: 'rac3 (deg)',
          tooltip: 'CCD Corner Coordinates 3 - lower right.',
          value: res.rac3,
        },
        {
          title: 'rac4 (deg)',
          tooltip: 'CCD Corner Coordinates 4 - upper right).',
          value: res.rac4,
        },
        {
          title: 'decc1 (deg)',
          tooltip: 'CCD Corner Coordinates 1 - upper left.',
          value: res.decc1,
        },
        {
          title: 'decc2 (deg)',
          tooltip: 'CCD Corner Coordinates 2 - lower left.',
          value: res.decc2,
        },
        {
          title: 'decc3 (deg)',
          tooltip: 'CCD Corner Coordinates 3 - lower right.)',
          value: res.decc3,
        },
        {
          title: 'decc4 (deg)',
          tooltip: 'CCD Corner Coordinates 4 - upper right).',
          value: res.decc4,
        },
        {
          title: 'ra_size (deg)',
          tooltip: 'CCD dimensions in degrees (width Ã— height).',
          value: res.ra_size,
        },
        {
          title: 'dec_size (deg)',
          tooltip: 'CCD dimensions in degrees (width Ã— height).',
          value: res.dec_size,
        },
        {
          title: 'Path',
          tooltip: 'Path in the DES database where the image is stored.',
          value: res.path,
        },
        {
          title: 'Filename',
          tooltip: 'Name of FITS file with a CCD image.',
          value: res.filename,
        },
        {
          title: 'Compression',
          tooltip: 'Compression format (.fz) used in FITS files',
          value: res.compression,
        },
        {
          title: 'Downloaded',
          tooltip: 'flag indicating whether the image was downloaded from DES.',
          value: (res.downloaded ? (
            <span title={res.downloaded}>
              <Icon className={clsx(`fas fa-check ${classes.iconDetail}`)} style={{ color: '#009900' }} />
            </span>
          ) : (
              <span title="Has not been downloaded">
                <Icon className={clsx(`fas fa-times ${classes.iconDetail}`)} style={{ color: '#ff1a1a' }} />
              </span>
            )),
        },
      ]);
    });
  }, []);

  const handleBackNavigation = () => history.push('/pointings');

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12} className={classes.block}>
          <Grid
            container
            justify="space-between"
            alignItems="center"
            spacing={2}
          >
            <Grid item xs={12} md={4}>
              <Button
                variant="contained"
                color="primary"
                title="Back"
                className={classes.button}
                onClick={handleBackNavigation}
              >
                <Icon className={clsx('fas', 'fa-undo', classes.buttonIcon)} />
                <span>Back</span>
              </Button>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} className={classes.block}>
          <Grid container spacing={2}>
            <Grid item xs={12} className={classes.block}>
              <Card>
                <CardHeader
                  title="Details Pointing"
                // subheader="These are the details of the object named Lorem Ipsum and number 000"
                />
                <CardContent className={classes.cardContentWrapper}>
                  <CustomList
                    data={pointingDetailsList}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}

PointingsDetail.propTypes = {
  setTitle: PropTypes.func.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};

export default withRouter(PointingsDetail);
