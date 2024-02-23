import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack'

function ResultsCount({ isLoading, rowsCount }) {

  return (
    <Stack
      direction="row"
      spacing={1}
    >
      {isLoading ? (
        <CircularProgress size='1rem' />
      ) : (
        <Typography
          variant="body2"
          sx={{ mb: 2 }}
          color="text.secondary">
          {rowsCount}
        </Typography>
      )}
      <Typography
        variant="body2"
        sx={{ mb: 2 }}
        color="text.secondary">
        Occultation predictions found.
      </Typography>
    </Stack>
  );
}

ResultsCount.defaultProps = {
  isLoading: true,
  rowsCount: 0
}

ResultsCount.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  rowsCount: PropTypes.number.isRequired
};

export default ResultsCount
