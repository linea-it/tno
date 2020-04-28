import React from 'react';
import PropTypes from 'prop-types';

function CustomLog({ data }) {
  return (
    <pre style={{ border: 'none' }}>
      {data ? data.map((line) => <div style={{ whiteSpace: 'normal' }}>{line}</div>) : null}
    </pre>
  );
}

CustomLog.propTypes = {
  data: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default CustomLog;
