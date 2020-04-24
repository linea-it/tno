import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, CardHeader, Icon } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import SnackBar from '@material-ui/core/Snackbar';
import moment from 'moment';
import clsx from 'clsx';
import {
  getJohnstonArchives,
  updateJohnstonList,
} from '../../services/api/Input';
import CustomTable from '../../components/helpers/CustomTable';

function JohnstonArchive({ setTitle, history }) {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataTotalCount, setDataTotalCount] = useState(0);
  const [snackBarVisible, setSnackBarVisible] = useState(false);
  const [snackBarTransition, setSnackBarTransition] = useState(undefined);
  const [snackBarPosition] = useState({
    vertical: 'bottom',
    horizontal: 'right',
  });

  useEffect(() => {
    setTitle('Johnston Archives');
  }, []);

  const loadTableData = (event) => {
    setLoading(true);

    const page = typeof event === 'undefined' ? 1 : event.currentPage + 1;
    const pageSize = typeof event === 'undefined' ? 10 : event.pageSize;
    const search = typeof event === 'undefined' ? ' ' : event.searchValue;

    getJohnstonArchives({ page, pageSize, search })
      .then((res) => {
        setTableData(res.data.results);
        setDataTotalCount(res.data.count);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const tableColumns = [
    {
      name: 'id',
      title: 'Details',
      icon: <Icon className="fas fa-info-circle" />,
      action: (el) => {
        history.push(`/johnston-archive/${el.id}`);
      },
      sortingEnabled: false,
    },
    {
      name: 'name',
      title: 'Obj Name',
      headerTooltip: 'Object Name (official or provisional designation)',
      sortingEnabled: false,
    },
    {
      name: 'number',
      title: 'Obj Num',
      headerTooltip: 'Object Number (not all objects have numbers assigned)',
      sortingEnabled: false,
    },
    {
      name: 'dynamical_class',
      title: 'Dyn Class',
      headerTooltip: 'Dynamic Class',
      sortingEnabled: false,
    },
    {
      name: 'perihelion_distance',
      title: 'Perih Dist q(AU)',
      headerTooltip: 'Perihelion Distance - q(AU)',
      align: 'right',
      sortingEnabled: false,
    },
    {
      name: 'aphelion_distance',
      title: 'Aphel Dist',
      headerTooltip: 'Aphelion Distance',
      align: 'right',
      sortingEnabled: false,
    },
    {
      name: 'diameter',
      title: 'Diameter (Km)',
      align: 'right',
      sortingEnabled: false,
    },
    {
      name: 'albedo',
      title: 'Albedo',
      align: 'right',
      sortingEnabled: false,
    },
    {
      name: 'density',
      title: 'Density',
      align: 'right',
      sortingEnabled: false,
    },
    {
      name: 'known_components',
      title: 'Known Comp',
      headerTooltip: 'Known Components',
      width: 200,
      sortingEnabled: false,
    },
    {
      name: 'discovery',
      title: 'Discovery',
      sortingEnabled: false,
    },
    {
      name: 'updated',
      title: 'Updated',
      customElement: (row) => (
        <span>
          {row.updated ? moment(row.updated).format('YYYY-MM-DD HH:mm:ss') : ''}
        </span>
      ),
      sortingEnabled: false,
    },
  ];

  const handleUpdate = () => {
    setLoading(true);
    setTableData([]);
    setSnackBarVisible(true);

    // ????
    updateJohnstonList()
      .then((res) => {
        console.log(res);
      })
      .finally(() => {
        loadTableData();
      });
  };

  const { vertical, horizontal } = snackBarPosition;

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Button variant="contained" color="primary" onClick={handleUpdate}>
          Update List
        </Button>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardHeader
            title="List of Known Trans-Neptunian Objects
                             and other outer Solar System Objects "
          />
          <CardContent>
            <CustomTable
              data={tableData}
              columns={tableColumns}
              loadData={loadTableData}
              totalCount={dataTotalCount}
              loading={loading}
            />
          </CardContent>
        </Card>
      </Grid>
      <SnackBar
        open={snackBarVisible}
        autoHideDuration={7000}
        TransitionComponent={snackBarTransition}
        anchorOrigin={{ vertical, horizontal }}
        message="Updating...  It takes about 3 minutes"
        onClose={() => setSnackBarVisible(false)}
      />
    </Grid>
  );
}

export default JohnstonArchive;
