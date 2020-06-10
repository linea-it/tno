import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

function Dashboard({ setTitle }) {
  useEffect(() => {
    setTitle('');
  }, [setTitle]);

  return <div />;
}

Dashboard.propTypes = {
  setTitle: PropTypes.func.isRequired,
};

export default Dashboard;
