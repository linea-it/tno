import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

function Download({ setTitle }) {
  useEffect(() => {
    setTitle('Download');
  }, [setTitle]);

  return <h1>Download</h1>;
}

Download.propTypes = {
  setTitle: PropTypes.func.isRequired,
};

export default Download;
