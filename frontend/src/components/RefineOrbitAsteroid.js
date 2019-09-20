import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Grid, Card, makeStyles, CardHeader, CardContent,
} from '@material-ui/core';
import clsx from 'clsx';
import moment from 'moment';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import CustomList from './utils/CustomList';
import CustomTable from './utils/CustomTable';
import {
  url as apiUrl, getAsteroidById, getAsteroidInputs, getAsteroidFiles,
} from '../api/Orbit';


const useStyles = makeStyles((theme) => ({
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
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    overflow: 'hidden',
    backgroundColor: theme.palette.background.paper,
  },
  chart: {
    width: '100%',
    maxWidth: '100%',
    height: 'auto',
  },
  chartTile: {
    height: 'auto !important',
  },
}));

function RefineOrbitAsteroid({ setTitle, match }) {
  const { id } = match.params;
  const classes = useStyles();
  const [asteroidList, setAsteroidList] = useState([]);
  const [inputTableData, setInputTableData] = useState([]);
  const [resultTableData, setResultTableData] = useState([]);
  const [charts, setCharts] = useState([]);


  const inputColumns = [
    {
      name: 'input_type',
      title: 'Inputs',
    },
    {
      name: 'source',
      title: 'Source',
    },
    {
      name: 'date_time',
      title: 'Date',
      customElement: (el) => (
        <span title={moment(el.date_time).format('HH:mm:ss')}>
          {moment(el.date_time).format('YYYY/MM/DD')}
        </span>
      ),
      width: 150,
    },
    {
      name: 'filename',
      title: 'Filename',
    },
  ];


  const resultColumns = [
    {
      name: 'filename',
      title: 'Name',
      width: 220,
    },
    {
      name: 'h_size',
      title: 'Size',
      width: 170,
    },
    {
      name: 'file_type',
      title: 'Type',
    },
  ];

  const plotImagesOrder = [
    'comparison_nima_jpl_ra',
    'comparison_nima_jpl_dec',
    'residual_all_v1',
    'residual_recent',
    'comparison_bsp_integration',
  ];

  useEffect(() => {
    setTitle('Refine Orbit');
    getAsteroidById({ id }).then((data) => {
      setAsteroidList([
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
          title: 'Executed',
          value: data.h_time,
        },
        {
          title: 'Execution Time',
          value: data.h_execution_time,
        },
        {
          title: 'Size',
          value: data.h_size,
        },
      ]);
    });

    getAsteroidInputs({ id }).then((data) => {
      const tableData = data.results.map((res) => ({
        input_type: res.input_type,
        source: res.source,
        date_time: res.date_time,
        filename: res.filename,
      }));
      setInputTableData(tableData);
    });
    getAsteroidFiles({ id }).then((data) => {
      const resultData = data.results.map((res) => ({
        filename: res.filename,
        h_size: res.h_size,
        file_type: res.file_type,
      }));

      // Lista so com os arquivos que sao imagens
      const excludedImages = ['omc_sep.png'];
      const images = [];

      data.results.forEach((e) => {
        if (
          e.file_type === '.png'
          && !excludedImages.includes(e.filename)
        ) {
          // O source deve apontar para o backend
          e.src = apiUrl + e.src;
          // Saber em qual ordem deve ser exibida a imagem.
          const idx = plotImagesOrder.indexOf(e.type);

          if (idx > -1) {
            images[idx] = e;
          }
        }
      });
      setCharts(images);
      setResultTableData(resultData);
    });
  }, []);

  return (
    <>
      <Grid container spacing={2}>
        <Grid item lg={4} xl={3} className={classes.block}>
          <Card>
            <CardHeader title="Asteroid" />
            <CardContent>
              <CustomList data={asteroidList} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {charts.length > 0 ? (
        <Grid container spacing={2}>
          <Grid item className={classes.block}>
            <Card>
              <CardHeader title="Charts" />
              <GridList cols={3} className={classes.block}>
                {charts.map((image) => (
                  <GridListTile item className={classes.chartTile}>
                    <img src={image.src} className={classes.chart} alt={image.filename} title={image.filename} />
                  </GridListTile>
                ))}
              </GridList>
              <CardContent />
            </Card>
          </Grid>
        </Grid>
      ) : null}


      <Grid container spacing={2}>
        <Grid item lg={resultTableData.length > 0 ? 6 : 12} className={classes.block}>
          <Card>
            <CardHeader title="Inputs" />

            <CardContent>
              <CustomTable
                columns={inputColumns}
                data={inputTableData}
                hasPagination={false}
                hasSearching={false}
                hasColumnVisibility={false}
                hasToolbar={false}
                remote={false}
              />
            </CardContent>
          </Card>
        </Grid>
        {resultTableData.length > 0 ? (
          <Grid item lg={6} className={classes.block}>
            <Card>
              <CardHeader title="Results" />
              <CardContent>
                <CustomTable
                  columns={resultColumns}
                  data={resultTableData}
                  hasPagination
                  pageSize={5}
                  hasSearching={false}
                  hasColumnVisibility={false}
                  hasToolbar={false}
                  remote={false}
                />
              </CardContent>
            </Card>
          </Grid>
        ) : null}
      </Grid>
    </>
  );
}

RefineOrbitAsteroid.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  setTitle: PropTypes.func.isRequired,
};

export default RefineOrbitAsteroid;
