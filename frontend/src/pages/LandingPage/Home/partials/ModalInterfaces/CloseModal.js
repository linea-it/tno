/* eslint-disable react/prop-types */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/prefer-stateless-function */
import React, { Component } from 'react'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import { withStyles } from '@mui/material/styles'

const styles = {
  btnIco: {
    float: 'right'
  }
}

class CloseModal extends Component {
  render() {
    return (
      <IconButton
        sx={styles.btnIco}
        edge='start'
        color='inherit'
        onClick={() => {
          this.props.callbackParent()
        }}
        aria-label='close'
      >
        <CloseIcon />
      </IconButton>
    )
  }
}
export default withStyles(styles)(CloseModal)
