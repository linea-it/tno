import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import clsx from 'clsx';
import {
  Card, CardHeader, CardContent, Typography, makeStyles, CircularProgress, TextareaAutosize,
} from '@material-ui/core';
import Button from '@material-ui/core/Button';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl';
import Interval from 'react-interval';
import { createSkybotRun, getSkybotRunList } from '../api/Skybot';
import Table from './utils/CustomTable';
import ToolTip from '@material-ui/core/Tooltip';
import DatePicker from 'react-date-picker';
import Label from '@material-ui/core/FormLabel';



const useStyles = makeStyles((theme) => ({
  typography: {
    marginBottom: 15,
  },
  runButton: {
    marginTop: theme.spacing(10),
    width: '30%',
    marginLeft: '70%',
  },
  initialDatePicker: {
    position: "absolute",
    zIndex: 2,
    marginTop: 70,
  },

  finalDatePicker: {
    position: "absolute",
    zIndex: 2,
    marginTop: 70,
    marginLeft: 220,
  },

  initialDateLabel: {
    marginTop: 20
  },
  finalDateLabel: {
    marginTop: 20,
    marginLeft: 145
  },

  filtersContainer: {
    display: 'flex',
    flexWrap: 'wrap',
  },

  dialogButton: {
    marginRight: '4%',
    marginBottom: '2%',
    float: 'right',
    width: '15%',
  },
  initialDate: {
    marginTop: 30,
  },
  finalDate: {
    marginTop: 30,
    marginLeft: "5%",
  },
  progress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
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
  display: {
    position: "absolute",
    top: 2,
    left: 0,
    bottom: 2,
    background: "white",
    pointerEvents: "none",
    right: 50,
    display: "flex",
    alignItems: "center"
  },
  input: {},

}));


function Skybot({ setTitle, history }) {
  const [selectRunValue, setSelectRunValue] = useState('period');
  const [initialDate, setInitialDate] = useState(null);
  const [finalDate, setFinalDate] = useState(null);
  const [tablePage, setTablePage] = useState(1);
  const [tablePageSize, setTablePageSize] = useState(10);
  const [totalSize, setTotalSize] = useState(0);
  const [sortField] = useState('-start');
  const [sortOrder] = useState(0);
  const [tableData, setTableData] = useState([]);
  const pageSizes = [5, 10, 15];
  const [disabledRunButton, setDisabledRunButton] = useState(true);
  const [disabledDate, setDisabledDate] = useState(false);
  const [loading, setLoading] = useState(false);

  const classes = useStyles();

  useEffect(() => {
    setTitle('Skybot Run');
    loadData();
  }, []);

  useEffect(() => {

    if (initialDate && finalDate) {
      setDisabledRunButton(false);
    }

    if (!initialDate || initialDate === "") {
      setDisabledRunButton(true);
    }

    if (!finalDate || finalDate === "") {
      setDisabledRunButton(true);
    }
  }, [initialDate, finalDate]);


  useEffect(() => {
    if (selectRunValue === "all") {
      setDisabledDate(true);
      setDisabledRunButton(false);
    }

    if (selectRunValue === "period") {
      setDisabledDate(false);
      setDisabledRunButton(true);
      setInitialDate(null);
      setFinalDate(null);
    }
  }, [selectRunValue]);

  const loadData = (event) => {
    let page = null;
    let pageSize = null;

    if (event) {
      page = event.currentPage + 1;
      pageSize = event.pageSize;
      setTablePage(page);
      setTablePageSize(event.pageSize);
    } else {
      page = tablePage;
      pageSize = tablePageSize;
    }

    getSkybotRunList({
      page, pageSize, sortField, sortOrder,
    })
      .then((res) => {
        const { data } = res;
        setTableData(data.results);
        setTotalSize(data.count);
        setLoading(false);
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
      setInitialDate(null);
      setFinalDate(null);
      loadData();
    });
  };

  const handleSelectRunClick = () => {
    switch (selectRunValue) {
      case 'all':
        setSelectRunValue('all');
        setInitialDate('');
        setFinalDate('');
        setLoading(true);
        handleSubmit();
        break;
      case 'period':
        setDisabledRunButton(true);
        setLoading(true);
        handleSubmit();
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
      customElement: (row) => <span>{row.execution_time && typeof row.execution_time === "string" ? row.execution_time.substring(0, 8) : ""}</span>,
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
      name: 'execution_time', title: 'Execution Time', width: 150, align: 'center',
      customElement: (row) => {

        return <span>{row.execution_time && typeof row.execution_time === "string" ? row.execution_time.substring(0, 8) : ""}</span>
      }
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
        <Grid item lg={7} xl={5}>
          <Card>
            <CardHeader
              title="SkyBot Run"
            />
            <CardContent>
              <Typography className={classes.typography}>Updates the SkyBot output table.</Typography>

              <form className={classes.filtersContainer} noValidate autoComplete="off">

                <FormControl fullWidth>
                  <ToolTip title={"Select the type of update"}>
                    <Select
                      helperText={"Select the type of update"}
                      className={classes.select}
                      value={selectRunValue}
                      onChange={(event) => {
                        setSelectRunValue(event.target.value);
                      }}
                    >
                      {loadMenuItems()}
                    </Select>
                  </ToolTip>
                </FormControl>

                <span className={classes.initialDateLabel}><Label >Initial Date</Label></span>
                <DatePicker
                  locale='en'
                  className={classes.initialDatePicker}
                  disabled={disabledDate}
                  value={initialDate}
                  onChange={(date) => setInitialDate(date)}
                  format={"y/MM/dd"}
                />

                <span className={classes.finalDateLabel}><Label >Final Date</Label></span>
                <DatePicker
                  locale='en'
                  className={classes.finalDatePicker}
                  disabled={disabledDate}
                  value={finalDate}
                  onChange={(date) => setFinalDate(date)}
                  format={"y/MM/dd"}
                />

                <Button
                  variant="contained"
                  color="primary"
                  className={classes.runButton}
                  disabled={disabledRunButton}
                  onClick={handleSelectRunClick}
                >
                  Run
                  {loading ?
                    <CircularProgress
                      color="primary"
                      className={classes.progress}
                      size={24}
                    />
                    :
                    null
                  }
                </Button>

              </form>
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
    </Grid >
  );
}
export default withRouter(Skybot);
