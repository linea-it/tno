import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import { makeStyles } from '@material-ui/core/styles';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Button from '@material-ui/core/Button';
import clsx from 'clsx';
import Grid from '@material-ui/core/Grid';
import CustomTable from './utils/CustomTable';
import { getOrbitRuns, createOrbitRun } from '../api/Orbit';
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

function RefineOrbit({ history, setTitle }) {
  const classes = useStyles();
  const columns = [
    {
      name: 'status',
      title: 'Status',
      width: 140,
      sortingEnabled: false,
      customElement: (row) => {
        if (row.status === 'failure') {
          return (
            <span
              className={clsx(classes.btn, classes.btnFailure)}
              title={row.error_msg}
            >
              Failure
            </span>
          );
        } if (row.status === 'running') {
          return (
            <span
              className={clsx(classes.btn, classes.btnRunning)}
              title={row.status}
            >
              Running
            </span>
          );
        } if (row.status === 'not_executed') {
          return (
            <span
              className={clsx(classes.btn, classes.btnNotExecuted)}
              title={row.error_msg}
            >
              Not Executed
            </span>
          );
        } if (row.status === 'warning') {
          return (
            <span
              className={clsx(classes.btn, classes.btnWarning)}
              title={row.error_msg ? row.error_msg : 'Warning'}
            >
              Warning
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
      width: 180,
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
    },
    {
      name: 'h_time',
      title: 'Start',
      width: 140,
    },
    {
      name: 'h_execution_time',
      title: 'Execution Time',
      width: 140,
    },
    {
      name: 'count_objects',
      title: 'Asteroids',
      width: 90,
      align: 'center',
    },
    {
      name: 'id',
      title: ' ',
      width: 100,
      icon: <i className={clsx(`fas fa-info-circle ${classes.iconDetail}`)} />,
      action: (el) => history.push(`/refine-orbit/${el.id}`),
      align: 'center',
    },
  ];
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

  const loadTableData = async ({
    sorting, pageSize, currentPage, filter, searchValue,
  }) => {
    const ordering = sorting[0].direction === 'desc' ? `-${sorting[0].columnName}` : sorting[0].columnName;
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

  const handleSelect = (e) => setSelect(e.target.value);

  const handleSubmit = () => {
    createOrbitRun({
      input_list: select.input_list,
      proccess: select.proccess,
    })
      .then(() => setReload(!reload))
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <>
      <Grid
        container
        direction="row"
        spacing={2}
      >
        <Grid item xs={12} md={4} fullWidth className={classes.gridWrapper}>
          <Card>
            <CardHeader
              title={<span>Execute</span>}
            />
            <CardContent>
              <form autoComplete="off">
                <FormControl fullWidth>
                  <InputLabel htmlFor="input">Input</InputLabel>
                  <Select
                    value={select}
                    onChange={handleSelect}
                  >
                    {inputData.map((input) => (
                      <MenuItem key={input.id} value={input} item={input}>{input.proccess_displayname}</MenuItem>
                    ))}
                  </Select>
                  <Button variant="contained" color="primary" className={classes.button} onClick={handleSubmit}>Submit</Button>
                </FormControl>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid
        container
        direction="row"
        spacing={2}
      >
        <Grid xs={12} className={clsx(classes.block, classes.tableWrapper)}>
          <Card>
            <CardHeader
              title={<span>History</span>}
            />
            <CardContent>
              <CustomTable
                columns={columns}
                data={tableData}
                loadData={loadTableData}
                pageSizes={pageSizes}
                totalCount={totalCount}
                defaultSorting={[{ columnName: 'start_time', direction: 'desc' }]}
                reload={reload}
                hasSearching={false}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}

RefineOrbit.propTypes = {
  history: PropTypes.objectOf(PropTypes.object).isRequired,
  setTitle: PropTypes.func.isRequired,
};

export default withRouter(RefineOrbit);
