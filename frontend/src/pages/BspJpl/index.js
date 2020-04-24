import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { Grid, Card, CardContent, CardHeader } from '@material-ui/core';
import { getBspJpl } from '../../services/api/Input';
import CustomTable from '../../components/helpers/CustomTable';

function BspJpl({ setTitle }) {
  const [tableData, setTableData] = useState([]);
  const [dataTotalCount, setDataTotalCount] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTitle('Bsp Jpl');
  }, []);

  const loadTableData = (event) => {
    const page = typeof event === 'undefined' ? 1 : event.currentPage + 1;
    const pageSize = typeof event === 'undefined' ? 10 : event.pageSize;
    const search = typeof event === 'undefined' ? ' ' : event.searchValue;

    getBspJpl({ page, pageSize, search })
      .then((res) => {
        setLoading(true);
        setTableData(res.data.results);
        setDataTotalCount(res.data.count);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const columnsTable = [
    {
      name: 'name',
      title: 'Name',
      width: 140,
      sortingEnabled: false,
    },
    {
      name: 'filename',
      title: 'Filename',
      width: 180,
      align: 'left',
      sortingEnabled: false,
    },
    {
      name: 'download_start_time',
      title: 'Download Start Time',
      width: 200,
      customElement: (row) => (
        <span>
          {row.download_start_time
            ? moment(row.download_start_time).format('YYYY-MM-DD HH:mm:ss')
            : ''}
        </span>
      ),
      sortingEnabled: false,
    },
    {
      name: 'download_finish_time',
      title: 'Download Finish Time',
      width: 200,
      customElement: (row) => (
        <span>
          {row.download_finish_time
            ? moment(row.download_finish_time).format('YYYY-MM-DD HH:mm:ss')
            : ''}
        </span>
      ),
      sortingEnabled: false,
    },
    {
      name: 'file_size',
      title: 'File Size',
      width: 100,
      align: 'right',
      sortingEnabled: false,
    },
  ];

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title="List with the BSP JPL Files" />
          <CardContent>
            <CustomTable
              data={tableData}
              columns={columnsTable}
              loadData={loadTableData}
              loading={loading}
              totalCount={dataTotalCount}
            />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

export default BspJpl;
