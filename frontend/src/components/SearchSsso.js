import React, { useEffect, useState } from 'react';
import Grid from '@material-ui/core/Grid';
import { Card, CardContent, CardHeader, MenuItem, Button } from '@material-ui/core';
import { FormControl, InputLabel, Select } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/styles';
import Table from './utils/CustomTable';
import { getSkybotLists } from '../api/SearchSsso';

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

}));

export default function SearchSsso({ setTitle }) {

  const [tableData, setTableData] = useState([{}]);
  const [tablePage] = useState(1);
  const [tablePageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [vMagnitude, setVmagnitude] = useState("");
  const [dClass, setDclass] = useState([]);

  const classes = useStyles();

  const filters = []

  useEffect(() => {
    setTitle("Search SSSO");
    loadTableData();
  }, []);

  const loadTableData = (event) => {
    let page = typeof event === 'undefined' ? tablePage : event.currentPage + 1;
    let pageSize = typeof event === 'undefined' ? tablePageSize : event.pageSize;
    let searchValue = typeof event === 'undefined' ? ' ' : event.searchValue;


    if (vMagnitude && vMagnitude != "") {
      filters.push({
        property: 'mv__range',
        value: vMagnitude,
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

    getSkybotLists({ page: page, pageSize: pageSize, search: searchValue, filters: filters }).then(res => {
      setTotalCount(res.data.count);
      setTableData(res.data.results);
    });
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
      width: 150,
      align: 'center',
    },
    {
      name: 'raj2000',
      title: 'RA (deg)',
      width: 160,
      align: 'center',
    },
    {
      name: 'decj2000',
      title: 'Dec (deg)',
      width: 160,
      align: 'center',
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
      align: 'center',
    },
    {
      name: 'dynclass',
      title: 'Dynamic Class',
      width: 150,
      align: 'center',
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
      width: 250,
      align: 'center',
    },
  ]


  useEffect(() => {

    loadTableData();

    console.log(dClass);

  }, [vMagnitude, dClass]);


  const handleSelectVisualMagnitude = (event) => {
    setVmagnitude(event.target.value);
  };

  const handleSelectDynamicClass = (event) => {
    setDclass(event.target.value);
  };

  const loadMagnitudeColumns = () => {

    const magnitude = [
      { name: "18,19", value: '18,19', title: '18 - 19' },
      { name: "19,20", value: '19,20', title: '19 - 20' },
      { name: "20,21", value: '20,21', title: '20 - 21' },
      { name: "21,22", value: '21,22', title: '21 - 22' },
      { name: "22,23", value: '22,23', title: '22 - 23' },
      { name: "23,24", value: '23,24', title: '23 - 24' },
      { name: "24,25", value: '24,25', title: '24 - 25' },
      { name: "25,26", value: '25,26', title: '25 - 26' },
      { name: "26,27", value: '26,27', title: '26 - 27' },
      { name: "27,28", value: '27,28', title: '27 - 28' },
      { name: "28,29", value: '28,29', title: '28 - 29' },
      { name: "29,30", value: '29,30', title: '29 - 30' },
      { name: "30,31", value: '30,31', title: '30 - 31' },
      { name: "31,32", value: '31,32', title: '31 - 32' },
      { name: "32,33", value: '32,33', title: '32 - 33' },
      { name: "33,34", value: '33,34', title: '33 - 34' },
      { name: "34,35", value: '34,35', title: '34 - 35' },
      { name: "35,36", value: '35,36', title: '35 - 36' },
    ];


    return magnitude.map((el, i) => (
      <MenuItem

        key={i}
        value={el.value}
        title={el.title}
      >
        {el.title}
      </MenuItem>
    ));
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

    return dynclass.map((el, i) => (
      <MenuItem

        key={i}
        value={el.value}
        title={el.title}
      >
        {el.title}
      </MenuItem>
    ));


  };



  const select_visual_magnitude = () => {
    return (
      <FormControl className={classes.formControl} fullWidth>
        <InputLabel htmlFor="magnitude">Visual Magnitude</InputLabel>
        <Select
          value={vMagnitude}
          onChange={handleSelectVisualMagnitude}
          className={classes.visualMagnitude}
        >
          {loadMagnitudeColumns()}
        </Select>
      </FormControl>
    );
  };




  const select_dynamic_class = () => {

    return (
      <FormControl className={classes.formControl} fullWidth>
        <InputLabel htmlFor="dynamicClass">Dynamics Class</InputLabel>
        <Select
          multiple
          value={dClass}
          onChange={handleSelectDynamicClass}
          className={classes.dynamicClass}
        >
          {loadDynamicClassColumns()}
        </Select>
      </FormControl>
    );
  };


  const handleClearFilters = () => {
    setVmagnitude("");
    setDclass([]);
  };

  return (
    <Grid>
      {/*         
        <Grid container spacing={6}>
          <Grid item lg={6} xl={6}>
            <Card>
              <CardHeader
                title={"Plot_Dinamics"}
              />
            </Card>

          </Grid>
          <Grid item lg={6} xl={6}>
            <Card>
              <CardHeader
                title={" Plot_Band"}
              />
            </Card>
          </Grid>
        </Grid> */}

      {/* <Grid container spacing={6}>
          <Grid item lg={12}>
            <Paper className={classes.paper}>
              <Typography variant={"h6"} className={classes.title} >
                Total of CCDs
            </Typography>
              <Typography variant={"subtitle1"} className={classes.subtitle}>
                amount: {totalCount}
            </Typography>

              <Typography variant={"h6"} className={classes.title} >
                Total number of observations
    
            </Typography>
              <Typography variant={"subtitle1"} className={classes.subtitle}>
                amount: {totalCount}
            </Typography>

              <Typography variant={"h6"} className={classes.title} >
                Object with the largest number of observations
    
            </Typography>
              <Typography variant={"subtitle1"} className={classes.subtitle}>
                name: KBO
            </Typography>

              <Typography variant={"h6"} className={classes.title} >
                Number of observations of object KBO
    
            </Typography>
              <Typography variant={"subtitle1"} className={classes.subtitle}>
                amount: {totalCount}
            </Typography>
            </Paper>

          </Grid>
        </Grid> */}

      <Grid container spacing={6}>
        <Grid item lg={12} xl={12}>
          <Card>
            <CardHeader
              title={"SkyBot Output"}
            />
            <CardContent>
              <Grid item lg={3}>
                {select_visual_magnitude()}
                {select_dynamic_class()}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleClearFilters}
                >
                  Clear
                </Button>
              </Grid>
              <Table
                data={tableData}
                columns={tableColumns}
                loadData={loadTableData}
                totalCount={totalCount}
                hasToolbar={true}
              >
              </Table>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Grid>
  );
}
