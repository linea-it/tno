import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Grid } from '@material-ui/core';
import Skybot from './Skybot';

function Dashboard({ setTitle }) {
  useEffect(() => {
    setTitle('Dashboard');
  }, [setTitle]);

  return (
    <Grid container spacing={2} alignItems="stretch">
      <Grid item xs={12}>
        <Skybot />
      </Grid>
    </Grid>
  );
}

Dashboard.propTypes = {
  setTitle: PropTypes.func.isRequired,
};

export default Dashboard;
