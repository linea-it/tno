import React, { useEffect, useState } from 'react';
import Grid from '@material-ui/core/Grid';
import { Card, CardContent, CardHeader, MenuItem, Button } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/styles';
import Table from './utils/CustomTable';
import { getSkybotLists } from '../api/SearchSsso';
import TextField from '@material-ui/core/TextField';
import Slider from '@material-ui/core/Slider';
import clsx from 'clsx';
import Icon from '@material-ui/core/Icon';

const useStyles = makeStyles((theme) => ({
  filterField: {
    marginLeft: theme.spacing(3),
    marginRight: theme.spacing(3),
    width: 200,
  },
  filterSlider: {
    width: 200,
    marginLeft: theme.spacing(3),
    marginRight: theme.spacing(3),
    marginTop: theme.spacing(1),
  },
  filtersContainer: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  clearButton: {
    marginTop: 20,
    marginLeft: theme.spacing(3),
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
  const [dClass, setDclass] = useState("Centaur");
  const [subLevelVisible, setSubLevelVisible] = useState(true);
  const [subDClass, setSubDClass] = useState([]);
  const [subDClassSelect, setSubDClassSelect] = useState("");

  const classes = useStyles();

  const filters = []

  useEffect(() => {
    setTitle("Search SSSO");
    loadTableData();
  }, []);

  useEffect(() => {
    loadTableData();
  }, [vMagnitude]);

  useEffect(() => {
    let classes = [];
    let optionFound = optionsClassFirstLevel.filter((option) => option.value === dClass);

    classes = classes.concat(optionFound);

    let curChidren = [];
    classes.forEach((value, i) => {
      let childrenFound = optionsClassSecondLevel.filter((option) => option.parentId === value.id);
      curChidren = curChidren.concat(childrenFound);
    });

    setSubDClass(curChidren);
    loadDynamicSubClass();

    loadTableData();

  }, [dClass]);

  useEffect(() => {
    if (subDClass.length < 1) {
      setSubDClassSelect("");
      setSubLevelVisible(true);
    }
    if (subDClass.length > 0) {
      setSubDClassSelect(subDClass[0].value);
      setSubLevelVisible(false);
    }

  }, [subDClass]);

  useEffect(() => {
    // console.log(dClass);
  }, [dClass]);

  useEffect(() => {

    loadTableData();

  }, [subDClassSelect]);

  const loadTableData = (event) => {

    console.log("DClass: ", dClass);
    console.log("SubDClass: ", subDClassSelect);

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
        value: subDClassSelect == "" ? dClass : subDClassSelect
      });
    }

    //This filter means only asteroids in CCD
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
    setSubDClassSelect("");
  };

  const handleSearchSssoDetail = (row) => {
    history.push(`search-ssso-detail/${row.id}`);
  };

  const dynClass = [
    { id: 1, label: 'Centaur', value: 'Centaur' },
    { id: 2, label: 'Hungaria', value: 'Hungaria' },
    { id: 3, label: 'KBO', value: 'KBO' },
    { id: 4, label: 'Mars-Crosser', value: 'Mars-Crosser' },
    { id: 5, label: 'MB', value: 'MB' },
    { id: 6, label: 'NEA', value: 'NEA' },
    { id: 7, label: 'Trojan', value: 'Trojan' },
  ];

  const loadDynamicSubClass = () => {
    return subDClass.map((el) => (
      <MenuItem
        key={el.id}
        value={el.value}
      >
        {el.value}
      </MenuItem>
    ));
  };

  const loadDynamicClassColumns = () => {
    return dynClass.map((el) => (
      <MenuItem
        key={el.value}
        value={el.value}
        title={el.title}
      >
        {el.value}
      </MenuItem>
    ));
  };

  const tableColumns = [
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
    {
      name: 'id',
      title: " ",
      icon: <Icon className={clsx(`fas fa-info-circle ${classes.icoDetail}`)} />,
      action: handleSearchSssoDetail,
    }
  ];

  const optionsClassFirstLevel = [
    { id: 1, label: 'Centaur', value: 'Centaur' },
    { id: 2, label: 'Hungaria', value: 'Hungaria' },
    { id: 3, label: 'KBO', value: 'KBO' },
    { id: 4, label: 'Mars-Crosser', value: 'Mars-Crosser' },
    { id: 5, label: 'MB', value: 'MB' },
    { id: 6, label: 'NEA', value: 'NEA' },
    { id: 7, label: 'Trojan', value: 'Trojan' },
  ];

  const optionsClassSecondLevel = [
    { id: 1, parentId: 3, label: 'Detached', value: 'KBO>Detached' },
    { id: 2, parentId: 3, label: 'Classical', value: 'KBO>Classical' },
    { id: 3, parentId: 3, label: 'Classical>Inner', value: 'KBO>Classical>Inner' },
    { id: 4, parentId: 3, label: 'Classical>Main', value: 'KBO>Classical>Main' },
    { id: 5, parentId: 3, label: 'Classical>Outer', value: 'KBO>Classical>Outer' },
    { id: 6, parentId: 3, label: 'Resonant>11:3', value: 'KBO>Resonant>11:3' },
    { id: 7, parentId: 3, label: 'Resonant>11:6', value: 'KBO>Resonant>11:6' },
    { id: 8, parentId: 3, label: 'Resonant>11:8', value: 'KBO>Resonant>11:8' },
    { id: 9, parentId: 3, label: 'Resonant>19:9', value: 'KBO>Resonant>19:9' },
    { id: 10, parentId: 3, label: 'Resonant>2:1', value: 'KBO>Resonant>2:1' },
    { id: 11, parentId: 3, label: 'Resonant>3:1', value: 'KBO>Resonant>3:1' },
    { id: 12, parentId: 3, label: 'Resonant>3:2', value: 'KBO>Resonant>3:2' },
    { id: 13, parentId: 3, label: 'Resonant>4:3', value: 'KBO>Resonant>4:3' },
    { id: 14, parentId: 3, label: 'Resonant>5:2', value: 'KBO>Resonant>5:2' },
    { id: 15, parentId: 3, label: 'Resonant>5:3', value: 'KBO>Resonant>5:3' },
    { id: 16, parentId: 3, label: 'Resonant>5:4', value: 'KBO>Resonant>5:4' },
    { id: 17, parentId: 3, label: 'Resonant>7:2', value: 'KBO>Resonant>7:2' },
    { id: 18, parentId: 3, label: 'Resonant>7:3', value: 'KBO>Resonant>7:3' },
    { id: 19, parentId: 3, label: 'Resonant>7:4', value: 'KBO>Resonant>7:4' },
    { id: 20, parentId: 3, label: 'Resonant>9:4', value: 'KBO>Resonant>9:4' },
    { id: 21, parentId: 3, label: 'Resonant>9:5', value: 'KBO>Resonant>9:5' },
    { id: 22, parentId: 3, label: 'SDO', value: 'KBO>SDO' },
    { id: 23, parentId: 5, label: 'Cybele', value: 'MB>Cybele' },
    { id: 24, parentId: 5, label: 'Hilda', value: 'MB>Hilda' },
    { id: 25, parentId: 5, label: 'Inner', value: 'MB>Inner' },
    { id: 26, parentId: 5, label: 'Middle', value: 'MB>Middle' },
    { id: 27, parentId: 5, label: 'Outer', value: 'MB>Outer' },
    { id: 28, parentId: 6, label: 'Amor', value: 'NEA>Amor' },
    { id: 29, parentId: 6, label: 'Apollo', value: 'NEA>Apollo' },
    { id: 30, parentId: 6, label: 'Aten', value: 'NEA>Aten' },
    { id: 31, parentId: 6, label: 'Aten', value: 'NEA>Atira' },
    { id: 32, parentId: 4, label: 'Deep', value: 'Mars-Crosser>Deep' },
    { id: 33, parentId: 4, label: 'Shallow', value: 'Mars-Crosser>Shallow' },
  ];

  const handleSelectDynamicClass = (event) => {
    setDclass(event.target.value);
  };

  const handleSubLevelSelect = (event) => {
    setSubDClassSelect(event.target.value);
  };

  return (
    <Grid>
      <Grid container spacing={3}>
        <Grid item lg={12} xl={12}>
          <Card>
            <CardHeader
              title={"SkyBot Output"}
            />
            <CardContent>
              <form className={classes.filtersContainer}>
                <TextField
                  className={classes.filterField}
                  select
                  label="Select Dynamic Class"
                  // SelectProps={
                  //   { multiple: true }
                  // }
                  value={dClass}
                  onChange={handleSelectDynamicClass}
                >
                  {loadDynamicClassColumns()}
                </TextField>
                <TextField
                  className={classes.filterField}
                  select
                  disabled={subLevelVisible}
                  label="Select Sub Level"
                  value={subDClassSelect}
                  onChange={handleSubLevelSelect}
                >
                  {loadDynamicSubClass()} }
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
              </form>
              <Button
                variant="contained"
                color="primary"
                onClick={handleClearFilters}
                className={classes.clearButton}
              >
                Clear
                </Button>

              <Grid item lg={3}>
              </Grid>
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
      </Grid >
    </Grid >
  );
}
