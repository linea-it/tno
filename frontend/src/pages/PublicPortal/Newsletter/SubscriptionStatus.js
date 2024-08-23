import React, { useState } from 'react'
import PropTypes from 'prop-types'
import Alert from '@mui/material/Alert'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import Stack from '@mui/material/Stack'
import Snackbar from '@mui/material/Snackbar'
import { unsubscribe, reactivateSubscription } from '../../../services/api/Newsletter'

export default function SubscriptionStatus({ value, onChange }) {
  const [unsubError, setUnsubError] = useState(false)
  const [activError, setActivError] = useState(false)

  const handleUnsubscribe = (e) => {
    unsubscribe()
      .then((res) => {
        onChange()
      })
      .catch(function (error) {
        setUnsubError(true)
      })
  }

  const handleReactivate = (e) => {
    reactivateSubscription()
      .then((res) => {
        onChange()
      })
      .catch(function (error) {
        setActivError(true)
      })
  }

  return (
    <>
      <Stack spacing={2}>
        <FormControlLabel
          required
          control={value ? <Switch checked={false} onChange={handleReactivate} /> : <Switch checked={true} onChange={handleUnsubscribe} />}
          label='Receive emails'
        />
        {!value && (
          <Alert variant='outlined' severity='success'>
            Your subscription is active, and you will receive emails based on your filter settings.
          </Alert>
        )}

        {value && (
          <Alert variant='outlined' severity='warning'>
            Your subscription is inactive, and you won't receive any emails.
          </Alert>
        )}
      </Stack>

      {unsubError && (
        <Snackbar
          open={true}
          autoHideDuration={5000}
          onClose={() => setUnsubError(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity='error'>Failed to unsubscribe. Please try again in a few moments or contact support.</Alert>
        </Snackbar>
      )}

      {activError && (
        <Snackbar
          open={true}
          autoHideDuration={5000}
          onClose={() => setActivError(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity='error'>Failed to reactivate subscription. Please try again in a few moments or contact support.</Alert>
        </Snackbar>
      )}
    </>
  )
}

SubscriptionStatus.defaultProps = {
  value: false
}
SubscriptionStatus.propTypes = {
  value: PropTypes.bool,
  onChange: PropTypes.func.isRequired
}
