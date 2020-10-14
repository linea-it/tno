import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { LinearProgress, Box, Typography } from '@material-ui/core';
import useStyles from './styles';

function Progress({ title, variant, total, current }) {
  const classes = useStyles();
  const [currentPercentage, setCurrentPercentage] = useState(0);

  useEffect(() => {
    const percentage = (current * 100) / total;
    const value = !isNaN(percentage) ? percentage : 0;

    setCurrentPercentage(value);
  }, [total, current]);

  return (
    <>
      <Typography variant="body1">{title}</Typography>
      <Box display="flex" alignItems="center">
        <Box width="100%" mr={1}>
          <LinearProgress
            classes={classes}
            variant={variant}
            value={currentPercentage}
          />
        </Box>
        <Box minWidth={35}>
          <Typography variant="body2" color="textSecondary">
            {`${Math.floor(currentPercentage)}%`}
          </Typography>
        </Box>
      </Box>
    </>
  );
}

Progress.propTypes = {
  title: PropTypes.string,
  variant: PropTypes.string,
  total: PropTypes.number.isRequired,
  current: PropTypes.number.isRequired,
};

Progress.defaultProps = {
  title: '',
  variant: 'indeterminate',
};

export default Progress;
