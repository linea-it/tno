import React from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import { makeStyles } from '@material-ui/core/styles';
import '@fortawesome/fontawesome-free/css/all.min.css';
import InputSelect from './InputSelect';

import Button from '@material-ui/core/Button';


const useStyles = makeStyles(theme => ({
  card: {
    minHeight: 80,
  },
  div: {
    marginTop: '20px',
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
  button: {
    margin: theme.spacing(1),
    float: 'right',
    marginRight: '2%',

  },

}));




function RefineOrbits() {

  const classes = useStyles();



  return (
    <div>
      <div className={classes.div}>
        <Card className={classes.card}>
          <CardHeader
            title={(
              <span className={classes.headerTitle}>Execute</span>
            )}
            className={classes.cardHeader}
          />
          <InputSelect title="Input" width='100%' marginTop={20} className={classes.input} />
          <Button variant="contained" color="primary" className={classes.button}> Submit </Button>
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
        </Card>
      </div>

    </div>
  );
}

export default RefineOrbits;
