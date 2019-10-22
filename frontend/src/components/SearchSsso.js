import React, { useEffect, useState } from 'react';
import Grid from '@material-ui/core/Grid';
import { Card, CardContent, CardHeader } from '@material-ui/core';
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
  }
}));


export default function SearchSsso({ setTitle }) {

  const [tableData, setTableData] = useState([{}]);
  const [tablePage] = useState(1);
  const [tablePageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const classes = useStyles();

  useEffect(() => {
    setTitle("Search SSSO");
    loadTableData();
  }, []);

  const loadTableData = (event) => {
    let page = typeof event === 'undefined' ? tablePage : event.currentPage + 1;
    let pageSize = typeof event === 'undefined' ? tablePageSize : event.pageSize;
    let searchValue = typeof event === 'undefined' ? ' ' : event.searchValue;

   let filters =[];

    filters.push({
      property:'ccdnum__isnull',
      value: false,
    });

      getSkybotLists({page: page, pageSize: pageSize, search:searchValue, filters:filters}).then(res => {
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
    width: 150,
    align: 'center',
  },
  {
    name: 'decj2000',
    title: 'Dec (deg)',
    width: 130,
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
    width: 130,
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


    return (
      <Grid>

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
        </Grid>

        <Grid container spacing={6}>
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
        </Grid>

        <Grid container spacing={6}>
          <Grid item lg={12} xl={12}>
            <Card>
              <CardHeader
                title={"SkyBot Output"}
              />
              <Table
                data={tableData}
                columns={tableColumns}
                loadData={loadTableData}
                totalCount = {totalCount}
                hasToolbar={true}
              >
              </Table>
            </Card>
          </Grid>
        </Grid>

      </Grid>



    );

  }
