import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { withRouter } from 'react-router-dom';
import { makeStyles } from '@material-ui/styles';
import Icon from '@material-ui/core/Icon';
import PropTypes from 'prop-types';
import moment from 'moment';
import Table from './utils/CustomTable';
import { getPraiaRuns } from '../api/Praia';
import CustomColumnStatus from './utils/CustomColumnStatus';

const useStyles = makeStyles((theme) => ({
  iconList: {
    fontSize: 24,
    cursor: 'pointer',
  },
  button: {
    marginTop: theme.spacing(2),
  },
}));

function AstrometryHistory({ history }) {
  const classes = useStyles();

  const [tableData, setTableData] = useState([]);
  const [tablePage, setTablePage] = useState(1);
  const [tablePageSize, setPageSize] = useState(30);
  const [totalCount, setTotalCount] = useState();
  const [reload, setReload] = useState(true);
  const [loading, setLoading] = useState(true);

  const pageSizes = [5, 10, 15, 30, 50];

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
      customElement: (row) => <CustomColumnStatus status={row.status} title={row.error_msg} />,
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
      align: 'right',
    },
    {
      name: 'configuration',
      title: 'Configuration',
      width: 150,
      align: 'right',
    },
    {
      name: 'start_time',
      title: 'Date',
      width: 180,
      customElement: (row) => (
        <span>
          {row.start_time ? moment(row.start_time).format('YYYY-MM-DD HH:mm:ss') : ''}
        </span>
      ),
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
      title: 'Exec Time',
      headerTooltip: 'Execution time',
      width: 100,
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
      align: 'right',
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

AstrometryHistory.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};

export default withRouter(AstrometryHistory);
