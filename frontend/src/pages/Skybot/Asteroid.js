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
} from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import Table from '../../components/Table';
import CCD from '../../components/Chart/CCD';
import {
  getExposurePlot,
  getOutputByExposure,
  getAsteroidsInsideCCD,
} from '../../services/api/Skybot';

function SkybotAsteroid({ setTitle }) {
  const coneSearchRadius = 1.2; // ! Cone search radius in Degres.
  const { id, runId } = useParams();
  const history = useHistory();
  const [ccdsPlotData, setCcdsPlotData] = useState({});
  const [exposuresTableData, setExposuresTableData] = useState([]);
  const [asteroidsOnlyInsideCcds, setAsteroidsOnlyInsideCcds] = useState(true);

  const handleValues = (value) => {
    const roundValue = parseFloat(value).toFixed(3);
    const stringValue = roundValue.toString();
    return stringValue;
  };

  const exposuresTableColumns = [
    {
      title: 'Point',
      name: 'pointing',
      headerTooltip: 'Pointings',
    },
    {
      title: 'Name',
      name: 'name',
      headerTooltip: 'Object Name',
    },
    {
      title: 'Num',
      name: 'num',
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
      customElement: (row) => (
        <span>{row.raj2000 ? handleValues(row.raj2000) : ''}</span>
      ),
      headerTooltip: 'Right Ascension',
    },
    {
      title: 'Dec (deg)',
      name: 'decj2000',
      align: 'right',
      customElement: (row) => (
        <span>{row.decj2000 ? handleValues(row.decj2000) : ''}</span>
      ),
      headerTooltip: 'Declination',
    },
    {
      title: 'Visual Mag ',
      name: 'mv',
      align: 'right',
    },
    {
      title: 'Error',
      name: 'errpos',
      align: 'right',
      customElement: (row) => (
        <span>{row.errpos ? handleValues(row.errpos) : ''}</span>
      ),
    },
    {
      title: 'Ang Dist (arcsec)',
      name: 'd',
      align: 'right',
      customElement: (row) => <span>{row.d ? handleValues(row.d) : ''}</span>,
      headerTooltip: 'Angular Distance',
    },
    {
      title: 'dRAcosDec (arcsec/h)',
      name: 'dracosdec',
      align: 'right',
      customElement: (row) => (
        <span>{row.dracosdec ? handleValues(row.dracosdec) : ''}</span>
      ),
    },
    {
      title: 'dDEC  (arcsec/h)',
      name: 'd',
      align: 'right',
      customElement: (row) => <span>{row.d ? handleValues(row.d) : ''}</span>,
    },
    {
      title: 'Geoc Dist (AU)',
      name: 'dgeo',
      align: 'right',
      customElement: (row) => (
        <span>{row.dgeo ? handleValues(row.dgeo) : ''}</span>
      ),
      headerTooltip: 'Geocentric Distance',
    },
    {
      title: 'Hel Dist (AU)',
      name: 'dhelio',
      align: 'right',
      customElement: (row) => (
        <span>{row.dhelio ? handleValues(row.dhelio) : ''}</span>
      ),
      headerTooltip: 'Heliocentric Distance',
    },
    {
      title: 'Phase Angle (deg)',
      name: 'phase',
      align: 'right',
      customElement: (row) => (
        <span>{row.phase ? handleValues(row.phase) : ''}</span>
      ),
    },
    {
      title: 'Solar Elong',
      name: 'solelong',
      align: 'right',
      customElement: (row) => (
        <span>{row.solelong ? handleValues(row.solelong) : ''}</span>
      ),
      headerTooltip: 'Solar Elongantion',
    },
    {
      title: 'Vec Pos x (AU)',
      name: 'px',
      align: 'right',
      customElement: (row) => <span>{row.px ? handleValues(row.px) : ''}</span>,
      headerTooltip: 'Vector Position in x',
    },
    {
      title: 'Vec pos y (AU)',
      name: 'py',
      align: 'right',
      customElement: (row) => <span>{row.py ? handleValues(row.py) : ''}</span>,
      headerTooltip: 'Vector Position in y',
    },
    {
      title: 'Vec Pos z (AU)',
      name: 'pz',
      align: 'right',
      customElement: (row) => <span>{row.pz ? handleValues(row.pz) : ''}</span>,
      headerTooltip: 'Vector Position in z',
    },
    {
      title: 'Vec Pos x [AU/d]',
      name: 'vx',
      align: 'right',
      customElement: (row) => <span>{row.vx ? handleValues(row.vx) : ''}</span>,
      headerTooltip: 'Vector Position in x',
    },
    {
      title: 'Vec Pos y [AU/d]',
      name: 'vy',
      align: 'right',
      customElement: (row) => <span>{row.vy ? handleValues(row.vy) : ''}</span>,
      headerTooltip: 'Vector Position in y',
    },
    {
      title: 'Vec Pos z [AU/d]',
      name: 'vz',
      align: 'right',
      customElement: (row) => <span>{row.vz ? handleValues(row.vz) : ''}</span>,
      headerTooltip: 'Vector Position in z',
    },
    {
      title: 'Epo Pos Vec (Julien Day)',
      name: 'jdref',
      align: 'right',
      headerTooltip: 'Epoch of the position vector (Julian Day)',
    },
    {
      title: 'Band',
      name: 'band',
      align: 'center',
    },
    {
      title: 'Exp Num',
      name: 'expnum',
      align: 'right',
      headerTooltip: 'Exposute Number',
    },
    {
      title: 'CCD Num',
      name: 'ccdnum',
      align: 'right',
    },
    {
      name: 'externallink',
      title: 'VizieR',
      customElement: (el) =>
        el.externallink !== 'link' ? (
          <a
            href={el.externallink}
            target="_blank"
            rel="noopener noreferrer"
            title={el.externallink}
          >
            <Icon className="fas fa-external-link-square-alt" />
          </a>
        ) : (
          '-'
        ),
      align: 'center',
    },
  ];

  const circleCoordinatesPlaneFormat = (x) => {
    if (typeof x === 'number') return x > 180 ? x - 360 : x;
    return x.map((n) => (n > 180 ? n - 360 : n));
  };

  const round = (value, decimals) =>
    Number(`${Math.round(`${value}e${decimals}`)}e-${decimals}`);

  useEffect(() => {
    setTitle('Skybot Run');
  }, [setTitle]);

  useEffect(() => {
    getExposurePlot(runId, id).then((res) => {
      const center = { x: res.ra, y: res.dec };

      setCcdsPlotData({
        ccds: res.ccds.map((row) => ({
          x: [
            circleCoordinatesPlaneFormat(row.rac1),
            circleCoordinatesPlaneFormat(row.rac2),
            circleCoordinatesPlaneFormat(row.rac3),
            circleCoordinatesPlaneFormat(row.rac4),
            circleCoordinatesPlaneFormat(row.rac1),
          ],
          y: [row.decc1, row.decc2, row.decc3, row.decc4, row.decc1],
        })),
        asteroids: {
          x: circleCoordinatesPlaneFormat(res.skybot_output.ra),
          y: res.skybot_output.dec,
        },
        asteroidsLimit: {
          x: [
            circleCoordinatesPlaneFormat(center.x - coneSearchRadius),
            circleCoordinatesPlaneFormat(center.x + coneSearchRadius),
          ],
          y: [center.y - coneSearchRadius, center.y + coneSearchRadius],
        },
      });
    });
  }, [runId, id]);

  useEffect(() => {
    setExposuresTableData([]);
    if (asteroidsOnlyInsideCcds === false) {
      getOutputByExposure(runId, id).then((res) => {
        // const columns = Object.keys(res.rows[0]).map((column) => {
        //   if (column === 'externallink') {
        //     return {
        //       name: column,
        //       customElement: (el) => {
        //         if (el.externallink === 'link') return '-';
        //         return (
        //           <a
        //             href={el.externallink}
        //             target="_blank"
        //             rel="noopener noreferrer"
        //             title={el.externallink}
        //           >
        //             <Icon className="fas fa-external-link-square-alt" />
        //           </a>
        //         );
        //       },
        //     };
        //   }

        //   return {
        //     name: column,
        //   };
        // });

        setExposuresTableData(
          res.rows.map((row) => ({
            ...row,
            raj2000: row.raj2000 ? round(row.raj2000, 3) : '-',
            decj2000: row.decj2000 ? round(row.decj2000, 3) : '-',
            d: row.d ? round(row.d, 3) : '-',
            dracosdec: row.dracosdec ? round(row.dracosdec, 3) : '-',
            ddec: row.ddec ? round(row.ddec, 3) : '-',
            dgeo: row.dgeo ? round(row.dgeo, 3) : '-',
            dhelio: row.dhelio ? round(row.dhelio, 3) : '-',
            px: row.px ? round(row.px, 3) : '-',
            py: row.py ? round(row.py, 3) : '-',
            pz: row.pz ? round(row.pz, 3) : '-',
            vx: row.vx ? round(row.vx, 3) : '-',
            vy: row.vy ? round(row.vy, 3) : '-',
            vz: row.vz ? round(row.vz, 3) : '-',
            jdref: row.jdref ? round(row.jdref, 3) : '-',
          }))
        );
      });
    } else {
      getAsteroidsInsideCCD(id).then((res) => {
        // Object.keys(res.rows[0]).map((column) => {
        //   if (column === 'externallink') {
        //     return {
        //       name: column,
        //       customElement: (el) => {
        //         if (el.externallink === 'link') return '-';
        //         return (
        //           <a
        //             href={el.externallink}
        //             target="_blank"
        //             rel="noopener noreferrer"
        //             title={el.externallink}
        //           >
        //             <Icon className="fas fa-external-link-square-alt" />
        //           </a>
        //         );
        //       },
        //     };
        //   }
        //   return {
        //     name: column,
        //   };
        // });
        setExposuresTableData(
          res.rows.map((row) => ({
            ...row,
            raj2000: row.raj2000 ? round(row.raj2000, 3) : '-',
            decj2000: row.decj2000 ? round(row.decj2000, 3) : '-',
            d: row.d ? round(row.d, 3) : '-',
            dracosdec: row.dracosdec ? round(row.dracosdec, 3) : '-',
            ddec: row.ddec ? round(row.ddec, 3) : '-',
            dgeo: row.dgeo ? round(row.dgeo, 3) : '-',
            dhelio: row.dhelio ? round(row.dhelio, 3) : '-',
            px: row.px ? round(row.px, 3) : '-',
            py: row.py ? round(row.py, 3) : '-',
            pz: row.pz ? round(row.pz, 3) : '-',
            vx: row.vx ? round(row.vx, 3) : '-',
            vy: row.vy ? round(row.vy, 3) : '-',
            vz: row.vz ? round(row.vz, 3) : '-',
            jdref: row.jdref ? round(row.jdref, 3) : '-',
          }))
        );
      });
    }
  }, [asteroidsOnlyInsideCcds, runId, id]);

  const handleAsteroidInCcds = () =>
    setAsteroidsOnlyInsideCcds(!asteroidsOnlyInsideCcds);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={12}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => history.push(`/skybot/${runId}`)}
            >
              <Icon className="fas fa-undo" />
              <span>Back</span>
            </Button>
          </Grid>
          <Grid item xs={12} md={12}>
            <Card>
              <CardHeader title="Asteroids Inside CCD" />
              <CardContent>
                {ccdsPlotData.ccds ? (
                  <CCD data={ccdsPlotData} height={550} />
                ) : null}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Card>
              <CardHeader title="Asteroids" />
              <CardContent>
                <Toolbar>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={asteroidsOnlyInsideCcds}
                        onChange={handleAsteroidInCcds}
                        value={asteroidsOnlyInsideCcds}
                        color="primary"
                      />
                    }
                    label="Only Asteroids Inside CCDs"
                  />
                </Toolbar>
                {exposuresTableData.length > 0 ? (
                  <Table
                    columns={exposuresTableColumns}
                    data={exposuresTableData}
                    totalCount={exposuresTableData.length}
                    hasSearching={false}
                    remote={false}
                  />
                ) : (
                  <Skeleton height={540} />
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}

SkybotAsteroid.propTypes = {
  setTitle: PropTypes.func.isRequired,
};

export default SkybotAsteroid;
