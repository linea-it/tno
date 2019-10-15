import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  CardActions,
  makeStyles,
} from '@material-ui/core';
import Button from '@material-ui/core/Button';
import MenuItem from '@material-ui/core/MenuItem';
import Label from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl';
import Dialog from './utils/CustomDialog';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectRun: {
    minWidth: 300,
  },
  typography: {
    marginBottom: 15,
  },
  runButton: {
    marginTop: theme.spacing(3),
    width: '100%',
  },
  dialogHeader: {
    width: 600,
  },
  initialDate: {
    width: '40%',
    marginRight: 50,
  },
  finalDate: {
    width: '40%',

  },
  dialogButton: {
    marginTop: 25,
    float: 'right',
  },
}));

function SkyBotRun({ setTitle }) {

  useEffect(() => {
    setTitle("SkyBot Run");
  }, []);

  const [selectRunValue, setSelectRunValue] = useState('by_period');
  const [initialDate, setInitialDate] = useState();
  const [finalDate, setFinalDate] = useState();
  const [dialog, setDialog] = useState({
    visible: false,
    content: " ",
    title: " ",
  });


  const classes = useStyles();

  const handleSelectRunChange = event => {
    setSelectRunValue(event.target.value);
  };

  const loadMenuItems = () => {
    const options = [
      { title: "All Pointings", value: "all_pointings" },
      { title: "By Period", value: "by_period" },
      { title: "Region Selection", value: "region_selection" },
      { title: "Cone Search", value: "cone_search" },
    ];

    return options.map((el, i) => (
      <MenuItem
        key={i}
        value={el.value}
        title={el.title}
      >
        {el.title}
      </MenuItem>
    ));

  };

  const handleSubmit = () => {
    console.log("Submit");
    console.log(initialDate);
  };

  const handleAllPointings = () => {

  };


  const handleInitialDateChange = (date) => {

    setInitialDate(date);
    console.log("State:", initialDate);
  };



  const handleByPeriod = () => {

    setDialog({
      visible: true,
      content:
        <>
          <MuiPickersUtilsProvider utils={DateFnsUtils} >
            <KeyboardDatePicker

              className={classes.initialDate}
              variant="inline"
              format={"yyyy/MM/dd"}
              id="date-picker-inline"
              label={"Initial Date"}
              value={initialDate}
              onChange={()=>setInitialDate("2019/01/01")}

            />
            <KeyboardDatePicker
              className={classes.finalDate}
              variant="inline"
              format={"yyyy/MM/dd"}
              id="date-picker-inline"
              label={"Final Date"}
              value={finalDate}

            />
          </MuiPickersUtilsProvider >
          <Button
            className={classes.dialogButton}
            variant="contained"
            color="primary"
            onClick={handleSubmit}
          >
            Ok
         </Button>
        </>,
      title: "Query of all pointings by Period"
    });

  };

  const handleRegionSelection = () => {


    setDialog({
      visible: true,
      content: " ",
      title: "Query of all pointings within a region"
    });
  };

  const handleConeSearch = () => {

    setDialog({
      visible: true,
      content: " ",
      title: "Query of all pointings within the circular region of the sky"
    });
  };

  const handleSelectRunClick = () => {

    switch (selectRunValue) {
      case "all_pointings":
        handleAllPointings();
        break;
      case "by_period":
        handleByPeriod();
        break;
      case "region_selection":
        handleRegionSelection();
        break;
      case "cone_search":
        handleConeSearch();
        break;
    }
  };

  console.log(selectRunValue);

  return (

    <Grid>
      <Grid container spacing={6}>
        <Grid item lg={5} xl={3}>
          <Card>
            <CardHeader
              title="SkyBot Run"
            />
            <CardContent>
              <Typography className={classes.typography}>Updates the SkyBot output table.</Typography>
              <FormControl className={classes.formControl}>
                <Label htmlFor='select_run'>Select the type of update</Label>
                <Select
                  className={classes.selectRun}
                  value={selectRunValue}
                  inputProps={{
                    name: 'select_run',
                    id: 'select_run',
                  }}
                  onChange={handleSelectRunChange}
                >
                  {loadMenuItems()}

                </Select>
                <Button
                  variant="contained"
                  color="primary"
                  className={classes.runButton}
                  onClick={handleSelectRunClick}
                >
                  Run
                  </Button>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={6}>
        <Grid item lg={12} xl={12}>
          <Card>
            <CardHeader
              title="History"
            />
            <CardContent>
              History Table
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Dialog
        visible={dialog.visible}
        title={dialog.title}
        content={dialog.content}
        setVisible={() => setDialog({ visible: false, content: " ", title: " " })}
        headerStyle={classes.dialogHeader}
      >
      </Dialog>
    </Grid>
  );
};
export default withRouter(SkyBotRun);

