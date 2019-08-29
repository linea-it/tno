import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import { getThemeProps } from '@material-ui/styles';

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
  },
  statusListText: {
    paddingLeft: theme.spacing(0), //Way to white space the element
  },

  firstListText: {
    paddingLeft: theme.spacing(5), //Way to white space the element
  },
  secondListText: {
    paddingLeft: theme.spacing(6), //Way to white space the element
  },
  thirdListText: {
    paddingLeft: theme.spacing(7), //Way to white space the element
  },
  forthListText: {
    paddingLeft: theme.spacing(3), //Way to white space the element
  },
  fifthListText: {
    paddingLeft: theme.spacing(3), //Way to white space the element
  },
  sixthListText: {
    paddingLeft: theme.spacing(0), //Way to white space the element
  },

}));



export default function ListDividers(props) {
  const classes = useStyles();


  const columStats = props.data.map((col, i) => {

    return (

      <div key={i}>
        <ListItem button>
          <ListItemText primary={col.name} />
          <ListItemText primary={col.value} className={eval(col.className)} />
        </ListItem>
        <Divider />
      </div>

    );

  });



  return (

    <List className={classes.root}>

      <ListItem button>
        <ListItemText primary="Status:" />
        <ListItemText primary={props.status} />

        {/* To DO: Include here a button with the respective status. */}
        {/* Maybe is needed to get the className to style the button */}

      </ListItem>
      <Divider />

      {columStats}

    </List>



  );
}