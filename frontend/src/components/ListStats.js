import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import PropTypes from 'prop-types';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
  },
}));


export default function ListDividers(props) {
  const classes = useStyles();
  const { data, status } = props;

  const columStats = data.map((col, i) => (
    // eslint-disable-next-line react/no-array-index-key
    <div key={i}>
      <ListItem button>
        <ListItemText primary={col.name} />
        <ListItemText primary={col.value} className={col.className} />
      </ListItem>
      <Divider />
    </div>
  ));

  return (

    <List className={classes.root}>
      <ListItem button>
        <ListItemText primary="Status:" />
        <ListItemText primary={status} />
        {/* To DO: Include here a button with the respective status. */}
        {/* Maybe is needed to get the className to style the button */}
      </ListItem>
      <Divider />
      {columStats}
    </List>
  );
}

ListDividers.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  status: PropTypes.string.isRequired,
};
