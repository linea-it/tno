import React, { useEffect, useState } from 'react';
import { Grid, Card, CardHeader, CardContent } from '@material-ui/core';
import PropTypes from 'prop-types';
import histogramExposures from '../../assets/img/dashboard/histogramExposures.png';
import histogramExposureTime from '../../assets/img/dashboard/histogramExposureTime.png';
import exposuresbyclass from '../../assets/img/dashboard/ExposuresByClass.png';
import histogramSemimajoraxis from '../../assets/img/dashboard/histogramSemimajoraxis.png';
import histogramBands from '../../assets/img/dashboard/histogramBands.png';
import animation from '../../assets/img/dashboard/animation.gif';
import CustomTable from '../../components/helpers/CustomTable';

function Dashboard({ setTitle }) {
  useEffect(() => {
    setTitle('Dashboard');
  }, [setTitle]);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6} lg={4}>
        <Card>
          <CardHeader title="Exposures x Year" />
          <CardContent>
            <Grid container spacing={2}>
              <Grid xs={12}>
                <img
                  src={histogramExposures}
                  alt="Exposures x Year"
                  title="Exposures x Year"
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTable
                  columns={[
                    {
                      name: 'year',
                      title: 'Year',
                      width: 200,
                    },
                    {
                      name: 'exposures',
                      title: 'Exposures',
                    },
                  ]}
                  data={[
                    {
                      year: 'Y0',
                      exposures: 8169,
                    },
                    {
                      year: 'Y1',
                      exposures: 22141,
                    },
                    {
                      year: 'Y2',
                      exposures: 23598,
                    },
                    {
                      year: 'Y3',
                      exposures: 18648,
                    },
                    {
                      year: 'Y4',
                      exposures: 25772,
                    },
                    {
                      year: 'Y5',
                      exposures: 24467,
                    },
                    {
                      year: 'Y6',
                      exposures: 12730,
                    },
                  ]}
                  hasSearching={false}
                  hasColumnVisibility={false}
                  hasToolbar={false}
                  remote={false}
                  hasPagination={false}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6} lg={4}>
        <Card>
          <CardHeader title="Exposures x Exposure Time" />
          <CardContent>
            <Grid container spacing={2}>
              <Grid xs={12}>
                <img
                  src={histogramExposureTime}
                  alt="Exposures x Exposure Time"
                  title="Exposures x Exposure Time"
                />
              </Grid>
              <Grid xs={12}>
                <CustomTable
                  columns={[
                    {
                      name: 'exposure_time',
                      title: 'Exposure Time (s)',
                      width: 200,
                      align: 'center',
                    },
                    {
                      name: 'exposure_numer',
                      title: 'N. Exposures',
                      align: 'right',
                    },
                  ]}
                  data={[
                    {
                      exposure_time: '0 - 100',
                      exposure_numer: 121084,
                    },
                    {
                      exposure_time: '100 - 200',
                      exposure_numer: 3578,
                    },
                    {
                      exposure_time: '200 - 300',
                      exposure_numer: 4826,
                    },
                    {
                      exposure_time: '300 - 400',
                      exposure_numer: 4959,
                    },
                    {
                      exposure_time: '400 - 500',
                      exposure_numer: 938,
                    },
                    {
                      exposure_time: '500 - 1200',
                      exposure_numer: 158,
                    },
                  ]}
                  hasSorting={false}
                  hasSearching={false}
                  hasColumnVisibility={false}
                  hasToolbar={false}
                  remote={false}
                  hasPagination={false}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6} lg={4}>
        <Card>
          <CardHeader title="Exposures x Band" />
          <CardContent>
            <Grid container spacing={2}>
              <Grid xs={12}>
                <img
                  src={histogramBands}
                  alt="Exposures x Band"
                  title="Exposures x Band"
                  style={{ maxHeight: 311 }}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTable
                  columns={[
                    {
                      name: 'year',
                      title: 'Year',
                      width: 90,
                    },
                    {
                      name: 'u',
                      title: 'u',
                      width: 70,
                    },
                    {
                      name: 'g',
                      title: 'g',
                      width: 70,
                    },
                    {
                      name: 'r',
                      title: 'r',
                      width: 70,
                    },
                    {
                      name: 'i',
                      title: 'i',
                      width: 70,
                    },
                    {
                      name: 'z',
                      title: 'z',
                      width: 70,
                    },
                    {
                      name: 'y',
                      title: 'Y',
                      width: 70,
                    },
                  ]}
                  data={[
                    {
                      year: 'Y0',
                      u: 271,
                      g: 1550,
                      r: 1527,
                      i: 1738,
                      z: 1754,
                      y: 1347,
                    },
                    {
                      year: 'Y1',
                      u: 108,
                      g: 4856,
                      r: 3792,
                      i: 4028,
                      z: 4661,
                      y: 4696,
                    },
                    {
                      year: 'Y2',
                      u: 227,
                      g: 4741,
                      r: 4751,
                      i: 4830,
                      z: 5269,
                      y: 3780,
                    },
                    {
                      year: 'Y3',
                      u: 321,
                      g: 3529,
                      r: 3766,
                      i: 3532,
                      z: 4239,
                      y: 3261,
                    },
                    {
                      year: 'Y4',
                      u: 309,
                      g: 5855,
                      r: 5253,
                      i: 5405,
                      z: 5341,
                      y: 3609,
                    },
                    {
                      year: 'Y5',
                      u: 457,
                      g: 5044,
                      r: 4981,
                      i: 5499,
                      z: 6045,
                      y: 2441,
                    },
                    {
                      year: 'Y6',
                      u: 260,
                      g: 2791,
                      r: 2654,
                      i: 2479,
                      z: 3160,
                      y: 1386,
                    },
                  ]}
                  hasSearching={false}
                  hasColumnVisibility={false}
                  hasToolbar={false}
                  remote={false}
                  hasPagination={false}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6} lg={4}>
        <Card>
          <CardHeader title="Aitoff projection of the exposures" />
          <CardContent>
            <img
              src={animation}
              alt="Aitoff projection of the exposures"
              title="Aitoff projection of the exposures"
            />
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6} lg={4}>
        <Card>
          <CardHeader title="Objects and observations identified in CCD images" />
          <CardContent>
            <img
              src={exposuresbyclass}
              alt="Objects and observations identified in CCD images"
              title="Objects and observations identified in CCD images"
            />
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6} lg={4}>
        <Card>
          <CardHeader title="Histogram Semi-major axis of identified objects" />
          <CardContent>
            <img
              src={histogramSemimajoraxis}
              alt="Histogram Semi-major axis of identified objects"
              title="Histogram Semi-major axis of identified objects"
              style={{ maxHeight: 385 }}
            />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

Dashboard.propTypes = {
  setTitle: PropTypes.func.isRequired,
};

export default Dashboard;
