import React, { useEffect, useState } from 'react';
import Grid from '@material-ui/core/Grid';
import {
  Card, CardContent, CardHeader, MenuItem, Button
} from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/styles';
import { getSkybotLists } from '../api/SearchSsso';
import Toolbar from '@material-ui/core/Toolbar';
import TextField from '@material-ui/core/TextField';
import Slider from '@material-ui/core/Slider';
import clsx from 'clsx';
import Icon from '@material-ui/core/Icon';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import Input from '@material-ui/core/Input';
import FormControl from "@material-ui/core/FormControl";
import Chip from "@material-ui/core/Chip";
import { getSkybotOutput } from '../api/SearchSsso';
import Table from './utils/CustomTable';

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
  filtersContainer: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  chip: {
    margin: 2,
  },
  filterField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 600,
  },
  filterSubLevel: {
    marginLeft: theme.spacing(1),
    marginTop: theme.spacing(1),
    width: 600,
  },
  filterSlider: {
    width: 200,
    marginLeft: theme.spacing(6),
    marginRight: theme.spacing(1),
    marginTop: theme.spacing(3),
  },
  filterSliderLabel: {
    color: theme.palette.text.secondary,
  },
  icoDetail: {
    fontSize: 18,
  },
  clearButton: {
    marginTop: theme.spacing(3),
    marginLeft: theme.spacing(2),
  },
}));

