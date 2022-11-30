import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useParams, useNavigate } from 'react-router-dom';
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
  // getCcdsWithAsteroidsById,
} from '../../services/api/Skybot';
import CCD from '../../components/Chart/CCD';
import List from '../../components/List';
import Switch from '../../components/Switch';

function SkybotAsteroid({ }) {
  const { id } = useParams();

  const coneSearchRadius = 1.2; // ! Cone search radius in Degres.

  const navigate = useNavigate();
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
  const [summary, setSummary] = useState([]);
  const [tableColumns, setTableColumns] = useState([]);

  // useEffect(() => {
  //   setTitle('Discovery');
  // }, [setTitle]);

  useEffect(() => {
    getSkybotJobResultById(id).then((res) => {
      setSkybotResult(res);
    });
  }, [id]);

  const columns = React.useMemo(() => [
    {
      title: ' ',
      name: 'index',
      width: 70,
    },
    {
      title: 'CCD Num',
      name: 'ccdnum',
      headerTooltip: 'CCD Number',
    },
    {
      title: 'Name',
      name: 'name',
      headerTooltip: 'Object Name',
    },
    {
      title: 'Object Number',
      name: 'number',
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
      headerTooltip: 'Right Ascension',
    },
    {
      title: 'Dec (deg)',
      name: 'decj2000',
      headerTooltip: 'Declination',
    },
    {
      title: 'Visual Mag',
      name: 'mv',
    },
    {
      title: 'Error (arcsec)',
      name: 'errpos',
    },
    {
      title: 'Ang Dist (arcsec)',
      name: 'd',
      headerTooltip: 'Angular Distance',
    },
    {
      title: 'dRAcosDec (arcsec/h)',
      name: 'dracosdec',
    },
    {
      title: 'dDEC  (arcsec/h)',
      name: 'ddec',
    },
    {
      title: 'Geoc Dist (AU)',
      name: 'dgeo',
      headerTooltip: 'Geocentric Distance',
    },
    {
      title: 'Hel Dist (AU)',
      name: 'dhelio',
      headerTooltip: 'Heliocentric Distance',
    },
    {
      title: 'Phase Angle (deg)',
      name: 'phase',
    },
    {
      title: 'Solar Elong',
      name: 'solelong',
      headerTooltip: 'Solar Elongantion',
    },
    {
      title: 'Vec Pos x (AU)',
      name: 'px',
      headerTooltip: 'Vector Position in x',
    },
    {
      title: 'Vec pos y (AU)',
      name: 'py',
      headerTooltip: 'Vector Position in y',
    },
    {
      title: 'Vec Pos z (AU)',
      name: 'pz',
      headerTooltip: 'Vector Position in z',
    },
    {
      title: 'Vec Pos x [AU/d]',
      name: 'vx',
      headerTooltip: 'Vector Position in x',
    },
    {
      title: 'Vec Pos y [AU/d]',
      name: 'vy',
      headerTooltip: 'Vector Position in y',
    },
    {
      title: 'Vec Pos z [AU/d]',
      name: 'vz',
      headerTooltip: 'Vector Position in z',
    },
    {
      title: 'Epo Pos Vec (Julien Day)',
      name: 'jdref',
      headerTooltip: 'Epoch of the position vector (Julian Day)',
    },
  ], []);

  useEffect(() => {
    if (insideCcdOnly) {
      setTableColumns(columns);
    } else {
      setTableColumns(columns.filter((row) => row.name !== 'ccdnum'));
    }
  }, [insideCcdOnly, columns]);

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
        ccdnum: asteroidsInsideCcd.map((res) => res.ccdnum),
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
  }, [id]);

  // useEffect(() => {
  //   getCcdsWithAsteroidsById(id).then((res) => {
  //     setCcdsWithAsteroids(res.ccds_with_asteroid);
  //   });
  // }, [id]);

  useEffect(() => {
    if (skybotResult.exposure !== 0) {
      setSummary([
        {
          title: 'Exposure',
          value: skybotResult.exposure,
        },
        {
          title: 'Cone Search Radius',
          value: `${coneSearchRadius} (degree)`,
        },
        {
          title: '# CCDs',
          value: skybotResult.ccds,
        },
        {
          title: '# SSOs',
          value: skybotResult.positions,
        },
        {
          title: '# SSOs Inside',
          value: skybotResult.inside_ccd,
        },
        {
          title: '# SSOs Outside',
          value: skybotResult.outside_ccd,
        },
        {
          title: '# CCDs With SSOs',
          value: skybotResult.ccds_with_asteroids || '-',
        },
        {
          title: '# CCDs Without SSOs',
          value: skybotResult.ccds
            ? skybotResult.ccds - skybotResult.ccds_with_asteroids
            : '-',
        },
      ]);
    }
  }, [skybotResult]);

  const summaryClassColumns = [
    {
      title: 'Dynamic Class',
      name: 'dynclass',
      width: 215,
      sortingEnabled: false,
    },
    {
      title: '# SSOs',
      name: 'asteroids',
      width: 150,
      sortingEnabled: false,
    },
    {
      title: '# CCDs',
      name: 'ccds',
      width: 150,
      sortingEnabled: false,
    },
  ];

  const handleBackNavigation = () => navigate(-1);

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
      <Grid item xs={12} md={4}>
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
                <Table
                  columns={summaryClassColumns}
                  data={dynclassAsteroids}
                  totalCount={dynclassAsteroids.length}
                  hasSearching={false}
                  hasPagination={false}
                  defaultSorting={[{ columnName: 'dynclass', ordering: 'asc' }]}
                  hasColumnVisibility={false}
                  hasToolbar={false}
                  remote={false}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12} md={8}>
        <Card>
          <CardHeader title="SSOs Inside CCD" />
          <CardContent>
            {'ccds' in ccdsPlotData ? (
              <CCD data={ccdsPlotData} height={550} />
            ) : (
              <Skeleton variant="rect" hght={550} />
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
                defaultSorting={[{ columnName: 'ccdnum', direction: 'asc' }]}
                hasSearching={false}
                remote={false}
              />
            ) : (
              <Skeleton variant="rect" hght={540} />
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

// SkybotAsteroid.propTypes = {
//   //setTitle: PropTypes.func.isRequired,
//   setTitle: PropTypes.any,
// };

export default SkybotAsteroid;
