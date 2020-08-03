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
  Button,
  Typography,
} from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import Table from '../../components/Table';
import {
  getSkybotJobResultById,
  getPositionsByTicket,
  getAsteroidsInsideCcdByTicket,
  getCcdsByExposure,
  getExposureById,
  getDynclassAsteroidsById,
  getCcdsWithAsteroidsById,
} from '../../services/api/Skybot';
import CCD from '../../components/Chart/CCD';
import List from '../../components/List';
import Switch from '../../components/Switch';

function SkybotAsteroid({ setTitle }) {
  const { id } = useParams();

  const coneSearchRadius = 1.2; // ! Cone search radius in Degres.

  const history = useHistory();
  const [skybotResult, setSkybotResult] = useState({
    ticket: 0,
    exposure: 0,
    inside_ccd: 0,
    outside_ccd: 0,
  });
  const [insideCcdOnly, setInsideCcdOnly] = useState(true);
  const [ccds, setCcds] = useState([]);
  const [ccdsPlotData, setCcdsPlotData] = useState({});
  const [positions, setPositions] = useState([]);
  const [exposure, setExposure] = useState({ radeg: null, decdeg: null });
  const [asteroidsInsideCcd, setAsteroidsInsideCcd] = useState([]);
  const [dynclassAsteroids, setDynclassAsteroids] = useState([]);
  const [ccdsWithAsteroids, setCcdsWithAsteroids] = useState(null);
  const [summary, setSummary] = useState([]);
  const [summaryClass, setSummaryClass] = useState([]);

  useEffect(() => {
    setTitle('Skybot');
  }, [setTitle]);

  useEffect(() => {
    getSkybotJobResultById(id).then((res) => {
      setSkybotResult(res);
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
    if (skybotResult.ticket !== 0) {
      getPositionsByTicket(skybotResult.ticket).then((res) => {
        setPositions(res.results);
      });
      getAsteroidsInsideCcdByTicket(skybotResult.ticket).then((res) => {
        setAsteroidsInsideCcd(res.results);
      });
    }
  }, [skybotResult.ticket]);

  useEffect(() => {
    if (skybotResult.exposure !== 0) {
      getCcdsByExposure(skybotResult.exposure).then((res) => {
        setCcds(res.results);
      });
    }
  }, [skybotResult.exposure]);

  useEffect(() => {
    if (skybotResult.exposure !== 0) {
      getExposureById(skybotResult.exposure).then((res) => {
        setExposure(res);
      });
    }
  }, [skybotResult.exposure]);

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
  }, [positions, ccds, exposure, asteroidsInsideCcd]);

  useEffect(() => {
    getDynclassAsteroidsById(id).then((res) => {
      setDynclassAsteroids(res);
    });
  }, []);

  useEffect(() => {
    getCcdsWithAsteroidsById(id).then((res) => {
      setCcdsWithAsteroids(res.ccds_with_asteroid);
    });
  }, []);

  useEffect(() => {
    if (
      'ccds' in ccdsPlotData &&
      'asteroidsInside' in ccdsPlotData &&
      'asteroidsOutside' in ccdsPlotData
    ) {
      setSummary([
        {
          title: 'Exposure #',
          value: skybotResult.exposure,
        },
        {
          title: '# CCDs With SSOs',
          value: ccdsWithAsteroids || '-',
        },
        {
          title: '# CCDs Without SSOs',
          value: ccdsWithAsteroids
            ? ccdsPlotData.ccds.length - ccdsWithAsteroids
            : '-',
        },
        {
          title: '# SSOs Inside',
          value: ccdsPlotData.asteroidsInside.x.length,
        },
        {
          title: '# SSOs Outside',
          value: ccdsPlotData.asteroidsOutside.x.length,
        },
        {
          title: 'Cone Search Radius',
          value: coneSearchRadius,
        },
      ]);
    }
  }, [ccdsPlotData, skybotResult, ccdsWithAsteroids]);

  useEffect(() => {
    if (dynclassAsteroids.length > 0) {
      const dynclasses = dynclassAsteroids.map((row) => ({
        title: row.dynclass,
        value: row.asteroids,
      }));
      setSummaryClass(dynclasses);
    }
  }, [dynclassAsteroids]);

  const handleBackNavigation = () => history.goBack();

  // const handleAsteroidInCcds = () => setInsideCcdOnly(!insideCcdOnly);

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
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Card>
              <CardHeader title="Summary" />
              <CardContent>
                <List data={summary} />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card>
              <CardHeader title="Summary Class" />
              <CardContent>
                <List data={summaryClass} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12} sm={8}>
        <Card>
          <CardHeader title="SSOs Inside CCD" />
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
          <CardHeader title="SSOs" />
          <CardContent>
            <Toolbar>
              <Switch
                isGrid={insideCcdOnly}
                setIsGrid={setInsideCcdOnly}
                titleOn="Inside CCD"
                titleOff="All"
              />
            </Toolbar>
            {skybotResult.ticket !== 0 ? (
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
