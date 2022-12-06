import React from 'react'
import PropTypes from 'prop-types'
import clsx from 'clsx'
import { amber, green } from '@material-ui/core/colors'
import { makeStyles } from '@material-ui/core/styles'
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Close as CloseIcon,
  Warning as WarningIcon
} from '@material-ui/icons'
import { Snackbar as MuiSnackbar, SnackbarContent, IconButton } from '@material-ui/core'

const variantIcon = {
  success: CheckCircleIcon,
  warning: WarningIcon,
  error: ErrorIcon,
  info: InfoIcon
}

const useStyles = makeStyles((theme) => ({
  success: {
    backgroundColor: green[600]
  },
  error: {
    backgroundColor: theme.palette.error.dark
  },
  info: {
    backgroundColor: theme.palette.primary.main
  },
  warning: {
    backgroundColor: amber[700]
  },
  icon: {
    fontSize: 20
  },
  iconVariant: {
    opacity: 0.9,
    marginRight: theme.spacing(1)
  },
  message: {
    display: 'flex',
    alignItems: 'center'
  }
}))

function Snackbar(props) {
  const classes = useStyles()
  const { className, message, onClose, variant, ...other } = props

  const Icon = variantIcon[variant]

  return (
    <MuiSnackbar {...other}>
      <SnackbarContent
        className={clsx(classes[variant], className)}
        aria-describedby='client-snackbar'
        message={
          <span id='client-snackbar' className={classes.message}>
            <Icon className={clsx(classes.icon, classes.iconVariant)} />
            {message}
          </span>
        }
        action={[
          <IconButton key='close' aria-label='close' color='inherit' onClick={onClose}>
            <CloseIcon className={classes.icon} />
          </IconButton>
        ]}
        {...other}
      />
    </MuiSnackbar>
  )
}

Snackbar.defaultProps = {
  className: ''
}

Snackbar.propTypes = {
  className: PropTypes.string,
  message: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  variant: PropTypes.oneOf(['error', 'info', 'success', 'warning']).isRequired
}

export default Snackbar
