import React from 'react';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/styles';
import {
  Card, CardContent, CardHeader,
} from '@material-ui/core';
import PropTypes from 'prop-types';

function CustomGridList({
  tileData,
  baseUrl,
  handleImageClick,
}) {
  const useStyles = makeStyles({
    occMapImg: {
      width: '100%',
      cursor: handleImageClick !== null ? 'pointer' : 'normal',
    },
  });

  const classes = useStyles();

  return (
    <>
      <Grid container spacing={2}>
        {tileData.map((tile) => {
          // eslint-disable-next-line radix
          const asteroidName = parseInt(tile.asteroid_number) > 0
            ? `${tile.asteroid_name} (${tile.asteroid_number})`
            : tile.asteroid_name;

          return (
            <Grid item xs={12} md={4}>
              <Card>
                <CardHeader title={`${tile.date_time} - ${asteroidName}`} />
                <CardContent>
                  <img
                    src={baseUrl + tile.src}
                    className={classes.occMapImg}
                    alt={asteroidName}
                    onClick={() => handleImageClick(tile.id)}
                  />
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </>
  );
}

CustomGridList.defaultProps = {
  baseUrl: '',
  handleImageClick: null,
};

CustomGridList.propTypes = {
  tileData: PropTypes.arrayOf(
    PropTypes.object,
  ).isRequired,
  baseUrl: PropTypes.string,
  handleImageClick: PropTypes.func,
};


export default CustomGridList;
