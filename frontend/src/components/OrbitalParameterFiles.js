import React, { useEffect, useState } from 'react';
import CustomTable from './utils/CustomTable';
import { getOrbitalParameterFiles } from '../api/Input';
import Card from '@material-ui/core/Card';
import Grid from '@material-ui/core/Grid';
import { CardHeader, CardContent } from '@material-ui/core';

function OrbitalParameterFiles({ setTitle }) {

  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTitle("Orbital Parameter Files");
  }, []);

  const loadTableData = (event) => {

    setLoading(true);

    let page = typeof event === 'undefined' ? 1 : event.currentPage + 1;
    let pageSize = typeof event === 'undefined' ? 10 : event.pageSize;
    let search = typeof event === 'undefined' ? "" : event.searchValue;

    getOrbitalParameterFiles({ page, pageSize, search })
      .then((res) => {
        setTableData(res.data.results);
      }).finally(() => {
        setLoading(false);
      });
  };

  const tableColumns = [
    {
      name: 'name',
      title: 'Name',
      sortingEnabled: false
    },
    {
      name: 'source',
      title: 'Source',
      sortingEnabled: false,
    },
    {
      name: 'filename',
      title: 'Filename',
      sortingEnabled: false,
    },
    {
      name: 'download_start_time',
      title: 'Download Start Time',
      sortingEnabled: false
    },
    {
      name: 'download_finish_time',
      title: 'Download Finish Time',
      sortingEnabled: false
    },
    {
      name: 'file_size',
      title: 'File Size',
      sortingEnabled: false,
    },
    {
      name: 'external_url',
      title: 'External Url',
      sortingEnabled: false,
    },
    {
      name: 'download_url',
      title: 'Download Url',
      sortingEnabled: false,
    },
  ]

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} >
        <Card>
          <CardHeader title="List with the Orbital Parameter Files" />
          <CardContent>
            <CustomTable
              data={tableData}
              columns={tableColumns}
              hasColumnVisibility={false}
              loadData={loadTableData}
              loading={loading}
            >
            </CustomTable>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default OrbitalParameterFiles;