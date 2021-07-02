import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Grid,
  Card,
  CardHeader,
  CardContent,
  Icon,
  Button,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from '@material-ui/core';
import {
  CheckCircle as SuccessIcon,
  Cancel as FailureIcon,
} from '@material-ui/icons';
import { Skeleton } from '@material-ui/lab';
import Plot from 'react-plotly.js';
import OrbitTracerTimeProfile from '../../components/Chart/OrbitTracerTimeProfile';
import Table from '../../components/Table';
import List from '../../components/List';
import { useTitle } from '../../contexts/title';
import data from './data.json';
import axios from 'axios';

function OrbitTracerAsteroid() {
  const { setTitle } = useTitle();
  const history = useHistory();

  const [results, setResults] = useState([]);
  const [observations, setObservations] = useState([]);
  const [summary, setSummary] = useState([]);
  const [timeProfile, setTimeProfile] = useState([]);
  const [orbitPath, setOrbitPath] = useState([]);
  const [brightnessVariation, setBrightnessVariation] = useState([]);
  const [jplOriginal, setJplOriginal] = useState({
    ra: [],
    dec: [],
    dates: [],
  });
  const [jpl, setJpl] = useState({ ra: [], dec: [] });
  const [orbitalPathYears, setOrbitalPathYears] = useState([
    '2012',
    '2013',
    '2014',
    '2015',
    '2016',
    '2017',
    '2018',
    '2019',
  ]);

  useEffect(() => {
    setTitle('Discovery');
  }, []);

  useEffect(() => {
    setResults(data);
  }, []);

  useEffect(() => {
    setObservations(
      data.observations.map((observation) => ({
        ...observation,
        ...data.ccds.filter((ccd) => ccd.id === observation.ccd_id)[0],
      }))
    );
  }, []);

  const observationsColumns = [
    {
      name: 'asteroid_id',
      title: 'ID',
    },
    {
      name: 'ccd_id',
      title: 'CCD ID',
    },
    {
      name: 'name',
      title: 'Name',
    },
    {
      name: 'filename',
      title: 'Filename',
      width: 180,
    },
    {
      name: 'date_obs',
      title: 'Obs. Date',
      customElement: (row) => row.date_obs.split('.')[0],
    },
    {
      name: 'date_jd',
      title: 'Date JD',
    },
    {
      name: 'exptime',
      title: 'Exp. Time',
      align: 'center',
    },
    {
      name: 'ra',
      title: 'RA',
    },
    {
      name: 'dec',
      title: 'Dec',
    },
    {
      name: 'offset_ra',
      title: 'Offset RA',
    },
    {
      name: 'offset_dec',
      title: 'Offset Dec',
    },
    {
      name: 'mag_psf',
      title: 'Mag PSF',
    },
    {
      name: 'mag_psf_err',
      title: 'Mag PSF Error',
    },
    {
      name: 'observed_coordinates',
      title: 'Obs. Coordinates',
      customElement: (row) =>
        row.observed_coordinates ? (
          <SuccessIcon style={{ color: '#009900' }} />
        ) : (
          <FailureIcon color="error" />
        ),
      align: 'center',
      width: 160,
    },
  ];

  useEffect(() => {
    setSummary([
      {
        title: 'ID',
        value: results.id,
      },
      {
        title: 'SPKID',
        value: results.spkid,
      },
      {
        title: 'Name',
        value: results.name,
      },
      {
        title: '# CCDs',
        value: results.ccds_count,
      },
      {
        title: '# Observed Coordinates',
        value: results.observations_count,
      },
    ]);
  }, [results]);

  useEffect(() => {
    setTimeProfile(data.time_profile);
  }, []);

  useEffect(() => {
    axios
      .get('/jpl_theoretical/', {
        params: {
          start: '2012-11-01',
          end: '2019-02-01',
        },
      })
      .then((res) => {
        setJplOriginal(res.data);
        setJpl(res.data);
      });
  }, []);

  useEffect(() => {
    if (observations.length > 0) {
      const x = observations.map(
        (observation) => observation.observed_coordinates[0]
      );
      const y = observations.map(
        (observation) => observation.observed_coordinates[1]
      );

      setOrbitPath([
        {
          mode: 'lines',
          x: jpl.ra,
          y: jpl.dec,
          line: {
            dash: 'dot',
            width: 3,
            color: '#aaa',
          },
          name: 'JPL Theoretical',
        },
        {
          type: 'scatter',
          mode: 'markers',
          x,
          y,
          name: 'Observed',
        },
      ]);
    }
  }, [observations, jpl]);

  useEffect(() => {
    if (observations.length > 0) {
      const x = observations.map((observation) => observation.date_jd);
      const y = observations.map((observation) => observation.mag_psf);

      setBrightnessVariation([
        {
          type: 'scatter',
          mode: 'markers',
          x,
          y,
        },
      ]);
    }
  }, [observations]);

  const handleBackNavigation = () => history.goBack();

  const handleOrbitalPathYearsChange = (value) => {
    if (orbitalPathYears.includes(value)) {
      setOrbitalPathYears(orbitalPathYears.filter((year) => year !== value));
    } else {
      setOrbitalPathYears((prevState) => [...prevState, value]);
    }
  };

  const handleOrbitalPathAllChange = () => {
    if (orbitalPathYears.length === 0) {
      setOrbitalPathYears([
        '2012',
        '2013',
        '2014',
        '2015',
        '2016',
        '2017',
        '2018',
        '2019',
      ]);
    } else {
      setOrbitalPathYears([]);
    }
  };

  useEffect(() => {
    if (jplOriginal.dates.length > 0) {
      let newJpl = {
        ra: [],
        dec: [],
      };

      jplOriginal.dates.forEach((date, i) => {
        if (orbitalPathYears.includes(date.split('-')[0])) {
          newJpl.ra.push(jplOriginal.ra[i]);
          newJpl.dec.push(jplOriginal.dec[i]);
        }
      });

      setJpl(newJpl);
    }
  }, [orbitalPathYears, jplOriginal]);

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
        <Card>
          <CardHeader title="Summary" />
          <CardContent>
            <List data={summary} />
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={8}>
        <Card>
          <CardHeader title="Time Profile" />
          <CardContent>
            {timeProfile.length > 0 ? (
              <OrbitTracerTimeProfile data={timeProfile} />
            ) : (
              <Skeleton variant="rect" hght={550} />
            )}
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title="Orbital Path" />
          <CardContent>
            <FormGroup row>
              <FormControlLabel
                control={
                  <Checkbox
                    name="All"
                    indeterminate={
                      orbitalPathYears.length !== 8 &&
                      orbitalPathYears.length !== 0
                    }
                    checked={orbitalPathYears.length !== 0}
                    onChange={handleOrbitalPathAllChange}
                    color="primary"
                  />
                }
                label="All"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="2012"
                    checked={orbitalPathYears.includes('2012')}
                    onChange={() => handleOrbitalPathYearsChange('2012')}
                  />
                }
                label="2012"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="2013"
                    checked={orbitalPathYears.includes('2013')}
                    onChange={() => handleOrbitalPathYearsChange('2013')}
                  />
                }
                label="2013"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="2014"
                    checked={orbitalPathYears.includes('2014')}
                    onChange={() => handleOrbitalPathYearsChange('2014')}
                  />
                }
                label="2014"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="2015"
                    checked={orbitalPathYears.includes('2015')}
                    onChange={() => handleOrbitalPathYearsChange('2015')}
                  />
                }
                label="2015"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="2016"
                    checked={orbitalPathYears.includes('2016')}
                    onChange={() => handleOrbitalPathYearsChange('2016')}
                  />
                }
                label="2016"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="2017"
                    checked={orbitalPathYears.includes('2017')}
                    onChange={() => handleOrbitalPathYearsChange('2017')}
                  />
                }
                label="2017"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="2018"
                    checked={orbitalPathYears.includes('2018')}
                    onChange={() => handleOrbitalPathYearsChange('2018')}
                  />
                }
                label="2018"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="2019"
                    checked={orbitalPathYears.includes('2019')}
                    onChange={() => handleOrbitalPathYearsChange('2019')}
                  />
                }
                label="2019"
              />
            </FormGroup>
            <Plot
              data={orbitPath}
              layout={{
                hovermode: 'closest',
                autosize: true,
                yaxis: {
                  scaleanchor: 'x',
                },
              }}
              config={{
                scrollZoom: false,
                displaylogo: false,
                responsive: true,
              }}
            />
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title="Brightness Variation" />
          <CardContent>
            <Plot
              data={brightnessVariation}
              layout={{
                hovermode: 'closest',
                autosize: true,
              }}
              config={{
                scrollZoom: false,
                displaylogo: false,
                responsive: true,
              }}
            />
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Card>
          <CardHeader title="Observations" />
          <CardContent>
            <Table
              columns={observationsColumns}
              data={observations}
              totalCount={observations.length}
              hasSearching={false}
              remote={false}
            />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

export default OrbitTracerAsteroid;
