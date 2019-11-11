import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Grid,
  Card,
  makeStyles,
  CardHeader,
  CardContent,
} from '@material-ui/core';
import Toolbar from '@material-ui/core/Toolbar';
import Icon from '@material-ui/core/Icon';
import clsx from 'clsx';
import Skeleton from '@material-ui/lab/Skeleton';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import CustomTable from './utils/CustomTable';
import { CCD } from './utils/CustomChart';
import { getExposurePlot, getOutputByExposure, getAsteroidsInsideCCD } from '../api/Skybot';


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
  btnFailure: {
    backgroundColor: '#ff1a1a',
    color: '#fff',
  },
  btnRunning: {
    backgroundColor: '#0099ff',
    color: '#000',
  },
  btnNotExecuted: {
    backgroundColor: '#ABA6A2',
    color: '#fff',
  },
  btnWarning: {
    backgroundColor: '#D79F15',
    color: '#FFF',
  },
  invisibleButton: {
    backgroundColor: 'transparent',
    cursor: 'pointer',
    color: 'rgb(85, 85, 85)',
    '&:hover': {
      color: 'rgba(0, 0, 0, 0.87)',
    },
    padding: 0,
    fontSize: '1rem',
    lineHeight: 1.75,
    fontHeight: 500,
    letterSpacing: '0.02857em',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '100%',
  },
});

function SkybotAsteroid({ setTitle, match }) {
  const classes = useStyles();
  const coneSearchRadius = 1.2; // ! Cone search radius in Degres.
  const { id, runId } = match.params;
  const [ccdsPlotData, setCcdsPlotData] = useState({});
  const [exposuresTableColumns, setExposuresTableColumns] = useState([]);
  const [exposuresTableData, setExposuresTableData] = useState([]);
  const [asteroidsOnlyInsideCcds, setAsteroidsOnlyInsideCcds] = useState(true);

  const circleCoordinatesPlaneFormat = (x) => {
    if (typeof x === 'number') return x > 180 ? x - 360 : x;
    return x.map((n) => (n > 180 ? n - 360 : n));
  };

  const round = (value, decimals) => Number(`${Math.round(`${value}e${decimals}`)}e-${decimals}`);

  useEffect(() => {
    setTitle('Skybot Run');

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
          y: [
            center.y - coneSearchRadius,
            center.y + coneSearchRadius,
          ],
        },
      });
    });
  }, []);

  useEffect(() => {
    setExposuresTableColumns([]);
    setExposuresTableData([]);
    if (asteroidsOnlyInsideCcds === false) {
      getOutputByExposure(runId, id).then((res) => {
        const columns = Object.keys(res.rows[0]).map((column) => {
          if (column === 'externallink') {
            return {
              name: column,
              customElement: (el) => {
                if (el.externallink === 'link') return '-';
                return (
                  <a href={el.externallink} target="_blank" rel="noopener noreferrer" className={classes.invisibleButton} title={el.externallink}>
                    <Icon className={clsx(`fas fa-external-link-square-alt ${classes.iconDetail}`)} />
                  </a>
                );
              },
            };
          }

          return {
            name: column,
          };
        });


        setExposuresTableColumns(columns);
        setExposuresTableData(res.rows.map((row) => ({
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
        })));
      });
    } else {
      getAsteroidsInsideCCD(id).then((res) => {
        const columns = Object.keys(res.rows[0]).map((column) => {
          if (column === 'externallink') {
            return {
              name: column,
              customElement: (el) => {
                if (el.externallink === 'link') return '-';
                return (
                  <a href={el.externallink} target="_blank" rel="noopener noreferrer" className={classes.invisibleButton} title={el.externallink}>
                    <Icon className={clsx(`fas fa-external-link-square-alt ${classes.iconDetail}`)} />
                  </a>
                );
              },
            };
          }

          return {
            name: column,
          };
        });
        setExposuresTableColumns(columns);
        setExposuresTableData(res.rows.map((row) => ({
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
        })));
      });
    }
  }, [asteroidsOnlyInsideCcds]);

  const handleAsteroidInCcds = () => setAsteroidsOnlyInsideCcds(!asteroidsOnlyInsideCcds);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={12}>
            <Card>
              <CardHeader
                title="Asteroids Inside CCD"
              />
              <CardContent className={classes.cardContentWrapper}>
                {ccdsPlotData.ccds ? (
                  <CCD
                    data={ccdsPlotData}
                    height={550}
                  />
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
              <CardHeader
                title="Asteroids"
              />
              <CardContent className={classes.cardContentWrapper}>
                <Toolbar>
                  <FormControlLabel
                    control={(
                      <Switch
                        checked={asteroidsOnlyInsideCcds}
                        onChange={handleAsteroidInCcds}
                        value={asteroidsOnlyInsideCcds}
                        color="primary"
                      />
                    )}
                    label="Only Asteroids Inside CCDs"
                  />
                </Toolbar>
                {exposuresTableData.length > 0 ? (
                  <CustomTable
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
