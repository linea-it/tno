import React, { useEffect, useRef, useState } from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import {
  CardHeader,
  Card,
  TextField,
  Button,
  Grid,
  Icon,
} from '@material-ui/core';
import { withRouter } from 'react-router';
import '@fortawesome/fontawesome-free/css/all.min.css';

/*
TODO: These, under, are very bad refactor!
For now, I exported the components to another folder (where they should be)
and, later on, I'll create specific input components, generic, to suffice similar necessities.
*/
import SelectPredict from '../../components/Input/SelectPredict';
import DatePredict from '../../components/Input/DatePredict';

import {
  getPredictionRuns,
  getCatalogs,
  getLeapSeconds,
  getBspPlanetary,
  createPredictRun,
} from '../../services/api/Prediction';
import Table from '../../components/Table';
import { getOrbitRuns } from '../../services/api/Orbit';
import Dialog from '../../components/Dialog';
import ColumnStatus from '../../components/Table/ColumnStatus';

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
  const columns = [
    {
      name: 'id',
      title: 'Details',
      width: 100,
      icon: <Icon className="fas fa-info-circle" />,
      action: (el) => history.push(`/prediction-of-occultation/${el.id}`),
      align: 'center',
      sortingEnabled: false,
    },
    {
      name: 'status',
      title: 'Status',
      width: 140,
      align: 'center',
      sortingEnabled: false,
      customElement: (row) => (
        <ColumnStatus status={row.status} title={row.error_msg} />
      ),
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
      title: 'Exec Time',
      headerTooltip: 'Execution time',
      customElement: (row) => (
        <span>
          {row.execution_time && typeof row.execution_time === 'string'
            ? row.execution_time.substring(0, 8)
            : ''}
        </span>
      ),
      width: 140,
      align: 'center',
    },
    {
      name: 'count_objects',
      title: 'Asteroids',
      width: 90,
      align: 'right',
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
  const [dialogContent, setDialogContent] = useState('ok');

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
      setDialogContent(
        'The task has been submitted and will be executed in the background...'
      );
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
      }).then(() => {
        setReload(!reload);
      });
    }
  }, [valueSubmition]);

  const loadData = () => {
    // Load Input Array
    getOrbitRuns({
      ordering: '-start_time', // - Lista de Inputs deve estar ordenada com o mais recente primeiro. Ok
      filters: [
        {
          property: 'status',
          value: 'success',
        },
      ],
    }).then((res) => {
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

  useEffect(() => {
    if (typeof catalogArray[0] !== 'undefined') {
      setValueSubmition({
        ...valueSubmition,
        catalogId: catalogArray[0].id,
      });
    }
  }, [catalogArray]);

  useEffect(() => {
    if (typeof leapSecondsArray[0] !== 'undefined') {
      setValueSubmition({
        ...valueSubmition,
        leap_secondsId: leapSecondsArray[0].id,
      });
    }
  }, [leapSecondsArray]);

  useEffect(() => {
    if (typeof bspPlanetaryArray[0] !== 'undefined') {
      setValueSubmition({
        ...valueSubmition,
        bsp_planetaryId: bspPlanetaryArray[0].id,
      });
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
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader title={<span>Prediction Occutation</span>} />
            <Grid container>
              <Grid item xs={12} lg={6}>
                <SelectPredict
                  title="input"
                  width="90%"
                  setActionButton={setActionButton}
                  valueSubmition={valueSubmition}
                  setSubmition={setValueSubmition}
                  marginTop={10}
                  data={inputArray}
                  value="el.id"
                  display="el.proccess_displayname"
                />
                <SelectPredict
                  title="catalog"
                  width="90%"
                  setSubmition={setValueSubmition}
                  marginTop={10}
                  data={catalogArray}
                  value="el.id"
                  display="el.display_name"
                />
                <SelectPredict
                  title="leapSeconds"
                  width="90%"
                  marginTop={10}
                  data={leapSecondsArray}
                  value="el.id"
                  display="el.name"
                />
                <SelectPredict
                  title="bspPlanetary"
                  width="90%"
                  marginTop={10}
                  data={bspPlanetaryArray}
                  value="el.id"
                  display="el.display_name"
                />
              </Grid>
              <Grid item xs={12} lg={6}>
                <TextField
                  ref={inputNumber}
                  type="number"
                  label="Catalog Radius"
                  onChange={handleInputNumberChange}
                  inputProps={{ min: 0.15, max: 2.0, step: 0.01 }}
                  value={inputRadiusValue}
                />
                <TextField
                  ref={ephemerisNumber}
                  label="Ephemeris Step"
                  type="number"
                  placeholder="Ephemeris Step"
                  inputProps={{ min: 60, max: 1800, step: 10 }}
                  onChange={handleEphemerisNumberChange}
                  value={ephemerisNumberValue}
                />
                <DatePredict
                  defaultDate={initialDate}
                  label="Ephemeris Initial Date"
                  valueSubmition={valueSubmition}
                  setSubmition={setValueSubmition}
                  setInitialDate={setInitialDate}
                  titleId="initialDate"
                />
                <DatePredict
                  defaultDate={finalDate}
                  label="Ephemeris Final Date"
                  valueSubmition={valueSubmition}
                  setSubmition={setValueSubmition}
                  setFinalDate={setFinalDate}
                  titleId="finalDate"
                  width="90%"
                />
                <Button
                  variant="contained"
                  color="primary"
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
        <Grid item xs={12}>
          <Card>
            <CardHeader title={<span>History</span>} />

            <Table
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
              loading
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
