import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { withRouter } from 'react-router-dom';
import { makeStyles } from '@material-ui/styles';
import Icon from '@material-ui/core/Icon';
import moment from 'moment';
import Table from './utils/CustomTable';
import { getPraiaRuns } from '../api/Praia';

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
  btnRunning: {
    backgroundColor: '#ffba01',
    color: '#000',
  },
  btnWarning: {
    backgroundColor: '#D79F15',
    color: '#FFF',
  },
  iconDetail: {
    fontSize: 18,
  },
  tableWrapper: {
    maxWidth: '100%',
  },
  btnFailure: {
    backgroundColor: '#ff1a1a',
    color: '#fff',
  },
  btnNotExecuted: {
    backgroundColor: '#ABA6A2',
    color: '#fff',
  },

}));


function AstrometryHistory({ history, reloadHistory }) {
  const classes = useStyles();

  const [tableData, setTableData] = useState([]);
  const [tablePage, setTablePage] = useState(1);
  const [tablePageSize, setPageSize] = useState(5);
  const [totalCount, setTotalCount] = useState();
  const [reload, setReload] = useState(true);
  const [loading, setLoading] = useState(true);

  const pageSizes = [5, 10, 15];

  const loadData = (event) => {
    setLoading(true);
    const page = typeof event === 'undefined' ? tablePage : event.currentPage + 1;
    const pageSize = typeof event === 'undefined' ? tablePageSize : event.pageSize;
    const searchValue = typeof event === 'undefined' ? ' ' : event.searchValue;

    getPraiaRuns({ page, pageSize, search: searchValue }).then((res) => {
      setTableData(res.results);
      setTotalCount(res.count);
      setLoading(false);
    }).catch((err) => {
      console.error(err);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleClickHistoryTable = (row) => {
    history.push(`/astrometry/${row.id}`);
  };

  const columns = [
    {
      name: 'id',
      title: 'Details',
      width: 100,
      icon: <Icon className={clsx(`fas fa-info-circle ${classes.iconDetail}`)} />,
      action: handleClickHistoryTable,
      align: 'center',
    },
    {
      name: 'status',
      title: 'Status',
      width: 150,
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
      name: 'proccess_displayname',
      title: 'Process',
      width: 200,
      align: 'left',
    },
    {
      name: 'owner',
      title: 'Owner',
      width: 150,
      align: 'left',
    },
    {
      name: 'input_list',
      title: 'Input',
      width: 100,
      align: 'center',
    },
    {
      name: 'configuration',
      title: 'Configuration',
      width: 150,
      align: 'center',
    },
    {
      name: 'start_time',
      title: 'Date',
      width: 180,
      align: 'center',
    },
    {
      name: 'h_time',
      title: 'Start',
      width: 150,
      align: 'center',
    },
    {
      name: 'execution_time',
      title: 'Execution Time',
      width: 180,
      customElement: (row) => (
        <span>
          {row.execution_time && typeof row.execution_time === 'string' ? row.execution_time.substring(0, 8) : ''}
        </span>
      ),
      align: 'center',
    },
    {
      name: 'count_objects',
      title: 'Asteroids',
      width: 100,
      align: 'center',
    },
   ];

  return (
    <div>
      <Table
        data={tableData}
        columns={columns}
        pageSizes={pageSizes}
        defaultSorting={[{ columnName: 'start_time', direction: 'desc' }]}
        loadData={loadData}
        totalCount={totalCount}
        reload={reload}
        hasSearching={false}
        hasColumnVisibility={false}
        loading={loading}
      />
    </div>
  );
}

export default withRouter(AstrometryHistory);
