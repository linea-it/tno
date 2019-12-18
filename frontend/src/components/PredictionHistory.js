import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import Table from './utils/CustomTable';
import { getPredictionRuns } from '../api/Prediction';

const useStyles = makeStyles((theme) => ({
  iconList: {
    fontSize: 24,
    cursor: 'pointer',
  },
  button: {
    marginTop: theme.spacing(2),
  },
  btn: {
    textTransform: 'none',
    padding: '1px 5px',
    width: '5em',
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
  btnRunning: {
    backgroundColor: '#ffba01',
    color: '#000',
  },
  input: {
    margin: 0,
  },
  gridWrapper: {
    marginBottom: theme.spacing(3),
  },
  iconDetail: {
    fontSize: 18,
  },
  tableWrapper: {
    maxWidth: '100%',
  },
}));

function PredictionHistory() {
  const classes = useStyles();
  const [tableValues, setTablevalues] = useState({
    page: 1,
    sizePerPage: 100,
    data: null,
    totalSize: null,
    loading: false,
    sortField: null,
    sortOrder: null,
  });

  const loadData = (page, sizePerPage) => {
    getPredictionRuns({
      page: page,
      sizePerPage: sizePerPage
    }).then((res) => {
      setTablevalues({
        data: res.results,
        totalSize: res.count,
        loading: false,
      }
      );
    });
  };

  useEffect(() => {
    loadData(tableValues.page, tableValues.sizePerPage);
  }, []);

  //Columns of the table HISTORY
  const tableColumns = [
    {
      name: "status",
      title: "Status",

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
    { name: "process_displayname", title: "Process" },
    { name: "owner", title: "Owner" },
    { name: "start_time", title: "Date" },
    { name: "h_time", title: "Start" },
    { name: "h_execution_time", title: "Execution Time" },
    { name: "count_objects", title: "Asteroids" },
  ];

  return (
    <div>
      <Table
        data={tableValues.data ? tableValues.data : []}
        columns={tableColumns}  >
      </Table>
    </div>
  );
}

export default (PredictionHistory);
