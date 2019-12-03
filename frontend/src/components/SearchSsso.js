import React, { useEffect, useState } from 'react';
import Grid from '@material-ui/core/Grid';
import { Card, CardContent, CardHeader, MenuItem, Button } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/styles';
import Table from './utils/CustomTable';
import { getSkybotLists } from '../api/SearchSsso';
import Toolbar from '@material-ui/core/Toolbar';
import TextField from '@material-ui/core/TextField';
import Slider from '@material-ui/core/Slider';
import clsx from 'clsx';
import Icon from '@material-ui/core/Icon';

const useStyles = makeStyles((theme) => ({
  paper: {
    paddingTop: 15,
    paddingLeft: 30,
    paddingBottom: 10,
  },
  subtitle: {
    marginBottom: 10,
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  filterField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 200,
  },
  filterSlider: {
    width: 200,
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    marginTop: theme.spacing(3),
  },
  filterSliderLabel: {
    color: theme.palette.text.secondary,
  },
  icoDetail: {
    fontSize: 18,
  }
}));

export default function SearchSsso({ history, setTitle }) {
  const [tableData, setTableData] = useState([{}]);
  const [tablePage] = useState(1);
  const [tablePageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [vMagnitude, setVmagnitude] = useState([4, 18]);
  const [dClass, setDclass] = useState([]);

  const classes = useStyles();

  const filters = []

  useEffect(() => {
    setTitle("Search SSSO");
    loadTableData();
  }, []);

  useEffect(() => {
    loadTableData();
  }, [vMagnitude, dClass]);

  const loadTableData = (event) => {
    let page = typeof event === 'undefined' ? tablePage : event.currentPage + 1;
    let pageSize = typeof event === 'undefined' ? tablePageSize : event.pageSize;
    let searchValue = typeof event === 'undefined' ? ' ' : event.searchValue;
    if (vMagnitude) {
      filters.push({
        property: 'mv__range',
        value: vMagnitude.join(),
      });
    }
    if (dClass && dClass.length > 0) {
      filters.push({
        property: 'dynclass__in',
        value: dClass.toString(),
      });
    }
    filters.push({
      property: 'ccdnum__isnull',
      value: false,
    });
    getSkybotLists({ page, pageSize, search: searchValue, filters }).then(res => {
      setTotalCount(res.data.count);
      setTableData(res.data.results);
    });
  };

  const handleClearFilters = () => {
    setVmagnitude([4, 18]);
    setDclass([]);
  };

  const handleSearchSssoDetail = (row) => {
    history.push(`search-ssso-detail/${row.id}`);
  };

  const loadDynamicClassColumns = () => {
    const dynclass = [
      { name: 'Centaur', value: 'Centaur', title: 'Centaur', },
      { name: 'Hungaria', value: 'Hungaria', title: 'Hungaria', },
      { name: 'KBO>Classical>Inner', value: 'KBO>Classical>Inner', title: 'KBO>Classical>Inner', },
      { name: 'KBO>Classical>Main', value: 'KBO>Classical>Main', title: 'KBO>Classical>Main', },
      { name: 'KBO>Detached', value: 'KBO>Detached', title: 'KBO>Detached', },
      { name: 'KBO>Resonant>11:3', value: 'KBO>Resonant>11:3', title: 'KBO>Resonant>11:3', },
      { name: 'KBO>Resonant>11:6', value: 'KBO>Resonant>11:6', title: 'KBO>Resonant>11:6', },
      { name: 'KBO>Resonant>11:8', value: 'KBO>Resonant>11:8', title: 'KBO>Resonant>11:8', },
      { name: 'KBO>Resonant>19:9', value: 'KBO>Resonant>19:9', title: 'KBO>Resonant>19:9', },
      { name: 'KBO>Resonant>2:1', value: 'KBO>Resonant>2:1', title: 'KBO>Resonant>2:1', },
      { name: 'KBO>Resonant>3:1', value: 'KBO>Resonant>3:1', title: 'KBO>Resonant>3:1', },
      { name: 'KBO>Resonant>3:2', value: 'KBO>Resonant>3:2', title: 'KBO>Resonant>3:2', },
      { name: 'KBO>Resonant>4:3', value: 'KBO>Resonant>4:3', title: 'KBO>Resonant>4:3', },
      { name: 'KBO>Resonant>5:2', value: 'KBO>Resonant>5:2', title: 'KBO>Resonant>5:2', },
      { name: 'KBO>Resonant>5:3', value: 'KBO>Resonant>5:3', title: 'KBO>Resonant>5:3', },
      { name: 'KBO>Resonant>5:4', value: 'KBO>Resonant>5:4', title: 'KBO>Resonant>5:4', },
      { name: 'KBO>Resonant>7:2', value: 'KBO>Resonant>7:2', title: 'KBO>Resonant>7:2', },
      { name: 'KBO>Resonant>7:3', value: 'KBO>Resonant>7:3', title: 'KBO>Resonant>7:3', },
      { name: 'KBO>Resonant>7:4', value: 'KBO>Resonant>7:4', title: 'KBO>Resonant>7:4', },
      { name: 'KBO>Resonant>9:4', value: 'KBO>Resonant>9:4', title: 'KBO>Resonant>9:4', },
      { name: 'KBO>Resonant>9:5', value: 'KBO>Resonant>9:5', title: 'KBO>Resonant>9:5', },
      { name: 'KBO>SDO', value: 'KBO>SDO', title: 'KBO>SDO', },
      { name: 'Mars-Crosser', value: 'Mars-Crosser', title: 'Mars-Crosser', },
      { name: 'MB>Cybele', value: 'MB>Cybele', title: 'MB>Cybele', },
      { name: 'MB>Hilda', value: 'MB>Hilda', title: 'MB>Hilda', },
      { name: 'MB>Inner', value: 'MB>Inner', title: 'MB>Inner', },
      { name: 'MB>Middle', value: 'MB>Middle', title: 'MB>Middle', },
      { name: 'MB>Outer', value: 'MB>Outer', title: 'MB>Outer', },
      { name: 'NEA>Amor', value: 'NEA>Amor', title: 'NEA>Amor', },
      { name: 'NEA>Apollo', value: 'NEA>Apollo', title: 'NEA>Apollo', },
      { name: 'NEA>Aten', value: 'NEA>Aten', title: 'NEA>Aten', },
      { name: 'Trojan', value: 'Trojan', title: 'Trojan', },
    ];

    return dynclass.map((el) => (
      <MenuItem
        key={el.value}
        value={el.value}
        title={el.title}
      >
        {el.title}
      </MenuItem>
    ));
  };

  const tableColumns = [
    {
      name: 'id',
      title: 'Details',
      width: 100,
      icon: <Icon className={clsx(`fas fa-info-circle ${classes.icoDetail}`)} />,
      action: handleSearchSssoDetail,
      sortingEnabled: false,
    },
    {
      name: 'name',
      title: 'Object Name',
      width: 180,
      align: 'left',
    },
    {
      name: 'num',
      title: 'Object Number',
      width: 130,
      align: 'left',
    },
    {
      name: 'raj2000',
      title: 'RA (deg)',
      width: 120,
      align: 'left',
      customElement: (row) => {
        return (
          <span>
            {row.raj2000 ? parseFloat(row.raj2000.toFixed(3)) : ""}
          </span>
        );
      },
    },
    {
      name: 'decj2000',
      title: 'Dec (deg)',
      width: 120,
      align: 'left',
      customElement: (row) => {
        return (
          <span>
            {row.decj2000 ? parseFloat(row.decj2000.toFixed(3)) : ""}
          </span>
        );
      },
    },
    {
      name: 'ccdnum',
      title: 'CCD Number',
      width: 120,
      align: 'center',
    },
    {
      name: 'band',
      title: 'Band',
      width: 70,
      align: 'center',
    },
    {
      name: 'expnum',
      title: 'Exposure',
      width: 130,
      align: 'left',
    },
    {
      name: 'dynclass',
      title: 'Dynamic Class',
      width: 140,
      align: 'left',
    },
    {
      name: 'mv',
      title: 'Visual Magnitude',
      width: 150,
      align: 'center',
    },
    {
      name: 'errpos',
      title: 'Error on the position (arcsec)',
      width: 248,
      align: 'center',
    },

  ]

  return (
    <Grid>
      <Grid container spacing={6}>
        <Grid item lg={12} xl={12}>
          <Card>
            <CardHeader
              title={"SkyBot Output"}
            />
            <CardContent>
              <Toolbar>
                <TextField
                  className={classes.filterField}
                  select
                  label="Dynamics Class"
                  SelectProps={
                    { multiple: true }
                  }
                  value={dClass}
                  onChange={(event) => { setDclass(event.target.value); }}
                >
                  {loadDynamicClassColumns()}
                </TextField>
                <div className={classes.filterSlider}>
                  <Typography gutterBottom variant="body2" className={classes.filterSliderLabel}>
                    {`Magnitude(g): ${vMagnitude}`}
                  </Typography>
                  <Slider
                    value={vMagnitude}
                    step={1}
                    min={4}
                    max={23}
                    valueLabelDisplay="auto"
                    onChange={(event, value) => { setVmagnitude(value); }}
                  />
                </div>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleClearFilters}
                >
                  Clear
                </Button>
              </Toolbar>
              <Table
                data={tableData}
                columns={tableColumns}
                loadData={loadTableData}
                totalCount={totalCount}
                loading={true}
                hasToolbar
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Grid>
  );
}
