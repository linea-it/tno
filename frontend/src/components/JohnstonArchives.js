import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, CardHeader, Icon, makeStyles } from '@material-ui/core';
import CustomTable from '../components/utils/CustomTable';
import { getJohnstonArchives } from '../api/Input';
import moment from 'moment';
import clsx from 'clsx';



const useStyles = makeStyles({
  iconDetail: {
    fontSize: 18,
  }
});


function JohnstonArchives({ setTitle, history }) {

  const classes = useStyles();
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataTotalCount, setDataTotalCount] = useState(0);


  useEffect(() => {
    setTitle("Johnston Archives");
  }, []);

  const loadTableData = (event) => {
    setLoading(true);

    let page = typeof event === 'undefined' ? 1 : event.currentPage + 1;
    let pageSize = typeof event === 'undefined' ? 10 : event.pageSize;
    let search = typeof event === 'undefined' ? " " : event.searchValue;

    getJohnstonArchives({ page, pageSize, search })
      .then((res) => {
        setTableData(res.data.results);
        setDataTotalCount(res.data.count);
      }).finally(() => {
        setLoading(false);
      });
  };

  const tableColumns = [
    {
      name: 'id',
      title: 'Details',
      icon: <Icon className={clsx(`fas fa-info-circle ${classes.iconDetail}`)} />,
      action: (el) => {
        history.push(`/johnston-archives/${el.id}`);
      }
      ,
      sortingEnabled: false,
    },
    {
      name: 'name',
      title: "Obj Name",
      headerTooltip: "Object Name (official or provisional designation)",
      sortingEnabled: false,
    },
    {
      name: 'number',
      title: "Obj Num",
      headerTooltip: "Object Number (not all objects have numbers assigned)",
      align: 'right',
      sortingEnabled: false,
    },
    {
      name: 'dynamical_class',
      title: "Dyn Class",
      headerTooltip: "Dynamic Class",
      sortingEnabled: false,
    },
    {
      name: 'perihelion_distance',
      title: "Perih Dist q(AU)",
      headerTooltip: "Perihelion Distance - q(AU)",
      align: 'right',
      sortingEnabled: false,
    },
    {
      name: 'aphelion_distance',
      title: "Aphel Dist",
      headerTooltip: 'Aphelion Distance',
      align: 'right',
      sortingEnabled: false,
    },
    {
      name: 'diameter',
      title: "Diameter (Km)",
      align: 'right',
      sortingEnabled: false,
    },
      {
      name: 'albedo',
      title: "Albedo",
      align: 'right',
      sortingEnabled: false,
    },
    {
      name: 'density',
      title: "Density",
      align: 'right',
      sortingEnabled: false,
    },
    {
      name: 'known_components',
      title: "Known Comp",
      headerTooltip: "Known Components",
      sortingEnabled: false,
    },
    {
      name: 'discovery',
      title: "Discovery",
      sortingEnabled: false,
    },
    {
      name: 'updated',
      title: "Updated",
      sortingEnabled: false,
    },
  ]

  return (

    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title="List of Known Trans-Neptunian Objects
                             and other outer Solar System Objects " />
          <CardContent>
            <CustomTable
              data={tableData}
              columns={tableColumns}
              loadData={loadTableData}
              totalCount={dataTotalCount}
              loading={loading}
            >
            </CustomTable>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default JohnstonArchives;