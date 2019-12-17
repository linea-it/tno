import React, { useEffect, useState } from 'react';
import { getBspJpl } from '../api/Input';
import CustomTable from '../components/utils/CustomTable';
import moment from 'moment';


function BspJpl({ setTitle }) {

  const [tableData, setTableData] = useState([]);
  const [dataTotalCount, setDataTotalCount] = useState(1);

  useEffect(() => {
    setTitle("Bsp Jpl");
  }, []);


  const loadTableData = (event) => {

    let page = typeof event === 'undefined' ? 1 : event.currentPage + 1;
    let pageSize = typeof event === 'undefined' ? 10 : event.pageSize;

    getBspJpl({ page, pageSize, }).then((res) => {
      setTableData(res.data.results);
      setDataTotalCount(res.data.count);
    })
  };

  const columnsTable = [
    {
      name: 'name',
      title: "Name",
      width: 140,
      sortingEnabled: false,
    },
    {
      name: "filename",
      title: "Filename",
      width: 180,
      align: "left",
      sortingEnabled: false,
    },
    {
      name: "download_start_time",
      title: "Download Start Time",
      width: 200,
      customElement: (row) => (
        <span>
          {row.download_start_time ? moment(row.download_start_time).format("YYYY-MM-DD HH:mm:ss") : ""}
        </span>
      ),
      sortingEnabled: false,
    },
    {
      name: "download_finish_time",
      title: "Download Finish Time",
      width: 200,
      customElement: (row) => (
        <span>
          {row.download_finish_time ? moment(row.download_finish_time).format("YYYY-MM-DD HH:mm:ss") : ""}
        </span>
      ),
      sortingEnabled: false,
    },
    {
      name: "file_size",
      title: "File Size",
      width: 100,
      align: "right",
      sortingEnabled: false,
    },
  ];

  return (
    <CustomTable
      data={tableData}
      columns={columnsTable}
      loadData={loadTableData}
      totalCount={dataTotalCount}
      hasSearching={false}
      hasColumnVisibility={false}
    >
    </CustomTable>
  );
}

export default BspJpl;
