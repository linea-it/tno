import React from 'react'
import PropTypes from 'prop-types'
import { Dialog as MuiDialog, DialogTitle, DialogContent, IconButton, Typography } from '@material-ui/core'
import CloseIcon from '@mui/icons-material/Close';
import useStyles from './styles'

function Dialog({ visible, setVisible, title, content, maxWidth, headerStyle, bodyStyle, wrapperStyle }) {
  const classes = useStyles()

  return (
    <MuiDialog
      onClose={setVisible}
      maxWidth={maxWidth}
      fullWidth
      aria-labelledby='customized-dialog-title'
      open={visible}
      style={wrapperStyle}
    >
      <DialogTitle className={headerStyle}>
        <Typography variant='h6' component='span'>
          {title}
        </Typography>
        {visible ? (
          <IconButton className={classes.closeButton} aria-label='close' onClick={setVisible}>
            <CloseIcon />
          </IconButton>
        ) : null}
      </DialogTitle>
      <DialogContent dividers className={bodyStyle}>
        {typeof content === 'function'
          ? content()
          : content || content.props.data || content.props.data.length
          ? content
          : 'Unable to generate log due to a lack of data!'}
      </DialogContent>
    </MuiDialog>
  )
}

Dialog.defaultProps = {
  maxWidth: '100%',
  headerStyle: null,
  bodyStyle: null,
  wrapperStyle: null
}

Dialog.propTypes = {
  visible: PropTypes.bool.isRequired,
  setVisible: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  content: PropTypes.oneOfType([PropTypes.string, PropTypes.func, PropTypes.element]).isRequired,
  maxWidth: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  headerStyle: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  bodyStyle: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  wrapperStyle: PropTypes.oneOfType([PropTypes.string, PropTypes.object])
}

export default Dialog
