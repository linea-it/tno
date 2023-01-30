import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Grid, Card, CardContent, CardHeader, Icon } from '@material-ui/core';
import moment from 'moment';
import { getObservationFiles } from '../../services/api/Input';
import Table from '../../components/Table';
import Dialog from '../../components/Dialog';
import Log from '../../components/Log';
import { readFile } from '../../services/api/Orbit';

function Observation({ }) {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableDataCount, setTableDataCount] = useState(true);
  const [dialog, setDialog] = useState({
    visible: false,
    content: [],
    title: ' ',
  });

  // useEffect(() => {
  //   setTitle('Observation Files');
  // }, [setTitle]);

  const loadTableData = (event) => {
    setLoading(true);
    const page = typeof event === 'undefined' ? 1 : event.currentPage + 1;
    const pageSize = typeof event === 'undefined' ? 10 : event.pageSize;
    const search = typeof event === 'undefined' ? ' ' : event.searchValue;
    const ordering =
      event.sorting[0].direction === 'desc'
        ? `-${event.sorting[0].columnName}`
        : event.sorting[0].columnName;

    getObservationFiles({
      page,
      pageSize,
      search,
      ordering,
    })
      .then((res) => {
        setTableData(res.data.results);
        setTableDataCount(res.data.count);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const tableColumns = [
    {
      name: 'id',
      title: 'Details',
      width: 100,
      icon: <Icon className="fas fa-info-circle" />,
      action: (el) => handleFileReading(el.download_url),
      align: 'center',
      sortingEnabled: false,
    },
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
      title: 'Observ',
      sortingEnabled: false,
      headerTooltip: 'Observations',
    },
    {
      name: 'filename',
      title: 'Filename',
      sortingEnabled: false,
      width: 150,
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
          {row.download_start_time
            ? moment(row.download_finish_time).format('YYYY-MM-DD HH:mm:ss')
            : ''}
        </span>
      ),
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
      width: 200,
    },
    {
      name: 'download_url',
      title: 'Download Url',
      sortingEnabled: false,
      width: 200,
    },
  ];

  const handleFileReading = (file) => {
    if (file && typeof file !== 'undefined') {
      const arrayLines = [];
      console.log(file);

      readFile(file).then((res) => {
        const data = res.rows;

        if (res.success) {
          data.forEach((line, idx) => {
            arrayLines.push(<div key={idx}>{line}</div>);
          });
        } else {
          arrayLines.push(<div key={0}>{res.msg}</div>);
        }
        setDialog({ content: data, visible: true, title: `${file} ` });
      });
    }
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title="List with the Observation Files" />
          <CardContent>
            <Table
              data={tableData}
              columns={tableColumns}
              loadData={loadTableData}
              loading={loading}
              totalCount={tableDataCount}
            />
          </CardContent>
        </Card>
      </Grid>
      <Dialog
        maxWidth={1700}
        visible={dialog.visible}
        title={dialog.title}
        content={<Log data={dialog.content} />}
        setVisible={() =>
          setDialog({ visible: false, content: [], title: ' ' })
        }
      />
    </Grid>
  );
}

// Observation.propTypes = {
//   // setTitle: PropTypes.func.isRequired,
//   setTitle: PropTypes.func,
// };

export default Observation;
