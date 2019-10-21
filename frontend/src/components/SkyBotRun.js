import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  makeStyles,
} from '@material-ui/core';
import Button from '@material-ui/core/Button';
import MenuItem from '@material-ui/core/MenuItem';
import Label from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl';
import Dialog from '@material-ui/core/Dialog';
import Paper from '@material-ui/core/Paper';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { createSkybotRun, getSkybotRunList } from '../api/SkyBotRun';
import Table from './utils/CustomTable';

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectRun: {
    minWidth: 300,
  },
  typography: {
    marginBottom: 15,
  },
  runButton: {
    marginTop: theme.spacing(3),
    width: '30%',
    marginLeft: '70%',
  },
  dialogHeader: {
    width: 600,
  },
  initialDate: {
    width: '40%',
    marginRight: 50,
  },
  finalDate: {
    width: '40%',
  },
  dialogButton: {
    marginRight: '4%',
    marginBottom: '2%',
    float: 'right',
    width: '15%',
  },
  initialDate: {
    marginTop: 50,
    marginRight: 20,
    marginBottom: 20,
    marginLeft: 20,
    float: 'left',
  },
  finalDate: {
    marginTop: 50,
    marginRight: 20,
    marginBottom: 20,
    marginLeft: 20,
    float: 'right',
  }
}));

function SkyBotRun({ setTitle }) {

  useEffect(() => {
    setTitle("SkyBot Run");
  }, []);

  const [selectRunValue, setSelectRunValue] = useState('period');
  const [initialDate, setInitialDate] = useState(new Date());
  const [finalDate, setFinalDate] = useState(new Date());
  const [controlSubmit, setControlSubmit] = useState(false);
  const [tablePage, setTablePage] = useState(1);
  const [first, setFirst] = useState(0);
  const [tablePageSize, setTablePageSize] = useState(10);
  const [totalSize, setTotalSize] = useState(0);
  const [sortField, setSortField] = useState('start');
  const [sortOrder, setOrder] = useState(0);
  const [totalCount, setTotalCount] = useState(null);
  const [tableData, setTableData] = useState([]);

  const pageSizes = [5, 10, 15];


  const [dialog, setDialog] = useState({
    visible: false,
    content: " ",
    title: " ",
  });

  const classes = useStyles();

  const handleSelectRunChange = event => {
    setSelectRunValue(event.target.value);
  };

  const loadMenuItems = () => {
    const options = [
      { title: "All Pointings", value: "all" },
      { title: "By Period", value: "period" },
    ];

    return options.map((el, i) => (
      <MenuItem
        key={i}
        value={el.value}
        title={el.title}
      >
        {el.title}
      </MenuItem>
    ));
  };

  const handleSubmit = () => {
    createSkybotRun(
      {
        type_run: selectRunValue,
        date_initial: initialDate,
        date_final: finalDate,
      }
    ).then((res) => {
      console.log(res);
    }).catch((error) => {
      console.log("Catch: ", error);
    });
  };


  // useEffect(() => {
  //   getSkybotRunList(
  //     {
  //       page: tablePage,
  //       pageSize: tablePageSize,
  //       sortField: sortField,
  //       sortOrder: sortOrder,
  //     }
  //   )
  //     .then(res => {
  //       console.log(res.data);
  //       const data = res.data;
  //       setTableData(data.results);
  //       setTotalSize(data.count);
  //     });
  // }, []);


  useEffect(() => {
    loadData();
  }, []);


  useEffect(() => {

    if (controlSubmit) {
      handleSubmit();
    }

  }, [controlSubmit]);

  const handleAllPointings = () => {
    setSelectRunValue("all");
    setInitialDate('');
    setFinalDate('');
    setControlSubmit(true);

    handleSubmit();
  };

  const handleByPeriod = () => {
    setDialog({ visible: true })
  };

  const handleDialogSubmit = () => {
    setDialog({ visible: false });
    handleSubmit();
  }

  const loadDialogContent = () => {
    return (
      <Grid container justify="space-around">
        <Paper>
          <MuiPickersUtilsProvider utils={DateFnsUtils} >
            <KeyboardDatePicker
              className={classes.initialDate}
              variant="inline"
              format={"yyyy/MM/dd"}
              id="date-picker-inline"
              label={"Initial Date"}
              value={initialDate}
              onChange={(date) => setInitialDate(date)}
            />
            <KeyboardDatePicker
              className={classes.finalDate}
              variant="inline"
              format={"yyyy/MM/dd"}
              id="date-picker-inline"
              label={"Final Date"}
              value={finalDate}
              onChange={(date) => setFinalDate(date)}
            />
          </MuiPickersUtilsProvider >
          <Button
            className={classes.dialogButton}
            variant="contained"
            color="primary"
            onClick={handleDialogSubmit}
          >
            Ok
          </Button>
        </Paper>
      </Grid>
    )
  };

  const handleSelectRunClick = () => {
    switch (selectRunValue) {
      case "all":
        handleAllPointings();
        break;
      case "period":
        handleByPeriod();
        break;
    }
  };

  const tableColumns = [
    { name: 'status', title: 'Status', width: 100, align: 'center' },
    { name: 'owner', title: 'Owner', width: 100, align: 'left' },
    { name: 'h_execution_time', title: 'Execution Time', width: 150, align: 'cemter' },
    { name: 'start', title: 'Start', width: 150, align: 'center' },
    { name: 'type_run', title: 'Type', width: 120, align: 'cemter' },
    { name: 'rows', title: 'Rows', width: 100, align: 'cemter' },
    { name: 'exposure', title: 'Pointings', width: 100, align: 'cemter' },

  ]

  const loadData = (event) => {

    // console.log("evento: ", event);

    let page = typeof event === 'undefined' ? tablePage : event.currentPage + 1;
    const pageSize = typeof event === 'undefined' ? tablePageSize : event.pageSize;


    getSkybotRunList(page, pageSize, sortField, sortOrder)
      .then(res => {
        console.log("Load Data: ", res.data);
        const data = res.data;
        setTableData(data.results);
        setTotalCount(data.count);
      });

  };


  return (
    <Grid>
      <Grid container spacing={6}>
        <Grid item lg={5} xl={3}>
          <Card>
            <CardHeader
              title="SkyBot Run"
            />
            <CardContent>
              <Typography className={classes.typography}>Updates the SkyBot output table.</Typography>
              <FormControl className={classes.formControl}>
                <Label htmlFor='select_run'>Select the type of update</Label>
                <Select
                  className={classes.selectRun}
                  value={selectRunValue}
                  inputProps={{
                    name: 'select_run',
                    id: 'select_run',
                  }}
                  onChange={handleSelectRunChange}
                >
                  {loadMenuItems()}
                </Select>
                <Button
                  variant="contained"
                  color="primary"
                  className={classes.runButton}
                  onClick={handleSelectRunClick}
                >
                  Run
                  </Button>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Grid container spacing={6}>
        <Grid item lg={12} xl={12}>
          <Card>
            <CardHeader
              title="History"
            />
            <CardContent>
              <Table
                columns={tableColumns}
                data={tableData}
                loadData={loadData}
                pageSizes={pageSizes}
                defaultSorting={[{ columnName: 'start_time', direction: 'desc' }]}
                hasSearching={false}
                hasPagination={true}
                hasColumnVisibility={false}
                reload={true}
                totalCount={totalSize}
              >
              </Table>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Dialog
        open={dialog.visible}
        onClose={() => setDialog({ visible: false, content: " ", title: " " })}
      >
        {loadDialogContent()}
      </Dialog>
    </Grid>
  );
};
export default withRouter(SkyBotRun);
