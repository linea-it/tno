import React, { useState, useEffect, useLayoutEffect } from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import { makeStyles } from '@material-ui/core/styles';
import '@fortawesome/fontawesome-free/css/all.min.css';
import InputNumber from '@material-ui/core/Input';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
// import { id } from 'postcss-selector-parser';
import DateTime from './DateTimePrediction';
import InputSelect from './InputSelect';
import { getOrbitRuns } from '../api/Orbit';
import Dialog from "../components/utils/CustomDialog";
import PredictionHistory from "./PredictionHistory";

import { getCatalogs, getLeapSeconds, getBspPlanetary, createPredictRun, }
  from '../api/Prediction';

const useStyles = makeStyles((theme) => ({
  iconList: {
    fontSize: 24,
    cursor: 'pointer',
  },

  card: {
    marginBottom: 10
  },

  inputNumber: {
    marginTop: 25,
    marginBottom: 18,

    width: '90%',
  },
  button: {
    margin: theme.spacing(1),
    float: 'right',
    marginRight: '10%',
  },
}));

function PredictionOccultation() {
  const classes = useStyles();

  const [inputArray, setInputArray] = useState([]);
  const [catalogArray, setCatalogArray] = useState([]);
  const [leapSecondsArray, setLeapSecondsArray] = useState([]);
  const [bspPlanetaryArray, setBspPlanetaryArray] = useState([]);
  const [inputRadiusValue, setInputRadiusValue] = useState(0.15);
  const [ephemerisNumberValue, setEphemerisNumberValue] = useState(600);
  const [actionButton, setActionButton] = useState(true);
  const [dateTime, setDateTime] = useState("2017-05-24T10:30");
  const [dialogVisible, setDialogVisible] = useState(false);

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
      ephemeris_initial_date: dateTime,
      ephemeris_final_date: dateTime,
      submit: true,
    });


    setDialogVisible(true);

  }



  //When submit button is clicked so calls the function below
  useEffect(() => {

    if (valueSubmition.submit) {

      //Calls APi for creation of prediction run


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
        ephemeris_step: valueSubmition.ephemeris_step
      }).then((res) => {
        console.log(res);
      });


    }

  }, [valueSubmition]);





  const loadData = () => {
    // Load Input Array
    getOrbitRuns({
      ordering: 'start_time',
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
  // This is important to set first state case the user hit the submit button
  // Avoid error in case of user hit the submit button without choose any option
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



  // catalogArray[0].id === "undefined" ? console.log("Catalog Id still undefine") : console.log("Now ok");

  // (




  useEffect(() => {

    if (typeof (catalogArray[0]) != "undefined") {
      setValueSubmition(
        {
          ...valueSubmition,
          catalogId: catalogArray[0].id,

        }

      )
    }

  }, [catalogArray]);




  useEffect(() => {

    if (typeof (leapSecondsArray[0]) != "undefined") {
      setValueSubmition({ ...valueSubmition, leap_secondsId: leapSecondsArray[0].id })
    }

  }, [leapSecondsArray]);




  useEffect(() => {

    if (typeof (bspPlanetaryArray[0]) != "undefined") {
      setValueSubmition({ ...valueSubmition, bsp_planetaryId: bspPlanetaryArray[0].id })
    }

  }, [bspPlanetaryArray]);





  useEffect(() => {
    loadData();

  }, []);

  const inputNumber = React.createRef();
  const ephemerisNumber = React.createRef()

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
              <InputSelect title="input" width="90%" setActionButton={setActionButton} valueSubmition={valueSubmition} setSubmition={setValueSubmition} marginTop={10} data={inputArray} value="el.id" display="el.proccess_displayname" />
              <InputSelect title="catalog" width="90%" setSubmition={setValueSubmition} marginTop={10} data={catalogArray} value="el.id" display="el.display_name" />
              <InputSelect title="leapSeconds" width="90%" marginTop={10} data={leapSecondsArray} value="el.id" display="el.name" />
              <InputSelect title="bspPlanetary" width="90%" marginTop={10} data={bspPlanetaryArray} value="el.id" display="el.display_name" />
            </Grid>

            <Grid item sm={6} xs={6} xl={6} lg={6}>

              <InputNumber
                ref={inputNumber}
                type="number"
                placeholder="    Catalog Radius"
                className={classes.inputNumber}
                onChange={handleInputNumberChange}
                inputProps={{ min: 0.15, max: 2.0, step: 0.01 }}
                value={inputRadiusValue}

              />

              <InputNumber
                ref={ephemerisNumber}
                type="number"
                placeholder="    Ephemeris Step"
                className={classes.inputNumber}
                inputProps={{ min: 60, max: 1800, step: 10 }}
                onChange={handleEphemerisNumberChange}
                value={ephemerisNumberValue}
              />

              <DateTime defaultDateTime={dateTime} label="Ephemeris Initial Date" />
              <DateTime defaultDateTime={dateTime} label="Ephemeris Final Date" width="90%" />

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
      </div>


      <div className={classes.div}>
        <Card>

          <CardHeader
            title={(
              <span className={classes.headerTitle}>History</span>
            )}
            className={classes.cardHeader}
          />
          <CardContent>
            <PredictionHistory>

            </PredictionHistory>


          </CardContent>

        </Card>
      </div>



      <Dialog
        visible={dialogVisible}
        title={"Run Prediction"}
        content={"The task has been submitted and will be executed in the background."}
        setVisible={handleDialogClose}
      >

      </Dialog>

    </div>
  );
}

export default PredictionOccultation;
