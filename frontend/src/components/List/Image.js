import React from 'react';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/styles';
import { Card, CardContent, CardHeader } from '@material-ui/core';
import PropTypes from 'prop-types';

function CustomGridList({ data, baseUrl, handleImageClick }) {
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
        {data.map((row, i) => {
          // eslint-disable-next-line radix
          const asteroidName =
            parseInt(row.asteroid_number) > 0
              ? `${row.asteroid_name} (${row.asteroid_number})`
              : row.asteroid_name;

          return (
            <Grid key={i} item xs={12} xl={4} lg={6} md={4}>
              <Card>
                <CardHeader title={`${row.date_time} - ${asteroidName}`} />
                <CardContent>
                  <img
                    src={baseUrl + row.src}
                    className={classes.occMapImg}
                    alt={asteroidName}
                    onClick={() => handleImageClick(row.id)}
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
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  baseUrl: PropTypes.string,
  handleImageClick: PropTypes.func,
};

export default CustomGridList;
