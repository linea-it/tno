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


function CustomColumnStatus({ status, title }) {
  const classes = useStyles();

  let statusColor = classes.btnNotExecuted;

  switch (status) {
    case 'success':
      statusColor = classes.btnSuccess;
      break;
    case 'failure':
      statusColor = classes.btnFailure;
      break;
    case 'canceled':
      statusColor = classes.btnFailure;
      break;
    case 'warning':
      statusColor = classes.btnWarning;
      break;
    case 'running':
      statusColor = classes.btnRunning;
      break;
    default:
      statusColor = classes.btnNotExecuted;
  }
  return (
    <span
      className={clsx(classes.btn, statusColor)}
      title={title || status}
    >
      {status}
    </span>
  );
}

CustomColumnStatus.propTypes = {
  status: PropTypes.string.isRequired,
  title: PropTypes.string,
};

CustomColumnStatus.defaultProps = {
  title: null,
};

export default CustomColumnStatus;
