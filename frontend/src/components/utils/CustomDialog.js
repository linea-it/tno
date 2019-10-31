import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
}));

function CustomDialog({
  visible,
  setVisible,
  title,
  content,
  maxWidth,
  headerStyle,
  bodyStyle,
  wrapperStyle,
}) {
  const classes = useStyles();

  return (
    <Dialog onClose={setVisible} maxWidth={maxWidth} aria-labelledby="customized-dialog-title" open={visible} style={wrapperStyle}>
      <MuiDialogTitle className={clsx(classes.root, headerStyle)}>
        <Typography variant="h6" component="span">{title}</Typography>
        {visible ? (
          <IconButton aria-label="close" className={classes.closeButton} onClick={setVisible}>
            <CloseIcon />
          </IconButton>
        ) : null}
      </MuiDialogTitle>
      <DialogContent dividers className={bodyStyle}>
        {typeof content === 'function' ? (
          content()
        )
          : (
            <Typography gutterBottom>
              {content || content.props.data || content.props.data.length ? content : (
                'Unable to generate log due to a lack of data!'
              )}
            </Typography>
          )}
      </DialogContent>
    </Dialog>
  );
}

CustomDialog.defaultProps = {
  wrapperStyle: '',
};

CustomDialog.propTypes = {
  wrapperStyle: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
  ]),
};

export default CustomDialog;
