import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import { makeStyles } from '@material-ui/core/styles';
import '@fortawesome/fontawesome-free/css/all.min.css';
import InputNumber from '@material-ui/core/Input';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import { withRouter } from 'react-router';
import clsx from 'clsx';
import DateTime from './DateTimePrediction';
import InputSelect from './InputSelect';
import { getPredictionRuns } from '../api/Prediction';
import CustomTable from './utils/CustomTable';

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

function PredictionOccultation({ history, setTitle }) {
  const classes = useStyles();
  const columns = [
    {
      name: 'status',
      title: 'Status',
      width: 140,
      sortingEnabled: false,
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
      },
    },
    {
      name: 'process_displayname',
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
      name: 'execution_time',
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
      action: (el) => history.push(`/prediction-of-occultation/${el.id}`),
      align: 'center',
    },
  ];

  const [tableData, setTableData] = useState([]);
  const pageSizes = [5, 10, 15];
  const [totalCount, setTotalCount] = useState(0);
  const [reload, setReload] = useState(true);

  useEffect(() => {
    setTitle('Prediction of Occultations');
  }, []);

  const loadTableData = async ({
    sorting, pageSize, currentPage, filter, searchValue,
  }) => {
    const ordering = sorting[0].direction === 'desc' ? `-${sorting[0].columnName}` : sorting[0].columnName;
    const predictions = await getPredictionRuns({
      ordering,
      pageSize,
      page: currentPage !== 0 ? currentPage + 1 : 1,
      filter,
      search: searchValue,
    });

    if (predictions && predictions.results) {
      setTableData(predictions.results);
      setTotalCount(predictions.count);
    }
  };

  return (
    <div>
      <div className={classes.div}>
        <Card className={classes.card}>

          <CardHeader
            title={(
              <span className={classes.headerTitle}>Prediction Occutation</span>
            )}
            className={classes.cardHeader}
          />

          <Grid container spacing={2}>
            <Grid item sm={6} xs={6} xl={6} lg={6}>
              <InputSelect title="Input" width="90%" marginTop={10} />
              <InputSelect title="Catalog" width="90%" marginTop={10} />
              <InputSelect title="Leap Seconds" width="90%" marginTop={10} />
              <InputSelect title="BSP Planetary" width="90%" marginTop={10} />
            </Grid>

            <Grid item sm={6} xs={6} xl={6} lg={6}>
              <InputNumber type="number" placeholder="Catalog Radius" className={classes.inputNumber} />
              <InputNumber type="number" placeholder="Ephemeris Step" className={classes.inputNumber} />
              <DateTime label="Ephemeris Initial Date" />
              <DateTime label="Ephemeris Final Date" width="90%" />
              <Button variant="contained" color="primary" className={classes.button}>Submit</Button>
            </Grid>
          </Grid>

        </Card>
      </div>


      <Grid className={clsx(classes.block, classes.tableWrapper)}>
        <Card>
          <CardHeader
            title={
              <span>History</span>
            }
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

    </div>
  );
}

PredictionOccultation.propTypes = {
  history: PropTypes.objectOf(PropTypes.object).isRequired,
  setTitle: PropTypes.func.isRequired,
};

export default withRouter(PredictionOccultation);
