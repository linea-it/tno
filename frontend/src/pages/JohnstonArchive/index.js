import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  CardHeader,
  Icon,
  Button,
  Snackbar,
} from '@material-ui/core';
import moment from 'moment';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import {
  getJohnstonArchives,
  updateJohnstonList,
} from '../../services/api/Input';
import Table from '../../components/Table';

function JohnstonArchive({ setTitle }) {
  const history = useHistory();
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(false);
  const [dataTotalCount, setDataTotalCount] = useState(0);
  const [snackBarVisible, setSnackBarVisible] = useState(false);
  const [snackBarPosition] = useState({
    vertical: 'bottom',
    horizontal: 'right',
  });

  useEffect(() => {
    setTitle('Johnston Archives');
  }, [setTitle]);

  const loadTableData = ({ currentPage, pageSize, searchValue }) => {
    setLoading(true);

    getJohnstonArchives({
      page: currentPage + 1,
      pageSize,
      search: searchValue,
    })
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

    updateJohnstonList().then(() => setReload(!reload));
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
          <CardHeader title="List of Known Trans-Neptunian Objects and other outer Solar System Objects " />
          <CardContent>
            <Table
              data={tableData}
              columns={tableColumns}
              loadData={loadTableData}
              totalCount={dataTotalCount}
              loading={loading}
              reload={reload}
            />
          </CardContent>
        </Card>
      </Grid>
      <Snackbar
        open={snackBarVisible}
        autoHideDuration={7000}
        anchorOrigin={{ vertical, horizontal }}
        message="Updating...  It takes about 3 minutes"
        onClose={() => setSnackBarVisible(false)}
      />
    </Grid>
  );
}

JohnstonArchive.propTypes = {
  setTitle: PropTypes.func.isRequired,
};

export default JohnstonArchive;
