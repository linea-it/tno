/* eslint-disable react/no-this-in-sfc */
/* eslint-disable react/prop-types */
/* eslint-disable react/destructuring-assignment */
import React from 'react'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import styles from './styles'
import CloseModal from './CloseModal'

export default function DialogCard(props) {
  const classes = styles()
  const [open, setOpen] = React.useState(false)
  const interfacesHost = process.env.REACT_APP_INTERFACES_HOST
  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  return (
    <div>
      <Button size='small' color='primary' className={classes.action} onClick={handleClickOpen}>
        Learn More
      </Button>
      <Dialog open={open} onClose={handleClose} aria-labelledby='alert-dialog-title' aria-describedby='alert-dialog-description'>
        <DialogTitle id='alert-dialog-title'>
          {props.item.title}
          <CloseModal callbackParent={() => handleClose()} />
        </DialogTitle>
        <DialogContent>
          <DialogContentText id='alert-dialog-description'>{props.item.description}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            href={props.item.url || interfacesHost + props.item.pathname}
            target={props.item.url ? '_blanc' : '_self'}
            color='primary'
            autoFocus
          >
            Entry
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
