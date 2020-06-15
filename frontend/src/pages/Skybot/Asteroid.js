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
} from '../../services/api/Skybot';

function SkybotAsteroid({ setTitle }) {
  const { id, idRun } = useParams();

  const coneSearchRadius = 1.2; // ! Cone search radius in Degres.

  const history = useHistory();

  const [ticket, setTicket] = useState(0);

  const [tableData, setTableData] = useState({
    data: [],
    count: 0,
  });
  const [insideCcdOnly, setInsideCcdOnly] = useState(true);

  useEffect(() => {
    setTitle('Skybot');
  }, [setTitle]);

  useEffect(() => {
    getSkybotTicketById(id).then((res) => setTicket(res));
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

  const loadData = ({ sorting, currentPage, pageSize }) => {
    const page = currentPage + 1;
    const ordering = `${sorting[0].direction === 'desc' ? '-' : ''}${
      sorting[0].columnName
    }`;
    if (insideCcdOnly) {
      getAsteroidsInsideCcdByTicket({
        ticket,
        page,
        pageSize,
        ordering: sorting,
      }).then((res) => {
        setTableData({
          data: res.results,
          count: res.count,
        });
      });
    } else {
      getPositionsByTicket({
        ticket,
        page,
        pageSize,
        ordering,
      }).then((res) => {
        setTableData({
          data: res.results,
          count: res.count,
        });
      });
    }
  };

  const circleCoordinatesPlaneFormat = (x) => {
    if (typeof x === 'number') return x > 180 ? x - 360 : x;
    return x.map((n) => (n > 180 ? n - 360 : n));
  };

  const round = (value, decimals) =>
    Number(`${Math.round(`${value}e${decimals}`)}e-${decimals}`);

  useEffect(() => {
    if (tableData.data.length > 0) {
      console.log(idRun, id);

      const asteroids = {
        x: tableData.data.map((res) => circleCoordinatesPlaneFormat(res.ra)),
        y: tableData.data.map((res) => res.dec),
      };

      // getExposurePlot(runId, id).then((res) => {
      //   const center = { x: res.ra, y: res.dec };
      //   setCcdsPlotData({
      //     ccds: res.ccds.map((row) => ({
      //       x: [
      //         circleCoordinatesPlaneFormat(row.rac1),
      //         circleCoordinatesPlaneFormat(row.rac2),
      //         circleCoordinatesPlaneFormat(row.rac3),
      //         circleCoordinatesPlaneFormat(row.rac4),
      //         circleCoordinatesPlaneFormat(row.rac1),
      //       ],
      //       y: [row.decc1, row.decc2, row.decc3, row.decc4, row.decc1],
      //     })),
      //     asteroids: {
      //       x: circleCoordinatesPlaneFormat(res.skybot_output.ra),
      //       y: res.skybot_output.dec,
      //     },
      //     asteroidsLimit: {
      //       x: [
      //         circleCoordinatesPlaneFormat(center.x - coneSearchRadius),
      //         circleCoordinatesPlaneFormat(center.x + coneSearchRadius),
      //       ],
      //       y: [center.y - coneSearchRadius, center.y + coneSearchRadius],
      //     },
      //   });
      // });
    }
  }, [idRun, id, tableData]);

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
                data={tableData.data}
                totalCount={tableData.count}
                loadData={loadData}
                hasSearching={false}
                reload={insideCcdOnly}
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
