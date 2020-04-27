import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import {
  CardHeader,
  Card,
  CardContent,
  FormControl,
  MenuItem,
  Select,
  InputLabel,
  Button,
  Icon,
  Grid,
} from '@material-ui/core';
import Table from '../../components/Table';
import ColumnStatus from '../../components/Table/ColumnStatus';
import { getPraiaRuns } from '../../services/api/Praia';
import { getOrbitRuns, createOrbitRun } from '../../services/api/Orbit';
import '@fortawesome/fontawesome-free/css/all.min.css';

function useInterval(callback, delay) {
  const savedCallback = useRef();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  // eslint-disable-next-line consistent-return
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}
function RefineOrbit({ history, setTitle }) {
  const [tableData, setTableData] = useState([]);
  const [inputData, setInputData] = useState([]);
  const pageSizes = [5, 10, 15];
  const [select, setSelect] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [reload, setReload] = useState(true);

  const loadExecuteData = () => {
    getPraiaRuns({
      ordering: '-start_time',
      filters: [
        {
          property: 'status',
          value: 'success',
        },
      ],
    }).then((res) => {
      setInputData(res.results);
    });
  };

  useEffect(() => {
    setTitle('Refine Orbits');
    loadExecuteData();
  }, []);

  useInterval(() => {
    setReload(!reload);
  }, 30000);

  const loadTableData = async ({
    sorting,
    pageSize,
    currentPage,
    filter,
    searchValue,
  }) => {
    const ordering =
      sorting[0].direction === 'desc'
        ? `-${sorting[0].columnName}`
        : sorting[0].columnName;
    const orbits = await getOrbitRuns({
      ordering,
      pageSize,
      page: currentPage !== 0 ? currentPage + 1 : 1,
      filter,
      search: searchValue,
    });

    if (orbits && orbits.results) {
      setTableData(orbits.results);
      setTotalCount(orbits.count);
    }
  };

  const columns = [
    {
      name: 'id',
      title: 'Details',
      width: 100,
      icon: <Icon className="fas fa-info-circle" />,
      action: (el) => history.push(`/refine-orbit/${el.id}`),
      align: 'center',
      sortingEnabled: false,
    },
    {
      name: 'status',
      title: 'Status',
      width: 140,
      customElement: (row) => (
        <ColumnStatus status={row.status} title={row.error_msg} />
      ),
    },
    {
      name: 'proccess_displayname',
      title: 'Process',
      width: 180,
      sortingEnabled: false,
    },
    {
      name: 'owner',
      title: 'Owner',
      width: 140,
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
      width: 140,
    },
    {
      name: 'execution_time',
      title: 'Exec Time',
      headerTooltip: 'Execution time',
      align: 'center',
      customElement: (row) => (
        <span>
          {row.execution_time && typeof row.execution_time === 'string'
            ? row.execution_time.substring(0, 8)
            : ''}
        </span>
      ),
      width: 140,
    },
    {
      name: 'count_objects',
      title: 'Asteroids',
      width: 90,
      align: 'right',
    },
  ];

  const handleSelect = (e) => setSelect(e.target.value);

  const handleSubmit = () => {
    createOrbitRun({
      input_list: select.input_list,
      proccess: select.proccess,
    }).then(() => setReload(!reload));
    // TODO: Notify the user when it's done.
  };

  return (
    <Grid container direction="row">
      <Grid item xs={12} md={4}>
        <Card>
          <CardHeader title={<span>Execute</span>} />
          <CardContent>
            <form autoComplete="off">
              <FormControl fullWidth>
                <InputLabel htmlFor="input">Input</InputLabel>
                <Select value={select} onChange={handleSelect}>
                  {inputData.map((input) => (
                    <MenuItem key={input.id} value={input} item={input}>
                      {input.proccess_displayname}
                    </MenuItem>
                  ))}
                </Select>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmit}
                >
                  Submit
                </Button>
              </FormControl>
            </form>
          </CardContent>
        </Card>
      </Grid>
      <Grid>
        <Card>
          <CardHeader title={<span>History</span>} />
          <CardContent>
            <Table
              columns={columns}
              data={tableData}
              loadData={loadTableData}
              pageSizes={pageSizes}
              totalCount={totalCount}
              defaultSorting={[{ columnName: 'start_time', direction: 'desc' }]}
              reload={reload}
              hasSearching={false}
              loading
            />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

RefineOrbit.propTypes = {
  history: PropTypes.objectOf(PropTypes.object).isRequired,
  setTitle: PropTypes.func.isRequired,
};

export default withRouter(RefineOrbit);
