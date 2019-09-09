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
        <Typography variant="h6">{ title }</Typography>
        {visible ? (
          <IconButton aria-label="close" className={classes.closeButton} onClick={setVisible}>
            <CloseIcon />
          </IconButton>
        ) : null}
      </MuiDialogTitle>
      <DialogContent dividers>
        <Typography gutterBottom>
            Cras mattis consectetur purus sit amet fermentum. Cras justo odio, dapibus ac facilisis
            in, egestas eget quam. Morbi leo risus, porta ac consectetur ac, vestibulum at eros.
        </Typography>
        <Typography gutterBottom>
            Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Vivamus sagittis
            lacus vel augue laoreet rutrum faucibus dolor auctor.
        </Typography>
        <Typography gutterBottom>
            Aenean lacinia bibendum nulla sed consectetur. Praesent commodo cursus magna, vel
            scelerisque nisl consectetur et. Donec sed odio dui. Donec ullamcorper nulla non metus
            auctor fringilla.
        </Typography>
      </DialogContent>
    </Dialog>
  );
}

export default CustomDialog;
