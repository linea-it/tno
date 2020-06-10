import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';

const useStyles = makeStyles({
  btn: {
    textTransform: 'capitalize',
    padding: '1px 5px',
    width: '7em',
    minHeight: '1em',
    display: 'block',
    textAlign: 'center',
    lineHeight: '2',
    boxShadow: `0px 1px 5px 0px rgba(0, 0, 0, 0.2),
    0px 2px 2px 0px rgba(0, 0, 0, 0.14),
    0px 3px 1px -2px rgba(0, 0, 0, 0.12)`,
    borderRadius: '4px',
    boxSizing: 'border-box',
  },
  btnSuccess: {
    backgroundColor: '#009900',
    color: '#fff',
  },
  btnFailure: {
    backgroundColor: '#ff1a1a',
    color: '#fff',
  },
  btnRunning: {
    backgroundColor: '#ffba01',
    color: '#000',
  },
  btnNotExecuted: {
    backgroundColor: '#ABA6A2',
    color: '#fff',
  },
  btnWarning: {
    backgroundColor: '#D79F15',
    color: '#FFF',
  },
});

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
