import React, { useState, useEffect } from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import { makeStyles } from '@material-ui/core/styles';
import '@fortawesome/fontawesome-free/css/all.min.css';
import InputSelect from './InputSelect';
import InputNumber from '@material-ui/core/Input';
import DateTime from './DateTimePrediction';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import { ThemeProvider } from '@material-ui/styles';



const useStyles = makeStyles(theme => ({
  card: {
    minHeight: 230,
  },
  div: {

    marginTop: 5,
  },
  cardHeader: {
    backgroundColor: 'rgb(248, 249, 252)',
    borderBottom: '1px solid rgb(227, 230, 240)',
    paddingTop: 5,
    paddingBottom: 5,
  },
  headerTitle: {
    color: '#34465d',
    fontSize: 16,
    fontWeight: 'bold',
  },
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
  }
}));

function PredictionOccultation() {


  const classes = useStyles();
  const [test, setTest] = useState('')



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
              <InputNumber type="number" placeholder={"    Catalog Radius"} className={classes.inputNumber} />
              <InputNumber type="number" placeholder={"    Ephemeris Step"} className={classes.inputNumber} />
              <DateTime label="Ephemeris Initial Date" />
              <DateTime label="Ephemeris Final Date" width="90%" />
              <Button variant="contained" color="primary" className={classes.button} >Submit</Button>
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

    </div >
  );

}

export default PredictionOccultation;
