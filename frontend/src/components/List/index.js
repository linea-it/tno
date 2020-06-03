import React from 'react';
import {
  List as MuiList,
  ListItem,
  ListItemText,
  Icon,
} from '@material-ui/core';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import useStyles from './styles';

function List({ data, height, width }) {
  const classes = useStyles();

  return (
    <MuiList className={classes.root} style={{ height, width }}>
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
    </MuiList>
  );
}

List.defaultProps = {
  height: 'auto',
  width: '100%',
};

List.propTypes = {
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default List;
