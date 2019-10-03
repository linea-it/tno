import React, { useEffect, useLayoutEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { Grid, Card, CardHeader, makeStyles } from '@material-ui/core';
import ListStat from './utils/CustomList';
import { Donut } from './utils/CustomChart';
import Table from './utils/CustomTable';
import { readCondorFile, getPraiaRunById, getExecutionTimeById, getAsteroidStatus, getAsteroids } from '../api/Praia';
import clsx from 'clsx';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import ListIcon from '@material-ui/icons/List';
import BugIcon from '@material-ui/icons/BugReport';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import DescriptionIcon from '@material-ui/icons/Description';
import SearchIcon from '@material-ui/icons/Search';
import Dialog from './utils/CustomDialog';

const useStyles = makeStyles((theme) => ({
  card: {
    marginBottom: 10,
  },
  icon: {
    marginLeft: '92%',
  },

  dialogBodyStyle: {
    border: 'none',
    height: 600,
    width: 600,
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
  btnSuccess: {
    backgroundColor: 'green',
    color: '#fff',
  },
  btnFailure: {
    backgroundColor: 'red',
    color: '#fff',
  },
  btnRunning: {
    backgroundColor: '#ffba01',
    color: '#000',
  },
  btnNotExecuted: {
    backgroundColor: '#ABA6A2',
    color: '#fff',
  },
  btnWarning: {
    backgroundColor: '#D79F15',
    color: '#FFF',
  },

}));

function AstrometryRun({ setTitle, match: { params } }) {

  const classes = useStyles();

  const [list, setList] = useState([]);
  const [execution_time, setExecutionTime] = useState({});
  const [execution_stats, setExecutionStats] = useState({});
  const [tableData, setTableData] = useState();
  const [columnsAsteroidTable, setColumnsAsteroidTable] = useState();
  const [toolButton, setToolButton] = useState('list');
  const [dialog, setDialog] = useState({
    visible: false,
    content: " ",
    title: " ",
  });
  const [tableParams, setTableParams] = useState({
    page: 1,
    sizePerPage: 10,
    sortField: 'name',
    sortOrder: 1,
    pageSizes: [10, 20, 30],
    reload: true,
    totalCount: null,

  })

  const runId = params.id;

  const loadPraiaRun = () => {
    getPraiaRunById({ id: runId }).then((res) => {
      const data = res.data;
      setList([
        {
          title: 'Status',
          value: () => {
            if (data.status === 'failure') {
              return (
                <span
                  className={clsx(classes.btn, classes.btnFailure)}
                  title={data.error_msg}
                >
                  Failure
                </span>
              );
            }
            if (data.status === 'running') {
              return (
                <span
                  className={clsx(classes.btn, classes.btnRunning)}
                  title={data.error_msg}
                >
                  Running
                </span>
              );
            }
            if (data.status === 'not_executed') {
              return (
                <span
                  className={clsx(classes.btn, classes.btnNotExecuted)}
                  title={data.error_msg}
                >
                  Not Executed
                </span>
              );
            }
            if (data.status === 'warning') {
              return (
                <span
                  className={clsx(classes.btn, classes.btnWarning)}
                  title={data.error_msg}
                >
                  Warning
                </span>
              );
            }
            return (
              <span
                className={clsx(classes.btn, classes.btnSuccess)}
                title={data.status}
              >
                Success
              </span>
            );
          }
        },
        { title: "Process", value: data.id },
        { title: "Process Name", value: data.input_displayname },
        { title: "Owner", value: data.owner },
        { title: "Start", value: data.h_time },
        { title: "Execution", value: data.h_execution_time },
        { title: "Asteroids", value: data.count_objects },
        { title: "Reference Catalog", value: data.catalog_name },
      ]);
    });
  }

  const loadExecutionTime = () => {
    getExecutionTimeById({ id: params.id }).then((res) => {
      setExecutionTime(res.data.execution_time);
    });
  };

  const loadExecutionStatistics = () => {
    getAsteroidStatus({ id: params.id }).then((res) => {
      setExecutionStats(res.data.status);
    });
  };

  const loadTableData = (event) => {

    let page = event ? event.currentPage + 1 : tableParams.page;
    let sizePerPage = event ? event.pageSize : tableParams.sizePerPage;
    let sortField = tableParams.sortField;
    let sortOrder = tableParams.sortOrder;
    let filters = [];
    filters.push({
      property: 'astrometry_run',
      value: runId,
    });
    getAsteroids({ page, sizePerPage, filters, sortField, sortOrder }).then((res) => {
      setTableData(res.data.results);
      setTableParams({ ...tableParams, totalCount: res.data.count });
    });
  };

  const listColumnsTable = [
    {
      name: "status",
      title: "Status",
      align: 'center',
      width: 120,
      customElement: (row) => {
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
      }
    },
    {
      name: "name",
      title: "Name",
      align: 'center',
    },
    {
      name: "number",
      title: "Number",
      align: 'center',
      customElement: (row) => {
        if (row.number === '-') {
          return '';
        }
        return (
          <span>
            {row.number}
          </span>
        );
      }
    },
    {
      name: "ccd_images",
      title: "CCD Images",
      align: 'center',
      customElement: (row) => {
        if (row.ccd_images === '-') {
          return '';
        }
        return (
          <span>
            {row.ccd_images}
          </span>
        );
      }
    },
    {
      name: "available_ccd_image",
      title: "Available CCDs",
      width: 140,
      align: 'center',
    },
    {
      name: "processed_ccd_image",
      title: "Processed CCDs",
      width: 150,
      align: 'center',
    },
    { name: "catalog_rows", title: "Stars", align: 'center', },
    { name: "outputs", title: "Output Files", align: 'center', },
    {
      name: "execution_time",
      title: "Execution Time",
      customElement: (row) => {
        return (
          <span>
            {row.execution_time.substring(0, 8)}
          </span>
        );
      },
      width: 140,
      align: 'center',
    },
  ];

  const bugColumnsTable = [
    {
      name: "status",
      title: "Status",
      align: 'center',
      width: 120,
      customElement: (row) => {
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
      }
    },
    {
      name: "number",
      title: "Number",
      align: 'center',
      width: 120,
      customElement: (row) => {
        if (row.number === '-') {
          return '';
        }
        return (
          <span>
            {row.number}
          </span>
        );
      }
    },
    {
      name: "error_msg",
      title: "Error",
      width: 800,
      align: 'center',
    },
    {
      name: "condor_log",
      title: "Log",
      width: 60,
      align: 'center',
      customElement: (row) => {
        return (
          <IconButton onClick={() => handleLogReading(row.condor_log)}>
            <DescriptionIcon />
          </IconButton>

        );
      }
    },
    {
      name: "condor_err_log",
      title: "Error",
      width: 60,
      align: 'center',
      customElement: (row) => {
        return (
          <IconButton onClick={() => handleLogReading(row.condor_err_log)}>
            <DescriptionIcon />
          </IconButton>
        );
      }
    },
    {
      name: "condor_out_log",
      title: "Output",
      width: 80,
      align: 'center',
      customElement: (row) => {
        return (
          <IconButton onClick={() => handleLogReading(row.condor_out_log)}>
            <DescriptionIcon />
          </IconButton>
        );
      }
    },
    {
      name: "id",
      title: " ",
      width: 80,
      align: 'center',
      customElement: (row) => {
        return (
          <IconButton>
            <SearchIcon />
          </IconButton>
        );
      }
    },
  ];

  useLayoutEffect(() => {
    setTitle("Astrometry Run");
    loadTableData();
    loadPraiaRun();
    loadExecutionTime();
    loadExecutionStatistics();
  }, []);

  useEffect(() => {
    setColumnsAsteroidTable(listColumnsTable);
  }, []);

  const donutDataStatist = [
    { name: "Success", value: execution_stats.success },
    { name: "Warning", value: execution_stats.warning },
    { name: "Failure", value: execution_stats.failure },
    { name: "Not Executed", value: execution_stats.not_executed },
    { name: "Running/Idle", value: "0" },
  ];

  const donutDataExecutionTime = [
    { name: "Ccd Images", value: execution_time.ccd_images },
    { name: "Bsp_Jpl", value: execution_time.bsp_jpl },
    { name: "Catalog", value: execution_time.catalog },
    { name: "Astrometry", value: execution_time.astrometry },
  ];

  const handleChangeToolButton = (event, newValue) => {
    setToolButton(newValue);

  };

  const handleLogReading = (file) => {
    if (file) {
      let arrayLines = [];

      readCondorFile(file).then((res) => {
        let data = res.data.rows;
        data.forEach((line, idx) => {
          arrayLines.push(<div key={idx}>{line}</div>)
        });
        setDialog({ content: arrayLines, visible: true, title: file + " " });
      });

    }
  };

  return (
    <div>
      <Grid container spacing={6}>
        <Grid item xs={12} md={6} xl={4}>
          <Card>
            <CardHeader
              title={`Astrometry - ${runId} `}
            />
            <ListStat
              data={list}
            >
            </ListStat>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} xl={4}>
          <Card className={classes.card}>
            <CardHeader
              title={"Execution Statistics  "}
            />
            <Donut
              data={donutDataStatist}
            >
            </Donut>
          </Card>
        </Grid >

        <Grid item xs={12} md={6} xl={4}>
          <Card className={classes.card}>
            <CardHeader
              title={"Execution Time  "}
            />
            <Donut
              data={donutDataExecutionTime}
            >
            </Donut>
          </Card>
        </Grid >
      </Grid >

      <Grid container spacing={6}>
        <Grid item sm={12} xl={12}>
          <Card className={classes.card}>
            <CardHeader
              title={"Asteroids"}
            />
            <Toolbar >
              <ToggleButtonGroup className={classes.icon}
                value={toolButton}
                onChange={handleChangeToolButton}
                exclusive
              >
                <ToggleButton
                  value="list"
                  onClick={() => setColumnsAsteroidTable(listColumnsTable)}>
                  <ListIcon />
                </ToggleButton>
                <ToggleButton
                  value="bug"
                  onClick={() => setColumnsAsteroidTable(bugColumnsTable)}>
                  <BugIcon />
                </ToggleButton>
              </ToggleButtonGroup>
            </Toolbar>

            <Table
              data={tableData ? tableData : [{}]}
              columns={columnsAsteroidTable ? columnsAsteroidTable : listColumnsTable}
              hasSearching={false}
              loadData={loadTableData}
              totalCount={tableParams.totalCount}
              hasColumnVisibility={false}
              pageSizes={tableParams.pageSizes}
              reload={tableParams.reload}
              hasToolbar={false}
              hasResizing={false}
            >
            </Table>
            <Dialog
              visible={dialog.visible}
              title={dialog.title}
              content={dialog.content}
              setVisible={() => setDialog({ visible: false, content: " ", title: " " })}
              bodyStyle={classes.dialogBodyStyle}
            />
          </Card>
        </Grid>
      </Grid>
    </div >
  );
};

export default withRouter(AstrometryRun);

