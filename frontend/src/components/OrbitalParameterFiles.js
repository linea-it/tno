import React, { useEffect, useState } from 'react';
import CustomTable from './utils/CustomTable';
import { getOrbitalParameterFiles } from '../api/Input';
import Card from '@material-ui/core/Card';
import Grid from '@material-ui/core/Grid';
import { CardHeader, CardContent } from '@material-ui/core';
import moment from 'moment';

function OrbitalParameterFiles({ setTitle }) {

  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableDataCount, setTableDataCount] = useState(true);


  useEffect(() => {
    setTitle("Orbital Parameter Files");
  }, []);

  const loadTableData = (event) => {

    setLoading(true);

    let page = typeof event === 'undefined' ? 1 : event.currentPage + 1;
    let pageSize = typeof event === 'undefined' ? 10 : event.pageSize;
    let search = typeof event === 'undefined' ? "" : event.searchValue;
    const ordering = event.sorting[0].direction === 'desc' ? `-${event.sorting[0].columnName}` : event.sorting[0].columnName;

    getOrbitalParameterFiles({ page, pageSize, search, ordering })
      .then((res) => {
        setTableData(res.data.results);
        setTableDataCount(res.data.count);
      }).finally(() => {
        setLoading(false);
      });
  };

  const tableColumns = [
    {
      name: 'name',
      title: 'Name',

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
      width: 200,
      customElement: (row) => (
        <span>
          {row.download_start_time ? moment(row.download_start_time).format("YYYY-MM-DD HH:mm:ss") : ""}
        </span>
      ),
      sortingEnabled: false
    },
    {
      name: 'download_finish_time',
      title: 'Download Finish Time',
      width: 200,
      customElement: (row) => (
        <span>
          {row.download_start_time ? moment(row.download_finish_time).format("YYYY-MM-DD HH:mm:ss") : ""}
        </span>
      ),
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
      width: 200,
      sortingEnabled: false,
    },
    {
      name: 'download_url',
      title: 'Download Url',
      sortingEnabled: false,
      width: 200,
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
              totalCount={tableDataCount}
            >
            </CustomTable>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default OrbitalParameterFiles;