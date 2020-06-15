import React from 'react';
import PropTypes from 'prop-types';

function ColumnStatus({ status, title }) {
  let statusTitle = '';

  if (status === 'idle' || status === 1) {
    statusTitle = 'Idle';
  } else if (status === 'running' || status === 2) {
    statusTitle = 'Running';
  } else if (status === 'success' || status === 3) {
    statusTitle = 'Success';
  } else if (status === 'failed' || status === 4) {
    statusTitle = 'Failed';
  } else if (status === 'aborted' || status === 5) {
    statusTitle = 'Aborted';
  } else if (status === 'stopped' || status === 6) {
    statusTitle = 'Stopped';
  } else {
    statusTitle = 'Unknown';
  }

  return <span title={title || status}>{statusTitle}</span>;
}

ColumnStatus.propTypes = {
  status: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  title: PropTypes.string,
};

ColumnStatus.defaultProps = {
  title: null,
};

export default ColumnStatus;
