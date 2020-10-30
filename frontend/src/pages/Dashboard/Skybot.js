import React, { useEffect, useState } from 'react';
import {
  Grid,
  Typography,
  Card,
  CardHeader,
  CardContent,
} from '@material-ui/core';
import Table from '../../components/Table';

import {
  getResultsByYear,
  getResultsByDynclass,
} from '../../services/api/Dashboard';

function Skybot() {
  const [resultsByYear, setResultsByYear] = useState([]);
  const [resultsByDynclass, setResultsByDynclass] = useState([]);

  const resultsByYearColumns = [
    {
      name: 'year',
      title: 'Year',
      width: 80,
    },
    {
      name: 'nights',
      title: '# Nights',
      width: 100,
    },
    {
      name: 'exposures',
      title: '# Exposures',
    },
    {
      name: 'ccds',
      title: '# CCDs',
    },
    {
      name: 'nights_analyzed',
      title: '# Nights Analyzed',
    },
    {
      name: 'exposures_analyzed',
      title: '# Exposures Analyzed',
      width: 100,
    },
    {
      name: 'percentage_nights',
      title: '÷ Nights',
      width: 100,
    },
    {
      name: 'percentage_ccds',
      title: '÷ CCDs',
      width: 100,
    },
  ];

  const resultsByDynclassColumns = [
    {
      name: 'dynclass',
      title: 'Dynclass',
      width: 140,
    },
    {
      name: 'nights',
      title: '# Nights',
      width: 100,
    },
    {
      name: 'ccds',
      title: '# CCDs',
      width: 100,
    },
    {
      name: 'asteroids',
      title: '# SSOs',
      width: 100,
    },
    {
      name: 'positions',
      title: '# Observations',
      width: 150,
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
  ];

  useEffect(() => {
    // Get results by year
    getResultsByYear()
      .then((res) => {
        // Adding two more columns:
        // percentage_nights: the division of the nights_analyzed by the all the nights
        // ccds_analyzed: the division of the ccds_analyzed by all the ccds
        const result = res.map((row) => ({
          ...row,
          percentage_nights: row.nights_analyzed / row.nights,
          percentage_ccds: row.ccds_analyzed / row.ccds,
        }));

        setResultsByYear(result);
      })
      .catch(() => {
        setResultsByYear([]);
      });
  }, []);

  useEffect(() => {
    // Get results by dynamic class
    getResultsByDynclass()
      .then((res) => {
        setResultsByDynclass(res);
      })
      .catch(() => {
        setResultsByDynclass([]);
      });
  }, []);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h4" component="h1" gutterBottom>
          Skybot
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Card>
              <CardHeader title="Results By Year" />
              <CardContent>
                <Table
                  columns={resultsByYearColumns}
                  data={resultsByYear}
                  totalCount={resultsByYear.length}
                  remote={false}
                  hasSearching={false}
                  defaultSorting={[{ columnName: 'year', direction: 'asc' }]}
                  hasRowNumberer
                  hasPagination={false}
                  hasColumnVisibility={false}
                  hasToolbar={false}
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card>
              <CardHeader title="Results By Dynamic Class" />
              <CardContent>
                <Table
                  columns={resultsByDynclassColumns}
                  data={resultsByDynclass}
                  totalCount={resultsByDynclass.length}
                  remote={false}
                  hasSearching={false}
                  defaultSorting={[
                    { columnName: 'dynclass', direction: 'asc' },
                  ]}
                  hasRowNumberer
                  hasPagination={false}
                  hasColumnVisibility={false}
                  hasToolbar={false}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}

export default Skybot;
