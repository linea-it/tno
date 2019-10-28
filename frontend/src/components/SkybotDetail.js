import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Grid, Card, makeStyles, CardHeader, CardContent,
} from '@material-ui/core';
import Icon from '@material-ui/core/Icon';
import Button from '@material-ui/core/Button';
import clsx from 'clsx';
import { withRouter } from 'react-router';
import moment from 'moment';
import CustomList from './utils/CustomList';
import CustomTable from './utils/CustomTable';
import { Donut } from './utils/CustomChart';
import { getSkybotRunById, getStatistic, getSkybotRunResults } from '../api/Skybot';

const useStyles = makeStyles({
  cardContentWrapper: {
    overflow: 'auto',
  },
  iconDetail: {
    fontSize: 18,
  },
  buttonIcon: {
    margin: '0 2px',
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
    backgroundColor: '#009900',
    color: '#fff',
  },
  btnFailure: {
    backgroundColor: '#ff1a1a',
    color: '#fff',
  },
  btnRunning: {
    backgroundColor: '#0099ff',
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
});

function SkybotDetail({ setTitle, match, history }) {
  const classes = useStyles();
  const { id } = match.params;

  const [skybotRunDetailList, setSkybotRunDetailList] = useState([]);
  const [timeProfile, setTimeProfile] = useState([]);
  const [skybotDetailTableData, setSkybotDetailTableData] = useState([]);
  const [skybotDetailTableTotalCount, setSkybotDetailTableTotalCount] = useState([]);

  const skybotDetailTableColumns = [
    {
      name: 'status',
      title: 'Status',
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
      width: 140,
    },
    {
      name: 'expnum',
      title: 'Expnum',
      sortingEnabled: false,
      width: 100,
    },
    {
      name: 'band',
      title: 'Band',
      sortingEnabled: false,
      width: 70,
      align: 'center',
    },
    {
      name: 'date_obs',
      title: 'Date Obs',
      sortingEnabled: false,
      customElement: (el) => (
        <span title={moment(el.date_time).format('HH:mm:ss')}>
          {moment(el.date_time).format('YYYY/MM/DD')}
        </span>
      ),
      align: 'center',
    },
    {
      name: 'execution_time',
      title: 'Execution Time (s)',
      sortingEnabled: false,
      width: 150,
    },
    {
      name: 'count_rows',
      title: 'Skybot Rows',
      sortingEnabled: false,
    },
    {
      name: 'created',
      title: 'Created',
      sortingEnabled: false,
    },
    {
      name: 'updated',
      title: 'Updated',
      sortingEnabled: false,
      width: 100,
    },
    {
      name: 'ccd_count_rows',
      title: 'Inside CCD',
      sortingEnabled: false,
      width: 100,
    },
  ];


  useEffect(() => {
    setTitle('Skybot Run');

    getSkybotRunById({ id }).then((res) => {
      setSkybotRunDetailList([
        {
          title: 'Status',
          value: () => {
            if (res.status === 'failure') {
              return (
                <span
                  className={clsx(classes.btn, classes.btnFailure)}
                  title={res.error_msg}
                >
                  Failure
                </span>
              );
            } if (res.status === 'running') {
              return (
                <span
                  className={clsx(classes.btn, classes.btnRunning)}
                  title={res.status}
                >
                  Running
                </span>
              );
            } if (res.status === 'not_executed') {
              return (
                <span
                  className={clsx(classes.btn, classes.btnNotExecuted)}
                  title={res.error_msg}
                >
                  Not Executed
                </span>
              );
            } if (res.status === 'warning') {
              return (
                <span
                  className={clsx(classes.btn, classes.btnWarning)}
                  title={res.error_msg ? res.error_msg : 'Warning'}
                >
                  Warning
                </span>
              );
            }

            return (
              <span
                className={clsx(classes.btn, classes.btnSuccess)}
                title={res.status}
              >
                Success
              </span>
            );
          },
        },
        {
          title: 'Owner',
          value: res.owner,
        },
        {
          title: 'Start',
          value: res.start,
        },
        {
          title: 'Execution',
          value: res.h_execution_time,
        },
        {
          title: 'Pointings',
          value: res.exposure,
        },
        {
          title: 'Type',
          value: res.type_run,
        },
      ]);
    });

    getStatistic({ id }).then((res) => {
      setTimeProfile([
        {
          name: 'Download ',
          value: res.download_time,
        },
        {
          name: 'Import',
          value: res.import_time,
        },
        {
          name: 'Associate CCD',
          value: res.ccd_time,
        },
      ]);
    });

    // loadSkybotDetailTableData({ currentPage: 0, pageSize: 10 });
  }, []);

  const handleBackNavigation = () => history.push('/skybot');

  const loadSkybotDetailTableData = ({ currentPage, pageSize }) => {
    getSkybotRunResults({
      id, page: currentPage + 1, pageSize,
    }).then((res) => {
      setSkybotDetailTableTotalCount(res.totalCount);
      setSkybotDetailTableData(res.data);
    });
  };

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12}>
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
                <Icon className={clsx('fas', 'fa-undo', classes.buttonIcon)} />
                <span>Back</span>
              </Button>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Card>
                <CardHeader
                  title="Summary"
                />
                <CardContent className={classes.cardContentWrapper}>
                  <CustomList
                    data={skybotRunDetailList}
                  />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={8}>
              <Card>
                <CardHeader
                  title="Execution Time"
                />
                <CardContent className={classes.cardContentWrapper}>
                  <Donut
                    data={timeProfile}
                    height={315}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Card>
                <CardHeader
                  title="Skybot Results by Pointings"
                />
                <CardContent className={classes.cardContentWrapper}>
                  <CustomTable
                    columns={skybotDetailTableColumns}
                    data={skybotDetailTableData}
                    totalCount={skybotDetailTableTotalCount}
                    loadData={loadSkybotDetailTableData}
                    hasSearching={false}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}

SkybotDetail.propTypes = {
  setTitle: PropTypes.func.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};

export default withRouter(SkybotDetail);
