import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import useStyles from './styles';

function ColumnStatus({ status, title }) {
  const classes = useStyles();

  let statusColor = classes.btnNotExecuted;
  let statusTitle = '';

  if (status === 'idle' || status === 1) {
    statusTitle = 'Idle';
    statusColor = classes.btnNotExecuted;
  } else if (status === 'running' || status === 2) {
    statusTitle = 'Running';
    statusColor = classes.btnRunning;
  } else if (status === 'success' || status === 3) {
    statusTitle = 'Success';
    statusColor = classes.btnSuccess;
  } else if (status === 'failed' || status === 4) {
    statusTitle = 'Failed';
    statusColor = classes.btnFailure;
  } else if (status === 'aborted' || status === 5) {
    statusTitle = 'Aborted';
    statusColor = classes.btnFailure;
  } else if (status === 'stopped' || status === 6) {
    statusTitle = 'Stopped';
    statusColor = classes.btnWarning;
  } else {
    statusTitle = 'Unknown';
    statusColor = classes.btnNotExecuted;
  }

  return (
    <span className={clsx(classes.btn, statusColor)} title={title || status}>
      {statusTitle}
    </span>
  );
}

ColumnStatus.propTypes = {
  status: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  title: PropTypes.string,
};

ColumnStatus.defaultProps = {
  title: null,
};

export default ColumnStatus;
