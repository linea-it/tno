import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useParams, useHistory } from 'react-router-dom';
import {
  Grid,
  Card,
  CardHeader,
  CardContent,
  Toolbar,
  Icon,
  Switch,
  Button,
  FormControlLabel,
  Typography,
} from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import Table from '../../components/Table';
import {
  getSkybotTicketById,
  getPositionsByTicket,
  getAsteroidsInsideCcdByTicket,
  getCcdsByExposure,
  getExposureById,
} from '../../services/api/Skybot';
import CCD from '../../components/Chart/CCD';
import List from '../../components/List';

function SkybotAsteroid({ setTitle }) {
  const { id } = useParams();

  const coneSearchRadius = 1.2; // ! Cone search radius in Degres.

  const history = useHistory();
  const [ticket, setTicket] = useState(0);
  const [idExposure, setIdExposure] = useState(0);
  const [insideCcdOnly, setInsideCcdOnly] = useState(true);
  const [ccds, setCcds] = useState([]);
  const [ccdsPlotData, setCcdsPlotData] = useState({});
  const [positions, setPositions] = useState([]);
  const [exposure, setExposure] = useState({ radeg: null, decdeg: null });
  const [asteroidsInsideCcd, setAsteroidsInsideCcd] = useState([]);
  const [summary, setSummary] = useState([]);

  useEffect(() => {
    setTitle('Skybot');
  }, [setTitle]);

  useEffect(() => {
    getSkybotTicketById(id).then((res) => {
      setIdExposure(res.exposure);
      setTicket(res.ticket);
    });
  }, [id]);

  const tableColumns = [
    {
      title: 'Name',
      name: 'name',
      headerTooltip: 'Object Name',
    },
    {
      title: 'Number',
      name: 'number',
      align: 'right',
      headerTooltip: 'Object Number',
    },
    {
      title: 'Dyn Class',
      name: 'dynclass',
      headerTooltip: 'Dynamic Class',
    },
    {
      title: 'RA  (deg)',
      name: 'raj2000',
      align: 'right',
      headerTooltip: 'Right Ascension',
    },
    {
      title: 'Dec (deg)',
      name: 'decj2000',
      align: 'right',
      headerTooltip: 'Declination',
    },
    {
      title: 'Visual Mag',
      name: 'mv',
      align: 'right',
    },
    {
      title: 'Error',
      name: 'errpos',
      align: 'right',
      sortingEnabled: false,
    },
    {
      title: 'Ang Dist (arcsec)',
      name: 'd',
      align: 'right',
      headerTooltip: 'Angular Distance',
      sortingEnabled: false,
    },
    {
      title: 'dRAcosDec (arcsec/h)',
      name: 'dracosdec',
      align: 'right',
      sortingEnabled: false,
    },
    {
      title: 'dDEC  (arcsec/h)',
      name: 'ddec',
      align: 'right',
      sortingEnabled: false,
    },
    {
      title: 'Geoc Dist (AU)',
      name: 'dgeo',
      align: 'right',
      headerTooltip: 'Geocentric Distance',
      sortingEnabled: false,
    },
    {
      title: 'Hel Dist (AU)',
      name: 'dhelio',
      align: 'right',
      headerTooltip: 'Heliocentric Distance',
      sortingEnabled: false,
    },
    {
      title: 'Phase Angle (deg)',
      name: 'phase',
      align: 'right',
      sortingEnabled: false,
    },
    {
      title: 'Solar Elong',
      name: 'solelong',
      align: 'right',
      headerTooltip: 'Solar Elongantion',
      sortingEnabled: false,
    },
    {
      title: 'Vec Pos x (AU)',
      name: 'px',
      align: 'right',
      headerTooltip: 'Vector Position in x',
      sortingEnabled: false,
    },
    {
      title: 'Vec pos y (AU)',
      name: 'py',
      align: 'right',
      headerTooltip: 'Vector Position in y',
      sortingEnabled: false,
    },
    {
      title: 'Vec Pos z (AU)',
      name: 'pz',
      align: 'right',
      headerTooltip: 'Vector Position in z',
      sortingEnabled: false,
    },
    {
      title: 'Vec Pos x [AU/d]',
      name: 'vx',
      align: 'right',
      headerTooltip: 'Vector Position in x',
      sortingEnabled: false,
    },
    {
      title: 'Vec Pos y [AU/d]',
      name: 'vy',
      align: 'right',
      headerTooltip: 'Vector Position in y',
      sortingEnabled: false,
    },
    {
      title: 'Vec Pos z [AU/d]',
      name: 'vz',
      align: 'right',
      headerTooltip: 'Vector Position in z',
      sortingEnabled: false,
    },
    {
      title: 'Epo Pos Vec (Julien Day)',
      name: 'jdref',
      align: 'right',
      headerTooltip: 'Epoch of the position vector (Julian Day)',
      sortingEnabled: false,
    },
  ];

  const circleCoordinatesPlaneFormat = (x) => {
    if (typeof x === 'number') return x > 180 ? x - 360 : x;
    return x.map((n) => (n > 180 ? n - 360 : n));
  };

  useEffect(() => {
    if (ticket !== 0) {
      getPositionsByTicket(ticket).then((res) => {
        setPositions(res.results);
      });
      getAsteroidsInsideCcdByTicket(ticket).then((res) => {
        setAsteroidsInsideCcd(res.results);
      });
    }
  }, [ticket]);

  useEffect(() => {
    if (idExposure !== 0) {
      getCcdsByExposure(idExposure).then((res) => {
        setCcds(res.results);
      });
    }
  }, [idExposure]);

  useEffect(() => {
    if (idExposure !== 0) {
      getExposureById(idExposure).then((res) => {
        setExposure(res);
      });
    }
  }, [idExposure]);

  useEffect(() => {
    if (
      positions.length > 0 &&
      ccds.length > 0 &&
      exposure.radeg !== null &&
      exposure.decdeg !== null &&
      asteroidsInsideCcd.length > 0
    ) {
      const center = {
        x: exposure.radeg,
        y: exposure.decdeg,
      };

      const ccdRows = ccds.map((ccd) => ({
        x: [
          circleCoordinatesPlaneFormat(Number(ccd.rac1)),
          circleCoordinatesPlaneFormat(Number(ccd.rac2)),
          circleCoordinatesPlaneFormat(Number(ccd.rac3)),
          circleCoordinatesPlaneFormat(Number(ccd.rac4)),
          circleCoordinatesPlaneFormat(Number(ccd.rac1)),
        ],
        y: [ccd.decc1, ccd.decc2, ccd.decc3, ccd.decc4, ccd.decc1],
      }));

      const asteroidsIdInsideCcd = asteroidsInsideCcd.map(
        (res) => res.position
      );

      const asteroidsInside = positions.filter((position) =>
        asteroidsIdInsideCcd.includes(position.id)
      );

      const asteroidsOutside = positions.filter(
        (position) => !asteroidsIdInsideCcd.includes(position.id)
      );

      const asteroidInsideCcdRows = {
        x: asteroidsInside.map((res) =>
          circleCoordinatesPlaneFormat(Number(res.raj2000))
        ),
        y: asteroidsInside.map((res) => res.decj2000),
      };

      const asteroidOutsideCcdRows = {
        x: asteroidsOutside.map((res) =>
          circleCoordinatesPlaneFormat(Number(res.raj2000))
        ),
        y: asteroidsOutside.map((res) => res.decj2000),
      };

      const asteroidLimitRows = {
        x: [
          circleCoordinatesPlaneFormat(center.x - coneSearchRadius),
          circleCoordinatesPlaneFormat(center.x + coneSearchRadius),
        ],
        y: [center.y - coneSearchRadius, center.y + coneSearchRadius],
      };

      setCcdsPlotData({
        ccds: ccdRows,
        asteroidsInside: asteroidInsideCcdRows,
        asteroidsOutside: asteroidOutsideCcdRows,
        asteroidsLimit: asteroidLimitRows,
      });
    }
  }, [positions, asteroidsInsideCcd, ccds, exposure]);

  useEffect(() => {
    if (
      'ccds' in ccdsPlotData &&
      'asteroidsInside' in ccdsPlotData &&
      'asteroidsOutside' in ccdsPlotData
    ) {
      setSummary([
        {
          title: 'Exposure',
          value: idExposure,
        },
        {
          title: 'CCDs',
          value: ccdsPlotData.ccds.length,
        },
        {
          title: 'Asteroids Inside',
          value: ccdsPlotData.asteroidsInside.x.length,
        },
        {
          title: 'Asteroids Outside',
          value: ccdsPlotData.asteroidsOutside.x.length,
        },
        {
          title: 'Cone Search Radius',
          value: coneSearchRadius,
        },
      ]);
    }
  }, [ccdsPlotData]);

  const handleBackNavigation = () => history.goBack();

  const handleAsteroidInCcds = () => setInsideCcdOnly(!insideCcdOnly);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Grid container alignItems="center" spacing={2}>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              title="Back"
              onClick={handleBackNavigation}
            >
              <Icon className="fas fa-undo" fontSize="inherit" />
              <Typography variant="button" style={{ margin: '0 5px' }}>
                Back
              </Typography>
            </Button>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12} sm={4}>
        <Card>
          <CardHeader title="Summary" />
          <CardContent>
            <List data={summary} />
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={8}>
        <Card>
          <CardHeader title="Asteroids Inside CCD" />
          <CardContent>
            {'ccds' in ccdsPlotData ? (
              <CCD data={ccdsPlotData} height={550} />
            ) : (
              <Skeleton variant="rect" height={550} />
            )}
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Card>
          <CardHeader title="Asteroids" />
          <CardContent>
            <Toolbar>
              <FormControlLabel
                control={
                  <Switch
                    checked={insideCcdOnly}
                    onChange={handleAsteroidInCcds}
                    value={insideCcdOnly}
                    color="primary"
                  />
                }
                label="Only Asteroids Inside CCDs"
              />
            </Toolbar>
            {ticket !== 0 ? (
              <Table
                columns={tableColumns}
                data={insideCcdOnly ? asteroidsInsideCcd : positions}
                totalCount={
                  insideCcdOnly ? asteroidsInsideCcd.length : positions.length
                }
                hasSearching={false}
                remote={false}
              />
            ) : (
              <Skeleton variant="rect" height={540} />
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

SkybotAsteroid.propTypes = {
  setTitle: PropTypes.func.isRequired,
};

export default SkybotAsteroid;
