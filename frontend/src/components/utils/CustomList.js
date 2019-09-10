import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import PropTypes from 'prop-types';

const useStyles = makeStyles({
  root: {
    width: '100%',
    maxWidth: 360,
  },
  itemText: {
    flex: '1 1',
  },
});


function CustomList({ list }) {
  const classes = useStyles();

  return (
    <List className={classes.root}>
      {list.map((item, i, arr) => (
        <ListItem key={i} divider={i !== arr.length - 1} dense={item.dense ? item.dense : false}>
          <ListItemText primary={item.title} className={classes.itemText} />
          <ListItemText className={classes.itemText} secondary={typeof item.value === 'function' ? item.value() : item.value} />
        </ListItem>
      ))}
    </List>
  );
}

CustomList.propTypes = {
  list: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default CustomList;
