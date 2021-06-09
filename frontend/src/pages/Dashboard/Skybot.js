import React, { useEffect, useState } from 'react';
import { Grid, Card, CardHeader, CardContent } from '@material-ui/core';
import Table from '../../components/Table';

import { getResultsByDynclass } from '../../services/api/Dashboard';

function Skybot() {
  const [resultsByDynclass, setResultsByDynclass] = useState([]);

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
        <Card>
          <CardHeader title="Results By Dynamic Class" />
          <CardContent>
            <Table
              columns={resultsByDynclassColumns}
              data={resultsByDynclass}
              totalCount={resultsByDynclass.length}
              remote={false}
              hasSearching={false}
              defaultSorting={[{ columnName: 'dynclass', direction: 'asc' }]}
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
