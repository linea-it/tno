import React from 'react'
import { List as MuiList, ListItem, ListItemText, Typography } from '@material-ui/core'
import PropTypes from 'prop-types'
import useStyles from './styles'

function List({ data, height, width, align }) {
  const classes = useStyles({ align });

  return (
    <MuiList className={classes.root} style={{ height, width }}>
      {data.map((item, i, arr) => {
        // Verifica se item.value é uma string que contém a palavra "null" ou se o valor é "null"
        if ((typeof item.value === 'string' && item.value.includes('null')) || item.value === 'null') {
          return null; // Pula a renderização se "null" for encontrado na string ou se o item for "null"
        }

        return (
          <ListItem key={i} divider={i !== arr.length - 1} dense={item.dense ? item.dense : false}>
            <ListItemText
              primary={
                <div>
                  <Typography variant="subtitle1">{item.title}</Typography>
                  {item.message && <Typography variant="caption" style={{ fontSize: '0.8rem', color: '#9e9e9e' }}>{item.message}</Typography>}
                </div>
              }
              className={classes.itemText}
            />
            <Typography variant="body1" style={{ color: '#757575' }}>{item.value}</Typography>
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
