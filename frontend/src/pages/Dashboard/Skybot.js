import React, { useEffect, useState } from 'react';
import {
  Grid,
  Card,
  CardHeader,
  CardContent,
} from '@material-ui/core';
import Table from '../../components/Table';

import {
  getResultsByYear,
} from '../../services/api/Dashboard';

function Skybot() {
  const [resultsByYear, setResultsByYear] = useState([]);

  const resultsByYearColumns = [
    {
      name: 'year',
      title: 'Year',
      width: 90,
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
      title: '% Nights',
      width: 100,
    },
    {
      name: 'percentage_ccds',
      title: '% CCDs',
      width: 100,
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
          percentage_nights: Math.round(
            (row.nights_analyzed / row.nights) * 100
          ),
          percentage_ccds: Math.round((row.ccds_analyzed / row.ccds) * 100),
        }));

        setResultsByYear(result);
      })
      .catch(() => {
        setResultsByYear([]);
      });
  }, []);

  return (
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
              hasPagination={false}
              hasColumnVisibility={false}
              hasToolbar={false}
            />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

export default Skybot;
