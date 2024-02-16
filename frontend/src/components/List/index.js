import React from 'react'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Icon from '@mui/material/Icon'
import { List as MuiList } from '@mui/material'

import PropTypes from 'prop-types'
import useStyles from './styles'

function List({ data, height, width, align }) {
  const classes = useStyles({ align });

  return (
    <MuiList className={classes.root} sx={{ height, width }}>
      {data.map((item, i, arr) => {
        // Verifica se item.value é uma string que contém a palavra "null" ou se o valor é "null"
        if ((typeof item.value === 'string' && item.value.includes('null')) || item.value === 'null') {
          return null; // Pula a renderização se "null" for encontrado na string ou se o item for "null"
        }

        return (
          <ListItem key={i} divider={i !== arr.length - 1} dense={item.dense ? item.dense : false}>
            <ListItemText
              primary={
                <span title={item.tooltip ? item.tooltip : ''} className={item.tooltip ? classes.tooltip : ''}>
                  {item.title}
                  {item.tooltip ? (
                    <sup>
                      <Icon className={`${classes.tooltipIcon} fas fa-info-circle`} />
                    </sup>
                  ) : null}
                </span>
              }
              className={classes.itemText}
            />
            <ListItemText
              className={`${classes.itemText} ${classes.itemValueText}`}
              secondary={typeof item.value === 'function' ? item.value() : item.value}
            />
          </ListItem>
        );
      })}
    </MuiList>
  );
}



List.defaultProps = {
  height: 'auto',
  width: '100%',
  align: 'right'
}

List.propTypes = {
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  align: PropTypes.string
}

export default List
