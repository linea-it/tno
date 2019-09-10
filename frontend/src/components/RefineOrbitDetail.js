import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';
import {
  Grid, Card, makeStyles, CardHeader, CardContent,
} from '@material-ui/core';
import clsx from 'clsx';
import { SizeMe } from 'react-sizeme';
import CustomList from './utils/CustomList';
import {
  getOrbitRunById, getOrbitRunTimeProfile, getAsteroids,
} from '../api/Orbit';
import { Donut, TimeProfile } from './utils/CustomChart';
import CustomTable from './utils/CustomTable';
import CustomDialog from './utils/CustomDialog';

const useStyles = makeStyles({
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
  block: {
    marginBottom: 15,
  },
  iconDetail: {
    fontSize: 18,
  },
});


function RefineOrbitDetail({ history, match, setTitle }) {
  const classes = useStyles();

  const { id } = match.params;
  const [data, setData] = useState([]);
  const [list, setList] = useState([]);
  const [tableData, setTableData] = useState([]);
  const pageSizes = [5, 10, 15];
  const [totalCount, setTotalCount] = useState(0);
  const [timeProfile, setTimeProfile] = useState([]);
  const [donutData, setDonutData] = useState([]);
  const donutColors = ['#1D3747', '#305D78', '#89C8F7', '#A8D7FF'];
  const [visible, setVisible] = useState(false);
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
              title={row.status}
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
      name: 'name',
      title: 'Name',
      width: 180,
    },
    {
      name: 'number',
      title: 'Number',
      width: 140,
    },
    {
      name: 'execution_time',
      title: 'Execution Time',
      width: 140,
    },
    {
      name: 'id',
      title: ' ',
      width: 100,
      icon: <i className={clsx(`fas fa-info-circle ${classes.iconDetail}`)} />,
      action: (el) => history.push(`/refine-orbit/asteroid/${el.id}`),
      align: 'center',
    },
    {
      name: 'orbit_run',
      title: ' ',
      width: 100,
      icon: <i className={clsx(`fas fa-code ${classes.iconDetail}`)} />,
      action: (el) => {
        setVisible(true);
      },
      align: 'center',
    },
  ];

  useEffect(() => {
    setTitle('Refine Orbit');
    getOrbitRunById({ id }).then((res) => setData(res));
    getOrbitRunTimeProfile({ id }).then((res) => setTimeProfile(res));
  }, []);

  const loadTableData = async ({
    sorting, pageSize, currentPage, filter, searchValue,
  }) => {
    const ordering = sorting[0].direction === 'desc' ? `-${sorting[0].columnName}` : sorting[0].columnName;
    const asteroids = await getAsteroids({
      ordering,
      pageSize,
      page: currentPage !== 0 ? currentPage + 1 : 1,
      // filters: [{
      //   property: 'orbit_run',
      //   value: id,
      // }].concat(filters),
      filters: [{
        property: 'orbit_run',
        value: id,
      }, ...filter],
      search: searchValue,
    });

    if (asteroids && asteroids.results) {
      setTableData(asteroids.results);
      setTotalCount(asteroids.count);
    }
  };


  useEffect(() => {
    setList([
      {
        title: 'Status',
        value: () => {
          if (data.status === 'failure') {
            return (
              <span
                className={clsx(classes.btn, classes.btnFailure)}
                title={data.status}
              >
                Failure
              </span>
            );
          } if (data.status === 'running') {
            return (
              <span
                className={clsx(classes.btn, classes.btnRunning)}
                title={data.status}
              >
                Running
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
        },
      },
      {
        title: 'Process',
        value: data.proccess_displayname,
      },
      {
        title: 'Owner',
        value: data.owner,
      },
      {
        title: 'Start',
        value: data.h_time,
      },
      {
        title: 'Execution',
        value: data.h_executionsetVisible_time,
      },
      {
        title: 'Asteroids',
        value: data.count_objects,
      },
    ]);

    setDonutData([
      { name: 'Success', value: data.count_success },
      { name: 'Warning', value: data.count_warning },
      { name: 'Failure', value: data.count_failed },
      { name: 'not Executed', value: data.count_not_executed },
    ]);
  }, [data]);

  const handleDialogClick = () => setVisible(!visible);

  useEffect(() => {
    // console.log(tableData);
  }, [tableData]);

  return (
    <>
      <Grid container spacing={2}>
        <Grid item lg={4} xl={3} className={classes.block}>
          <Card>
            <CardHeader title={`Refine Orbit - ${id}`} />

            <CardContent>
              <CustomList list={list} />
            </CardContent>
          </Card>
        </Grid>


        <Grid item lg={4} xl={3} className={classes.block}>
          <Card>
            <CardHeader title="Execution Statistics" />
            <CardContent>
              <Donut
                data={donutData}
                fill={donutColors}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item lg={4} xl={3} className={classes.block}>
          <Card>
            <CardHeader
              title="Execution Time"
            />
            <CardContent>
              <SizeMe
                monitorHeight
                  // render={({ size }) => <TimeProfile data={timeProfile} size={size} />}
                render={({ size }) => <TimeProfile data={timeProfile} />}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item lg={12} xl={12} className={classes.block}>
          <Card>
            <CardHeader title="Asteroids" />

            <CardContent>
              <CustomTable
                columns={columns}
                data={tableData}
                loadData={loadTableData}
                pageSizes={pageSizes}
                totalCount={totalCount}
                defaultSorting={[{ columnName: 'name', direction: 'desc' }]}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <CustomDialog
        visible={visible}
        setVisible={handleDialogClick}
        title="Log"
        content=""
      />
    </>
  );
}

RefineOrbitDetail.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  setTitle: PropTypes.func.isRequired,
};


export default withRouter(RefineOrbitDetail);
