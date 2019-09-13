import React, { useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';

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
}) {
  const classes = useStyles();

  return (
    <Dialog onClose={setVisible} aria-labelledby="customized-dialog-title" open={visible}>
      <MuiDialogTitle disableTypography className={classes.root}>
        <Typography variant="h6">{title}</Typography>
        {visible ? (
          <IconButton aria-label="close" className={classes.closeButton} onClick={setVisible}>
            <CloseIcon />
          </IconButton>
        ) : null}
      </MuiDialogTitle>
      <DialogContent dividers>
        <Typography gutterBottom>
          {content}
        </Typography>
        <Typography gutterBottom>

        </Typography>
        <Typography gutterBottom>

        </Typography>
      </DialogContent>
    </Dialog>
  );
}

export default CustomDialog;
