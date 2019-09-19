import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import { Card, CardHeader, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import InputSelect from './InputSelectAstrometryMain';
import { getListsByStatus } from '../api/Praia';
import { object } from 'prop-types';


const useStyles = makeStyles((theme) => ({
  cardHeader: {

  },
  button: {
    margin: theme.spacing(1),
    float: 'right',
    marginRight: '10%',
  },

}));


function Astrometry({ setTitle }) {

  const classes = useStyles();




  // loadInputs = inputValue => {
  //   return this.object_api
  //     .getListsByStatus({ status: 'success', search: inputValue })
  //     .then(res => {
  //       const inputs = res.data.results;
  //       return { options: inputs };
  //     });
  // };


  const [objectList, setObjectList] = useState([]);

  const loadData = (inputValue) => {

    getListsByStatus({ status: 'success', search: inputValue }).then((res) => {
      setObjectList(res.data.results);
    });
  };


  useEffect(() => {
    setTitle("Astrometry");
    loadData();
  }, []);




  return (
    <div>
      <Grid container spacing={2}>

        <Grid item sm={6} xl={5}>
          <Card>

            <CardHeader
              className={classes.cardHeader}
              title={"Execute"}
            />

            <InputSelect title="Input Object List" data={objectList} width="90%" marginTop={10} />
            <InputSelect title="Reference Catalog" width="90%" marginTop={10} />
            <InputSelect title="Configuration" width="90%" marginTop={10} />
            <Button variant="contained" color="primary" className={classes.button}>Submit</Button>
          </Card>

        </Grid>

      </Grid>

      <Grid container spacing={2}>

        <Grid item sm={12} xl={12}>
          <Card>

            <CardHeader
              className={classes.cardHeader}
              title={"History"}
            />
          </Card>

        </Grid>

      </Grid>

    </div>

  );

};

export default withRouter(Astrometry);








