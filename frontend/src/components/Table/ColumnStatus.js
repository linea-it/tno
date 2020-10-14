import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import useStyles from './styles';

function ColumnStatus({ status, title, align }) {
  const classes = useStyles({ align });

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
  } else if (status === 'failed' || status === 'failure' || status === 4) {
    statusTitle = 'Failed';
    statusColor = classes.btnFailure;
  } else if (status === 'aborted' || status === 5) {
    statusTitle = 'Aborted';
    statusColor = classes.btnAborted;
  } else if (status === 'warning' || status === 6) {
    statusTitle = 'Warning';
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
  align: PropTypes.string,
};

ColumnStatus.defaultProps = {
  title: null,
  align: 'left',
};

export default ColumnStatus;
