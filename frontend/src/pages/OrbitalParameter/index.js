import React, { useEffect, useState } from 'react';
import Card from '@material-ui/core/Card';
import { makeStyles } from '@material-ui/styles';
import Grid from '@material-ui/core/Grid';
import { CardHeader, CardContent } from '@material-ui/core';
import moment from 'moment';
import Icon from '@material-ui/core/Icon';
import clsx from 'clsx';
import { getOrbitalParameterFiles } from '../../services/api/Input';
import CustomTable from '../../components/helpers/CustomTable';
import { readOrbitalFile } from '../../services/api/Orbit';
import CustomDialog from '../../components/helpers/CustomDialog';
import CustomLog from '../../components/helpers/CustomLog';

const useStyles = makeStyles((theme) => ({
  iconDetail: {
    fontSize: 18,
  },
  dialogBodyStyle: {
    backgroundColor: '#1D4455',
    color: '#FFFFFF',
    border: 'none',
    height: 600,
    width: 1600,
  },
}));

function OrbitalParameterFiles({ setTitle }) {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableDataCount, setTableDataCount] = useState(true);
  const [dialog, setDialog] = useState({
    visible: false,
    content: [],
    title: ' ',
  });

  useEffect(() => {
    setTitle('Orbital Parameter Files');
  }, [setTitle]);

  const classes = useStyles();

  const loadTableData = (event) => {
    setLoading(true);

    const page = typeof event === 'undefined' ? 1 : event.currentPage + 1;
    const pageSize = typeof event === 'undefined' ? 10 : event.pageSize;
    const search = typeof event === 'undefined' ? '' : event.searchValue;
    const ordering = event.sorting[0].direction === 'desc' ? `-${event.sorting[0].columnName}` : event.sorting[0].columnName;

    getOrbitalParameterFiles({
      page, pageSize, search, ordering,
    })
      .then((res) => {
        setTableData(res.data.results);
        setTableDataCount(res.data.count);
      }).finally(() => {
        setLoading(false);
      });
  };

  const tableColumns = [
    {
      name: 'id',
      title: 'Details',
      width: 100,
      icon: <Icon className={clsx(`fas fa-info-circle ${classes.iconDetail}`)} />,
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
          {row.download_start_time ? moment(row.download_start_time).format('YYYY-MM-DD HH:mm:ss') : ''}
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
          {row.download_start_time ? moment(row.download_finish_time).format('YYYY-MM-DD HH:mm:ss') : ''}
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
      width: 200,
      sortingEnabled: false,
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

      readOrbitalFile().then((res) => {
        const data = res.rows;

        if (res.success) {
          data.forEach((line, idx) => {
            arrayLines.push(<div key={idx}>{line}</div>);
          });
        } else {
          arrayLines.push(<div key={0}>{res.msg}</div>);
        }
        setDialog({ content: data, visible: true, title: `${file}` });
      });
    }
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
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
            />
          </CardContent>
        </Card>
      </Grid>
      <CustomDialog
        maxWidth={1700}
        visible={dialog.visible}
        title={dialog.title}
        content={<CustomLog data={dialog.content} />}
        setVisible={() => setDialog({ visible: false, content: [], title: ' ' })}
        bodyStyle={classes.dialogBodyStyle}
      />
    </Grid>
  );
}

export default OrbitalParameterFiles;
