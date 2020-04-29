import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import Icon from '@material-ui/core/Icon';

const useStyles = makeStyles({
  root: {
    maxWidth: '100%',
  },
  itemText: {
    flex: '1 1',
  },
  tooltip: {
    borderBottom: '1px dotted #888',
    cursor: 'help',
  },
  tooltipIcon: {
    fontSize: 10,
    opacity: 0.8,
    marginLeft: 2,
  },
});

function CustomList({ data, height, width }) {
  const classes = useStyles();

  return (
    <List className={classes.root} style={{ height, width }}>
      {data.map((item, i, arr) => (
        <ListItem
          key={i}
          divider={i !== arr.length - 1}
          dense={item.dense ? item.dense : false}
        >
          <ListItemText
            primary={
              <span
                title={item.tooltip ? item.tooltip : ''}
                className={item.tooltip ? classes.tooltip : ''}
              >
                {item.title}
                {item.tooltip ? (
                  <sup>
                    <Icon
                      className={clsx(
                        classes.tooltipIcon,
                        'fas',
                        'fa-info-circle'
                      )}
                    />
                  </sup>
                ) : null}
              </span>
            }
            className={classes.itemText}
          />
          <ListItemText
            className={classes.itemText}
            secondary={
              typeof item.value === 'function' ? item.value() : item.value
            }
          />
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
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default CustomList;
