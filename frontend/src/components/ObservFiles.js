import React, { useEffect, useState } from 'react';
import CustomTable from './utils/CustomTable';
import { getObservationFiles } from '../api/Input';

function ObservFiles({ setTitle }) {

  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTitle("Observation Files");
  }, []);

  const loadTableData = (event) => {
    setLoading(true);
    let page = typeof event === 'undefined' ? 1 : event.currentPage + 1;
    let pageSize = typeof event === 'undefined' ? 10 : event.pageSize;
    let search = typeof event === 'undefined' ? " " : event.searchValue;

    getObservationFiles({ page, pageSize, search }).then((res) => {
      setTableData(res.data.results);
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
      name: 'observations',
      title: 'Observations',
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
      sortingEnabled: false,
    },
    {
      name: 'download_finish-time',
      title: "Download Finish Time",
      sortingEnabled: false,
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
    }
  ]

  return (
    <CustomTable
      data={tableData}
      columns={tableColumns}
      loadData={loadTableData}
      loading={loading}
      hasColumnVisibility={false}
    >
    </CustomTable>
  );
};
export default ObservFiles;

