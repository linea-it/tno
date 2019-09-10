import React, { useState, useEffect } from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import { makeStyles } from '@material-ui/core/styles';
import '@fortawesome/fontawesome-free/css/all.min.css';
import InputNumber from '@material-ui/core/Input';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import { id } from 'postcss-selector-parser';
import DateTime from './DateTimePrediction';
import InputSelect from './InputSelect';
import { getOrbitRuns } from '../api/Orbit';
import {
  getCatalogs, getLeapSeconds, getBspPlanetary, createPredictRun,
} from '../api/Prediction';

const useStyles = makeStyles((theme) => ({
  iconList: {
    fontSize: 24,
    cursor: 'pointer',
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
  const [LeapSecondsArray, setLeapSecondsArray] = useState([]);
  const [bspPlanetaryArray, setBspPlanetaryArray] = useState([]);
  const [inputNumberValue, setInputNumberValue] = useState(0.15);
  const [ephemerisNumberValue, setEphemerisNumberValue] = useState(600);

  const [valueSubmition, setValueSubmition] = useState({
    process: null,
    input_list_id: null,
    input_orbit_id: null,
    bsp_planetary: null,
    catalog: null,
    catalog_radius: null,
    ephemeris_initial_date: null,
    ephemeris_final_date: null,
    ephemeris_step: null,
  });


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


  useEffect(() => { loadData(); }, []);

  const handleInputNumberChange = (event) => {
    setInputNumberValue(event.target.value);
  };


  const handleEphemerisNumberChange = (event) => {
    setEphemerisNumberValue(event.target.value);
  };

  const handleSubmitClick = () => {
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


    createPredictRun({
      process,
    });
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
              <InputSelect title="Input" width="90%" default={0} setSubmition={setValueSubmition} marginTop={10} data={inputArray} value="el.id" display="el.proccess_displayname" />
              <InputSelect title="Catalog" width="90%" marginTop={10} data={catalogArray} value="el.id" display="el.display_name" />
              <InputSelect title="Leap Seconds" width="90%" marginTop={10} data={LeapSecondsArray} value="el.id" display="el.name" />
              <InputSelect title="BSP Planetary" width="90%" marginTop={10} data={bspPlanetaryArray} value="el.id" display="el.display_name" />
            </Grid>

            <Grid item sm={6} xs={6} xl={6} lg={6}>

              <InputNumber
                type="number"
                placeholder="    Catalog Radius"
                className={classes.inputNumber}
                onChange={handleInputNumberChange}
                inputProps={{ min: 0.15, max: 2.0, step: 0.01 }}
                value={inputNumberValue}

              />

              <InputNumber
                type="number"
                placeholder="    Ephemeris Step"
                className={classes.inputNumber}
                inputProps={{ min: 60, max: 1800, step: 10 }}
                onChange={handleEphemerisNumberChange}
                value={ephemerisNumberValue}
              />

              <DateTime label="Ephemeris Initial Date" />
              <DateTime label="Ephemeris Final Date" width="90%" />

              <Button
                variant="contained"
                color="primary"
                className={classes.button}
                onClick={handleSubmitClick}

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
            History of prediction occultation
          </CardContent>

        </Card>
      </div>

    </div>
  );
}

export default PredictionOccultation;
