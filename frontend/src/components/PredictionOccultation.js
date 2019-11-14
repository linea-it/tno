import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import { makeStyles } from '@material-ui/core/styles';
import '@fortawesome/fontawesome-free/css/all.min.css';
import InputNumber from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Icon from '@material-ui/core/Icon';
import { withRouter } from 'react-router';
import clsx from 'clsx';
import moment from 'moment';
import DateTime from './DateTimePrediction';
import InputSelect from './InputSelect';
import {
  getPredictionRuns, getCatalogs, getLeapSeconds, getBspPlanetary, createPredictRun,
} from '../api/Prediction';
import CustomTable from './utils/CustomTable';
import { getOrbitRuns } from '../api/Orbit';
import Dialog from "./utils/CustomDialog";
import ReactInterval from 'react-interval';


const useStyles = makeStyles((theme) => ({
  iconList: {
    fontSize: 24,
    cursor: 'pointer',
  },
  button: {
    marginBottom: theme.spacing(1),
    marginRight: theme.spacing(6),
    float: 'right',

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

  inputNumber: {
    marginTop: 9,
    marginBottom: 18,

    width: '90%',
  },
}));

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

function PredictionOccultation({ history, setTitle }) {
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
      customElement: (row) => {
        return (
          <span>
            {row.execution_time && typeof row.execution_time === "string" ? row.execution_time.substring(0, 8) : ""}
          </span>
        );
      },
      width: 140,
      align: 'center',
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
      icon: <Icon className={clsx(`fas fa-info-circle ${classes.iconDetail}`)} />,
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


  const reloadData = () => {
    // loadTableData();
  };

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

  useInterval(() => {
    setReload(!reload);
  }, 30000);

  const [inputArray, setInputArray] = useState([]);
  const [catalogArray, setCatalogArray] = useState([]);
  const [leapSecondsArray, setLeapSecondsArray] = useState([]);
  const [bspPlanetaryArray, setBspPlanetaryArray] = useState([]);
  const [inputRadiusValue, setInputRadiusValue] = useState(0.15);
  const [ephemerisNumberValue, setEphemerisNumberValue] = useState(600);
  const [actionButton, setActionButton] = useState(true);
  const [initialDate, setInitialDate] = useState(moment().startOf('year'));
  const [finalDate, setFinalDate] = useState(moment().endOf('year'));
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogContent, setDialogContent] = useState("ok");
  const [timeoutSeconds] = useState(30);

  const [valueSubmition, setValueSubmition] = useState({
    processId: null,
    orbit_run_input_list_id: null,
    orbit_run_id: null,
    catalogId: null,
    leap_secondsId: null,
    bsp_planetaryId: null,
    catalog_radius: null,
    ephemeris_step: null,
    ephemeris_initial_date: null,
    ephemeris_final_date: null,
    submit: false,

  });


  const handleSubmitClick = (e) => {
    // ***** Values referring to Refine Orbit run. Only success ones ****//
    //  process - processId
    //  input_list_id - input id from object list
    //  input_orbit_id - orbit run id

    //* * Other values**/
    // leap_second
    // bsp_planetary,
    // catalog,
    // catalog_radius
    // ephemeris_initial_date
    // ephemeris_final_date
    // ephemeris_step


    setValueSubmition({
      ...valueSubmition,
      catalog_radius: inputRadiusValue,
      ephemeris_step: ephemerisNumberValue,
      ephemeris_initial_date: initialDate,
      ephemeris_final_date: finalDate,
      submit: true,
    });
  };


  // When submit button is clicked so calls the function below
  useEffect(() => {
    if (valueSubmition.submit) {
      setActionButton(true);

      setValueSubmition({ ...valueSubmition, submit: false });


      setDialogContent('The task has been submitted and will be executed in the background...');
      setDialogVisible(true);

      // Calls APi for creation of prediction run


      createPredictRun({
        process: valueSubmition.processId,
        input_list: valueSubmition.orbit_run_input_list_id,
        input_orbit: valueSubmition.orbit_run_id,
        leap_second: valueSubmition.leap_secondsId,
        bsp_planetary: valueSubmition.bsp_planetaryId,
        catalog: valueSubmition.catalogId,
        catalog_radius: valueSubmition.catalog_radius,
        ephemeris_initial_date: valueSubmition.ephemeris_initial_date,
        ephemeris_final_date: valueSubmition.ephemeris_final_date,
        ephemeris_step: valueSubmition.ephemeris_step,

        // process: "66",
        // input_list: 2,
        // input_orbit: 25,
        // leap_second: 1,
        // bsp_planetary: 1,
        // catalog: 1,
        // catalog_radius: 0.15,
        // ephemeris_initial_date: "2020-01-01T01:59:59Z",
        // ephemeris_final_date: "2019-01-01T02:00:00Z",
        // ephemeris_step: 600
      }).then(() => {
        setReload(!reload);
      });
    }
  }, [valueSubmition]);


  const loadData = () => {
    // Load Input Array
    getOrbitRuns({
      ordering: '-start_time',   //- Lista de Inputs deve estar ordenada com o mais recente primeiro. Ok
      filters: [
        {
          property: 'status',
          value: 'success',
        },
      ],
    })
      .then((res) => {
        setInputArray(res.results);
      });


    // Load Catalogs
    getCatalogs().then((res) => {
      setCatalogArray(res.results);
    });


    // Leap Seconds
    getLeapSeconds().then((res) => {
      setLeapSecondsArray(res.results);
    });


    // Bsp Planetary
    getBspPlanetary().then((res) => {
      setBspPlanetaryArray(res.results);
    });
  };


  // If inputArray state is changed so hit the function useEffect
  // This is important to set first state case the user hits the submit button
  // Avoid error in case of user hits the submit button without choose any option
  // useEffect(() => {
  //   if (inputArray[0]) {
  //     setValueSubmition({
  //       processId: inputArray[0].id,
  //       orbit_run_input_list_id: inputArray[0].input_list,
  //       orbit_run_id: process,
  //       bsp_planetaryId: bspPlanetaryArray[0].id,
  //       leap_seconds: LeapSecondsArray[0].id,
  //       catalogId: catalogArray[0].id
  //     });
  //   }

  // }, [inputArray]);


  useEffect(() => {
    if (typeof (catalogArray[0]) !== 'undefined') {
      setValueSubmition(
        {
          ...valueSubmition,
          catalogId: catalogArray[0].id,

        },

      );
    }
  }, [catalogArray]);


  useEffect(() => {
    if (typeof (leapSecondsArray[0]) !== 'undefined') {
      setValueSubmition({ ...valueSubmition, leap_secondsId: leapSecondsArray[0].id });
    }
  }, [leapSecondsArray]);


  useEffect(() => {
    if (typeof (bspPlanetaryArray[0]) !== 'undefined') {
      setValueSubmition({ ...valueSubmition, bsp_planetaryId: bspPlanetaryArray[0].id });
    }
  }, [bspPlanetaryArray]);


  useEffect(() => {
    loadData();
  }, []);

  const inputNumber = React.createRef();
  const ephemerisNumber = React.createRef();

  const handleInputNumberChange = (event) => {
    setInputRadiusValue(event.target.value);

    ephemerisNumberValue ? setActionButton(false) : setActionButton(true);
  };


  const handleEphemerisNumberChange = (event) => {
    setEphemerisNumberValue(event.target.value);

    inputRadiusValue ? setActionButton(false) : setActionButton(true);
  };


  const handleDialogClose = () => {
    setDialogVisible(false);
  };



  return (
    <Grid>
      <ReactInterval        //Reload a cada 30 segundos na lista de Execuções
        timeout={timeoutSeconds * 1000}
        enabled={true}
        callback={reloadData}
      />

      <Grid container spacing={6}>
        <Grid item lg={12}>
          <Card>
            <CardHeader
              title={(
                <span>Prediction Occutation</span>
              )}
            />
            <Grid container>
              <Grid item lg={6}>
                <InputSelect title="input" width="90%" setActionButton={setActionButton} valueSubmition={valueSubmition} setSubmition={setValueSubmition} marginTop={10} data={inputArray} value="el.id" display="el.proccess_displayname" />
                <InputSelect title="catalog" width="90%" setSubmition={setValueSubmition} marginTop={10} data={catalogArray} value="el.id" display="el.display_name" />
                <InputSelect title="leapSeconds" width="90%" marginTop={10} data={leapSecondsArray} value="el.id" display="el.name" />
                <InputSelect title="bspPlanetary" width="90%" marginTop={10} data={bspPlanetaryArray} value="el.id" display="el.display_name" />

              </Grid>
              <Grid item lg={6}>
                <InputNumber
                  ref={inputNumber}
                  type="number"
                  label="Catalog Radius"

                  className={classes.inputNumber}
                  onChange={handleInputNumberChange}
                  inputProps={{ min: 0.15, max: 2.0, step: 0.01 }}
                  value={inputRadiusValue}

                />

                <InputNumber
                  ref={ephemerisNumber}
                  label="Ephemeris Step"
                  type="number"
                  placeholder="    Ephemeris Step"
                  className={classes.inputNumber}
                  inputProps={{ min: 60, max: 1800, step: 10 }}
                  onChange={handleEphemerisNumberChange}
                  value={ephemerisNumberValue}

                />

                <DateTime
                  defaultDate={moment(initialDate).format('YYYY-MM-DD').toString()}
                  label="Ephemeris Initial Date"
                  valueSubmition={valueSubmition}
                  setSubmition={setValueSubmition}
                  setInitialDate={setInitialDate}
                  title="initialDate"

                />
                <DateTime
                  defaultDate={moment(finalDate).format('YYYY-MM-DD').toString()}
                  label="Ephemeris Final Date"
                  valueSubmition={valueSubmition}
                  setSubmition={setValueSubmition}
                  setFinalDate={setFinalDate}
                  title="finalDate"
                  width="90%"

                />

                <Button
                  variant="contained"
                  color="primary"
                  className={classes.button}
                  onClick={handleSubmitClick}
                  disabled={actionButton}

                >
                  Submit
                </Button>


              </Grid>

            </Grid>

          </Card>

        </Grid>
      </Grid>

      <Grid container spacing={6}>
        <Grid item lg={12}>
          <Card>
            <CardHeader
              title={
                <span>History</span>
              }
            />

            <CustomTable
              columns={columns}
              data={tableData}
              loadData={loadTableData}
              pageSizes={pageSizes}
              totalCount={totalCount}
              defaultSorting={[{ columnName: 'start_time', direction: 'desc' }]}
              reload={reload}
              hasSearching={false}
              hasColumnVisibility={false}
              hasToolbar={false}
              loading={true}
            />
          </Card>
        </Grid>
      </Grid>

      <Dialog
        visible={dialogVisible}
        title="Run Prediction"
        content={dialogContent}
        setVisible={handleDialogClose}
      />

    </Grid>
  );
}

PredictionOccultation.propTypes = {
  history: PropTypes.objectOf(PropTypes.object).isRequired,
  setTitle: PropTypes.func.isRequired,
};

export default withRouter(PredictionOccultation);
