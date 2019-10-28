import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import clsx from 'clsx';
import {
  Card, CardHeader, CardContent, Typography, makeStyles,
} from '@material-ui/core';
import Button from '@material-ui/core/Button';
import MenuItem from '@material-ui/core/MenuItem';
import Label from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl';
import Dialog from '@material-ui/core/Dialog';
import Paper from '@material-ui/core/Paper';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import Interval from 'react-interval';
import { createSkybotRun, getSkybotRunList } from '../api/Skybot';
import Table from './utils/CustomTable';

const useStyles = makeStyles((theme) => ({
  typography: {
    marginBottom: 15,
  },
  runButton: {
    marginTop: theme.spacing(3),
    width: '30%',
    marginLeft: '70%',
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
  },
  iconDetail: {
    fontSize: 18,
  },
  btn: {
    textTransform: 'none',
    padding: '1px 5px',
    width: '7em',
    minHeight: '1em',
    display: 'block',
    textAlign: 'center',
    lineHeight: '2',
    boxShadow: `0px 1px 5px 0px rgba(0, 0, 0, 0.2),
    0px 2px 2px 0px rgba(0, 0, 0, 0.14),
    0px 3px 1px -2px rgba(0, 0, 0, 0.12)`,
    borderRadius: '4px',
    boxSizing: 'border-box',
  },
  btnWarning: {
    backgroundColor: '#D79F15',
    color: '#FFF',
  },
  btnSuccess: {
    backgroundColor: 'green',
    color: '#fff',
  },
  btnFailure: {
    backgroundColor: '#ff1a1a',
    color: '#fff',
  },
  btnNotExecuted: {
    backgroundColor: '#ABA6A2',
    color: '#fff',
  },
  btnRunning: {
    backgroundColor: '#ffba01',
    color: '#000',
  },
}));

function Skybot({ setTitle, history }) {
  const [selectRunValue, setSelectRunValue] = useState('period');
  const [initialDate, setInitialDate] = useState(new Date());
  const [finalDate, setFinalDate] = useState(new Date());
  const [controlSubmit, setControlSubmit] = useState(false);
  const [tablePage] = useState(1);
  const [tablePageSize] = useState(10);
  const [totalSize, setTotalSize] = useState(0);
  const [sortField] = useState('-start');
  const [sortOrder] = useState(0);
  const [tableData, setTableData] = useState([]);
  const pageSizes = [5, 10, 15];
  const [dialog, setDialog] = useState({
    visible: false,
    content: ' ',
    title: ' ',
  });

  const classes = useStyles();


  useEffect(() => {
    setTitle('Skybot Run');
    loadData();
  }, []);

  useEffect(() => {
    if (controlSubmit) {
      handleSubmit();
    }
  }, [controlSubmit]);

  const loadData = (event) => {
    const page = typeof event === 'undefined' ? tablePage : event.currentPage + 1;
    const pageSize = typeof event === 'undefined' ? tablePageSize : event.pageSize;

    getSkybotRunList({
      page, pageSize, sortField, sortOrder,
    })
      .then((res) => {
        const { data } = res;
        setTableData(data.results);
        setTotalSize(data.count);
      });
  };

  const handleSubmit = () => {
    createSkybotRun(
      {
        type_run: selectRunValue,
        date_initial: initialDate,
        date_final: finalDate,
      },
    ).then(() => {
      loadData();
    });
  };

  const handleAllPointings = () => {
    setSelectRunValue('all');
    setInitialDate('');
    setFinalDate('');
    setControlSubmit(true);
    handleSubmit();
  };

  const handleByPeriod = () => {
    setInitialDate(new Date());
    setFinalDate(new Date());
    setDialog({ visible: true });
  };

  const handleDialogSubmit = () => {
    setDialog({ visible: false });
    handleSubmit();
  };

  const loadDialogContent = () => (
    <Grid container justify="space-around">
      <Paper>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <KeyboardDatePicker
            className={classes.initialDate}
            variant="inline"
            format="yyyy/MM/dd"
            id="date-picker-inline"
            label="Initial Date"
            value={initialDate}
            onChange={(date) => setInitialDate(date)}
          />
          <KeyboardDatePicker
            className={classes.finalDate}
            variant="inline"
            format="yyyy/MM/dd"
            id="date-picker-inline"
            label="Final Date"
            value={finalDate}
            onChange={(date) => setFinalDate(date)}
          />
        </MuiPickersUtilsProvider>
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
  );

  const handleSelectRunClick = () => {
    switch (selectRunValue) {
      case 'all':
        handleAllPointings();
        break;
      case 'period':
        handleByPeriod();
        break;
    }
  };


  const loadMenuItems = () => {
    const options = [
      { title: 'All Pointings', value: 'all' },
      { title: 'By Period', value: 'period' },
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


  const tableColumns = [
    {
      name: 'status',
      title: 'Status',
      width: 140,
      align: 'center',
      customElement: (row) => {
        if (row.status === 'running') {
          return (
            <span
              className={clsx(classes.btn, classes.btnRunning)}
              title={row.status}
            >
              {' '}
Running

            </span>
          );
        }
        if (row.status === 'warning') {
          return (
            <span
              className={clsx(classes.btn, classes.btnWarning)}
              title={row.status}
            >
Warning

            </span>
          );
        }
        if (row.status === 'failure') {
          return (
            <span
              className={clsx(classes.btn, classes.btnFailure)}
              title={row.status}
            >
Failure

            </span>
          );
        }
        if (row.status === 'not_executed') {
          return (
            <span
              className={clsx(classes.btn, classes.btnNotExecuted)}
              title={row.status}
            >
Not Executed

            </span>
          );
        }
        return (
          <span
            className={clsx(classes.btn, classes.btnSuccess)}
            title={row.status}
          >
Success

          </span>
        );
      },
    },
    {
      name: 'owner', title: 'Owner', width: 140, align: 'left',
    },
    {
      name: 'execution_time',
      title: 'Execution Time',
      width: 150,
      align: 'center',
      customElement: (row) => <span>{row.execution_time.substring(0, 8)}</span>,
    },
    {
      name: 'start', title: 'Start', width: 200, align: 'center',
    },
    {
      name: 'type_run', title: 'Type', width: 120, align: 'center',
    },
    {
      name: 'rows', title: 'Rows', width: 100, align: 'center',
    },
    {
      name: 'exposure', title: 'Pointings', width: 100, align: 'center',
    },
    {
      name: 'id',
      title: ' ',
      width: 100,
      icon: <i className={clsx(`fas fa-info-circle ${classes.iconDetail}`)} />,
      action: (row) => history.push(`/skybot/${row.id}`),
      align: 'center',
    },
  ];

  return (
    <Grid>
      <Interval
        enabled
        timeout={10000}
        callback={loadData}
      />
      <Grid container spacing={6}>
        <Grid item lg={5} xl={3}>
          <Card>
            <CardHeader
              title="SkyBot Run"
            />
            <CardContent>
              <Typography className={classes.typography}>Updates the SkyBot output table.</Typography>
              <FormControl fullWidth>
                <Label>Select the type of update</Label>
                <Select
                  value={selectRunValue}
                  onChange={(event) => {
                    setSelectRunValue(event.target.value);
                  }}
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
                hasSearching={false}
                hasPagination
                hasColumnVisibility={false}
                hasToolbar={false}
                reload
                totalCount={totalSize}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Dialog
        open={dialog.visible}
        onClose={() => setDialog({ visible: false, content: ' ', title: ' ' })}
      >
        {loadDialogContent()}
      </Dialog>
    </Grid>
  );
}
export default withRouter(Skybot);