export default function SearchSsso({ history, setTitle }) {
  const [tableData, setTableData] = useState([{}]);
  const [tablePage] = useState(1);
  const [tablePageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [vMagnitude, setVmagnitude] = useState([4, 18]);
  const [dClass, setDclass] = useState([]);
  const [dynamicClass, setDynamicClass] = useState([0]);
  const [subLevelDynamicClassSelected, setSubLevelDynamicClassSelected] = useState([]);
  const [subLevelDynamicClassList, setSubLevelDynamicClassList] = useState([]);
  const [objectCompiled, setObjectCompiled] = useState();

  const classes = useStyles();

  const filters = [];

  useEffect(() => {
    setTitle('Search SSSO');
    loadTableData();
  }, []);

  useEffect(() => {
    loadTableData();
  }, [vMagnitude, dClass]);

  useEffect(() => {
    let currentSublevelList = [];
    dynamicClass.forEach((i) => {
      const current = optionsClassFirstLevel[i];
      const currentChildren = optionsClassSecondLevel.filter((option) => option.parentId === current.id);
      currentSublevelList = currentSublevelList.concat(currentChildren);
    });
    setSubLevelDynamicClassSelected(Object.keys(currentSublevelList).map((el) => Number(el)));
    setSubLevelDynamicClassList(currentSublevelList);

    // loadTableData();

  }, [dynamicClass]);

  useEffect(() => {
    // loadTableData();
    //  console.log("SubLevel Selected: ", subLevelDynamicClassSelected);

    // if (dynamicClass.length > 0) {
    //   const dynamicClassSelected = dynamicClass
    //     .map((i) => optionsClassFirstLevel[i].value)
    //     .concat(
    //       subLevelDynamicClassSelected
    //         .map((i) => optionsClassSecondLevel[i].value),
    //     )
    //     .join(';');
    //   console.log(dynamicClassSelected);
    // }

    if (dynamicClass.length > 0) {
      const dynamicClassSelected = dynamicClass
        .map((i) => optionsClassFirstLevel[i].value)
        .concat(
          subLevelDynamicClassSelected
            .map((i) => subLevelDynamicClassList[i].value),
        )
        .join(';');

      setObjectCompiled(dynamicClassSelected);
    }

    // subLevelDynamicClassSelected.map((i) => {
    //   console.log("Second Level: ", subLevelDynamicClassList[i].value);
    // });

    //  console.log("Selected: ", subLevelDynamicClassSelected)

  }, [subLevelDynamicClassSelected]);

  useEffect(() => {

    loadTableData();
  }, [objectCompiled, vMagnitude]);


  const loadTableData = (event) => {
    let page = typeof event === 'undefined' ? tablePage : event.currentPage + 1;
    let pageSize = typeof event === 'undefined' ? tablePageSize : event.pageSize;
    let searchValue = typeof event === 'undefined' || !event ? '' : event.searchValue;

    // if (dClass && dClass.length > 0) {
    // filters.push({
    //   property: 'dynclass__in',
    //   // value: dClass.toString(),
    //   value: "Centaur",
    // });
    // }

    if (vMagnitude) {
      filters.push({
        property: 'mv__range',
        value: vMagnitude.join(),
      });
    }

    filters.push({
      property: 'ccdnum__isnull',
      value: false,
    });

    filters.push({
      property: 'objectTable',
      value: objectCompiled,
    });
    // getSkybotLists({ page, pageSize, search: searchValue, filters }).then(res => {
    //   setTotalCount(res.data.count);
    //   setTableData(res.data.results);
    // });

    getSkybotLists({
      page,
      pageSize,
      search: searchValue,
      filters,
    }).then(res => {
      // setTotalCount(res.data.count);
      // setTableData(res.data.results);
      console.log(res.data);
    });

    // getSkybotOutput({
    //   objectTable: dynamicClassSelected,
    //   page: page,
    //   pageSize: pageSize,
    // }).then((res) => {
    //   setTableData(res.results);
    //   setTotalCount(res.count);
    // });

    // getSkybotOutput({
    //   objectTable: objectCompiled,
    //   page: page,
    //   pageSize: pageSize,
    //   filters: filters,
    //   name: searchValue,
    // }).then((res) => {
    //   setTableData(res.results);
    //   setTotalCount(res.count);
    //   console.log(res.count);
    // });
  };

  const handleClearFilters = () => {
    setVmagnitude([4, 18]);
    setDclass([]);
  };

  const handleSearchSssoDetail = (row) => {
    history.push(`search-ssso-detail/${row.id}`);
  };
  // const loadDynamicClassColumns = () => {
  //   const dynclass = [
  //     { name: 'Centaur', value: 'Centaur', title: 'Centaur', },
  //     { name: 'Hungaria', value: 'Hungaria', title: 'Hungaria', },
  //     { name: 'KBO>Classical>Inner', value: 'KBO>Classical>Inner', title: 'KBO>Classical>Inner', },
  //     { name: 'KBO>Classical>Main', value: 'KBO>Classical>Main', title: 'KBO>Classical>Main', },
  //     { name: 'KBO>Detached', value: 'KBO>Detached', title: 'KBO>Detached', },
  //     { name: 'KBO>Resonant>11:3', value: 'KBO>Resonant>11:3', title: 'KBO>Resonant>11:3', },
  //     { name: 'KBO>Resonant>11:6', value: 'KBO>Resonant>11:6', title: 'KBO>Resonant>11:6', },
  //     { name: 'KBO>Resonant>11:8', value: 'KBO>Resonant>11:8', title: 'KBO>Resonant>11:8', },
  //     { name: 'KBO>Resonant>19:9', value: 'KBO>Resonant>19:9', title: 'KBO>Resonant>19:9', },
  //     { name: 'KBO>Resonant>2:1', value: 'KBO>Resonant>2:1', title: 'KBO>Resonant>2:1', },
  //     { name: 'KBO>Resonant>3:1', value: 'KBO>Resonant>3:1', title: 'KBO>Resonant>3:1', },
  //     { name: 'KBO>Resonant>3:2', value: 'KBO>Resonant>3:2', title: 'KBO>Resonant>3:2', },
  //     { name: 'KBO>Resonant>4:3', value: 'KBO>Resonant>4:3', title: 'KBO>Resonant>4:3', },
  //     { name: 'KBO>Resonant>5:2', value: 'KBO>Resonant>5:2', title: 'KBO>Resonant>5:2', },
  //     { name: 'KBO>Resonant>5:3', value: 'KBO>Resonant>5:3', title: 'KBO>Resonant>5:3', },
  //     { name: 'KBO>Resonant>5:4', value: 'KBO>Resonant>5:4', title: 'KBO>Resonant>5:4', },
  //     { name: 'KBO>Resonant>7:2', value: 'KBO>Resonant>7:2', title: 'KBO>Resonant>7:2', },
  //     { name: 'KBO>Resonant>7:3', value: 'KBO>Resonant>7:3', title: 'KBO>Resonant>7:3', },
  //     { name: 'KBO>Resonant>7:4', value: 'KBO>Resonant>7:4', title: 'KBO>Resonant>7:4', },
  //     { name: 'KBO>Resonant>9:4', value: 'KBO>Resonant>9:4', title: 'KBO>Resonant>9:4', },
  //     { name: 'KBO>Resonant>9:5', value: 'KBO>Resonant>9:5', title: 'KBO>Resonant>9:5', },
  //     { name: 'KBO>SDO', value: 'KBO>SDO', title: 'KBO>SDO', },
  //     { name: 'Mars-Crosser', value: 'Mars-Crosser', title: 'Mars-Crosser', },
  //     { name: 'MB>Cybele', value: 'MB>Cybele', title: 'MB>Cybele', },
  //     { name: 'MB>Hilda', value: 'MB>Hilda', title: 'MB>Hilda', },
  //     { name: 'MB>Inner', value: 'MB>Inner', title: 'MB>Inner', },
  //     { name: 'MB>Middle', value: 'MB>Middle', title: 'MB>Middle', },
  //     { name: 'MB>Outer', value: 'MB>Outer', title: 'MB>Outer', },
  //     { name: 'NEA>Amor', value: 'NEA>Amor', title: 'NEA>Amor', },
  //     { name: 'NEA>Apollo', value: 'NEA>Apollo', title: 'NEA>Apollo', },
  //     { name: 'NEA>Aten', value: 'NEA>Aten', title: 'NEA>Aten', },
  //     { name: 'Trojan', value: 'Trojan', title: 'Trojan', },
  //   ];

  //   return dynclass.map((el) => (
  //     <MenuItem
  //       key={el.value}
  //       value={el.value}
  //       title={el.title}
  //     >
  //       {el.title}
  //     </MenuItem>
  //   ));
  // };
  const handleValues = (value) => {
    const roundValue = parseFloat(value).toFixed(3);
    const stringValue = roundValue.toString();
    return stringValue;
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
      title: 'Obj Name',
      width: 180,
      align: 'left',
      headerTooltip: 'Object Name',
    },
    {
      name: 'num',
      title: 'Obj Num',
      width: 130,
      align: 'right',
    },
    {
      name: 'raj2000',
      title: 'RA (deg)',
      width: 120,
      align: 'right',
      customElement: (row) => (
        <span>
          {row.raj2000 ? handleValues(row.raj2000) : ""}
        </span>
      ),
    },
    {
      name: 'decj2000',
      title: 'Dec (deg)',
      width: 120,
      align: 'right',
      customElement: (row) => (
        <span>
          {row.decj2000 ? handleValues(row.decj2000) : ""}
        </span>
      ),
    },
    {
      name: 'ccdnum',
      title: 'CCD Num',
      width: 120,
      align: 'right',
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
      align: 'right',
    },
    {
      name: 'object_table',
      title: 'Dynamic Class',
      width: 140,
      align: 'left',
      headerTooltip: 'Dynamic Class',
    },
    {
      name: 'mv',
      title: 'Visual Magnitude (mag)',
      width: 150,
      align: 'right',
    },
    {
      name: 'errpos',
      title: 'Error on the position (arcsec)',
      width: 248,
      align: 'right',
      customElement: (row) => (
        <span>
          {row.errpos ? handleValues(row.errpos) : ""}
        </span>
      ),
    },
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

  const handleDynamicClass = (e) => {
    setSubLevelDynamicClassSelected([]);
    setDynamicClass(e.target.value);
  };

  const handleSubLevelDynamicClass = (e) => {
    setSubLevelDynamicClassSelected(e.target.value);
  };

  return (
    <Grid>
      <Grid container spacing={6}>

        <Card>
          <CardHeader
            title={"SkyBot Output"}
          />
          <CardContent>
            <form className={classes.filtersContainer}>
              <Grid item lg={7} xl={7}>
                <FormControl>
                  <InputLabel>Dynamic class</InputLabel>
                  <Select
                    multiple
                    value={dynamicClass}
                    onChange={handleDynamicClass}
                    input={<Input />}
                    className={classes.filterField}
                    renderValue={() => (
                      <div className={classes.chips}>
                        {dynamicClass.map((i) => (
                          <Chip
                            key={optionsClassFirstLevel[i].id}
                            label={optionsClassFirstLevel[i].label}
                            className={classes.chip}
                          />
                        ))}
                      </div>
                    )}
                  >
                    {optionsClassFirstLevel.map((option, i) => (
                      <MenuItem key={option.id} value={i}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item lg={3} xl={3}>
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
              </Grid>
              <Grid item lg={2} xl={2}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleClearFilters}
                  className={classes.clearButton}
                >
                  Clear
                </Button>
              </Grid>
              <FormControl className={classes.filterSubLevel}>
                <InputLabel>Sublevel dynamic class</InputLabel>
                <Select
                  disabled={!(subLevelDynamicClassList.length > 0)}
                  multiple
                  value={subLevelDynamicClassSelected}
                  onChange={handleSubLevelDynamicClass}
                  input={<Input />}
                  renderValue={() => (
                    <div className={classes.chips}>
                      {subLevelDynamicClassSelected.map((i) => (
                        <Chip
                          key={subLevelDynamicClassList[i].id}
                          label={subLevelDynamicClassList[i].label}
                          className={classes.chip}
                        />
                      ))}
                    </div>
                  )}
                >
                  {subLevelDynamicClassList.map((option, i) => (
                    <MenuItem key={option.id} value={i}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </form>
            <Table
              data={tableData}
              columns={tableColumns}
              loadData={loadTableData}
              totalCount={totalCount}
              // loading={true}
              hasToolbar
            />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
