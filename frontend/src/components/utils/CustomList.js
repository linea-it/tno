import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import PropTypes from 'prop-types';

const useStyles = makeStyles({
  root: {
    maxWidth: '100%',
  },
  itemText: {
    flex: '1 1',
  },
});


function CustomList({ data, height, width }) {
  const classes = useStyles();

  return (
    <List className={classes.root} style={{ height, width }}>
      {data.map((item, i, arr) => (
        <ListItem key={i} divider={i !== arr.length - 1} dense={item.dense ? item.dense : false}>
          <ListItemText primary={item.title} className={classes.itemText} />
          <ListItemText className={classes.itemText} secondary={typeof item.value === 'function' ? item.value() : item.value} />
        </ListItem>
      ))}
    </List>
  );
}

CustomList.defaultProps = {
  height: 'auto',
  width: '100%',
};

CustomList.propTypes = {
  height: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
  width: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default CustomList;
