import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import {
  Grid,
  makeStyles,
  Card,
  CardHeader,
  CardContent,
} from '@material-ui/core';
import Button from '@material-ui/core/Button';
import clsx from 'clsx';
import moment from 'moment';
import { getPredictionRunById, getTimeProfile, getAsteroids } from '../api/Prediction';
import CustomTable from './utils/CustomTable';
import CustomList from './utils/CustomList';
import { Donut, TimeProfile } from './utils/CustomChart';

const useStyles = makeStyles((theme) => ({
  button: {
    margin: theme.spacing(1),
  },
  buttonIcon: {
    margin: '0 2px',
  },
  arrowBack: {
    fontSize: 9,
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
  block: {
    marginBottom: 15,
  },
  tableWrapper: {
    maxWidth: '100%',
  },
}));

function PredictionOccultationDetail({ history, match, setTitle }) {
  const classes = useStyles();
  const { id } = match.params;
  const [list, setList] = useState([]);
  const [statusDonutData, setStatusDonutData] = useState([]);
  const [executionTimeDonutData, setExecutionTimeDonutData] = useState([]);
  const [timeProfile, setTimeProfile] = useState({});
  const [tableData, setTableData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const pageSizes = [5, 10, 15];
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
      name: 'occultations',
      title: 'Occultations',
      width: 140,
    },
    {
      name: 'h_execution_time',
      title: 'Execution Time',
      width: 140,
    },
    {
      name: 'id',
      title: ' ',
      width: 100,
      icon: <i className={clsx(`fas fa-info-circle ${classes.iconDetail}`)} />,
      action: (el) => history.push(`/prediction-of-occultation/asteroid/${el.id}`),
      align: 'center',
    },
  ];


  useEffect(() => {
    setTitle('Prediction of Occultations');

    getPredictionRunById({ id }).then((data) => {
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
            } if (data.status === 'running') {
              return (
                <span
                  className={clsx(classes.btn, classes.btnRunning)}
                  title={data.status}
                >
                    Running
                </span>
              );
            } if (data.status === 'not_executed') {
              return (
                <span
                  className={clsx(classes.btn, classes.btnNotExecuted)}
                  title={data.error_msg}
                >
                    Not Executed
                </span>
              );
            } if (data.status === 'warning') {
              return (
                <span
                  className={clsx(classes.btn, classes.btnWarning)}
                  title={data.error_msg ? data.error_msg : 'Warning'}
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
          },
        },
        {
          title: 'Process',
          value: data.process_displayname,
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
          value: data.h_execution_time,
        },
        {
          title: 'Asteroids',
          value: data.count_objects,
        },
        {
          title: 'Occultations',
          value: data.occultations,
        },
      ]);

      setStatusDonutData([
        { name: 'Success', value: data.count_success },
        { name: 'Warning', value: data.count_warning },
        { name: 'Failure', value: data.count_failed },
        { name: 'Not Executed', value: data.count_not_executed },
      ]);

      setExecutionTimeDonutData([
        { name: 'Dates', value: Math.round(moment.duration(data.execution_dates).asSeconds()) },
        { name: 'Ephemeris', value: Math.round(moment.duration(data.execution_ephemeris).asSeconds()) },
        { name: 'Gaia', value: Math.round(moment.duration(data.execution_catalog).asSeconds()) },
        { name: 'Search Candidates', value: Math.round(moment.duration(data.execution_search_candidate).asSeconds()) },
        { name: 'Maps', value: Math.round(moment.duration(data.execution_maps).asSeconds()) },
        { name: 'Register', value: Math.round(moment.duration(data.execution_register).asSeconds()) },
      ]);
    });

    getTimeProfile({ id }).then((res) => {
      console.log(res);
      setTimeProfile(res);
    });
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
        property: 'predict_run',
        value: id,
      }, ...filter],
      search: searchValue,
    });

    if (asteroids && asteroids.results) {
      setTableData(asteroids.results);
      setTotalCount(asteroids.count);
    }
  };

  const handleBackNavigation = () => history.push('/prediction-of-occultation');

  return (
    <>
      <Grid
        container
        justify="space-between"
        alignItems="center"
        spacing={2}
      >
        <Grid item xs={12} md={4}>
          <Button
            variant="contained"
            color="primary"
            title="Back"
            className={classes.button}
            onClick={handleBackNavigation}
          >
            <i className={clsx('fas', 'fa-undo', classes.buttonIcon)} />
            <span>Back</span>
          </Button>
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid item xs={12} md={3} className={classes.block}>
          <Card>
            <CardHeader title="Summary" />
            <CardContent>
              <CustomList data={list} />
            </CardContent>
          </Card>
        </Grid>
        {Object.entries(timeProfile).length > 0 ? (
          <Grid item xs={12} md={9} className={classes.block}>
            <Card>
              <CardHeader
                title="Time Profile"
              />
              <CardContent>
                <TimeProfile
                  width={773}
                  height={363}
                  data={timeProfile}
                />
              </CardContent>
            </Card>
          </Grid>
        ) : null}
      </Grid>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6} className={classes.block}>
          <Card>
            <CardHeader title="Status" />
            <CardContent>
              <Donut
                data={statusDonutData}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} className={classes.block}>
          <Card>
            <CardHeader
              title="Execution Time"
            />
            <CardContent>
              <Donut
                data={executionTimeDonutData}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item lg={12} className={clsx(classes.block, classes.tableWrapper)}>
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
    </>
  );
}

PredictionOccultationDetail.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.number,
    }),
  }).isRequired,
};

export default withRouter(PredictionOccultationDetail);
