import React, { useState } from 'react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import { delete_account, logout } from '../../../services/api/Auth'

export function ConfirmDialog({ open, handleClose }) {
  const [error, setError] = useState(false)

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        component: 'form',
        onSubmit: (event) => {
          event.preventDefault()
          const formData = new FormData(event.currentTarget)
          const formJson = Object.fromEntries(formData.entries())
          const email = formJson.email
          delete_account(email)
            .then(() => {
              logout()
            })
            .catch(() => {
              setError(true)
            })
        },
      }}
    >
      <DialogTitle>Delete account</DialogTitle>
      <DialogContent>
        <DialogContentText>
          This is permanent and cannot be undone. Enter your email to confirm.
        </DialogContentText>
        <TextField
          autoFocus
          required
          margin='dense'
          name='email'
          label='Email address'
          type='email'
          fullWidth
          variant='standard'
        />
        {error && (
          <Alert severity='error' sx={{ mt: 1 }}>
            Could not delete your account. Try again later or contact support.
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button type='submit' color='error'>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default function DeleteAccount() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Stack spacing={1} sx={{ pt: 2 }}>
        <Typography variant='subtitle2' color='text.secondary'>
          Danger zone
        </Typography>
        <Button
          variant='outlined'
          color='error'
          size='small'
          onClick={() => setIsOpen(true)}
          sx={{ alignSelf: 'flex-start' }}
        >
          Delete account
        </Button>
      </Stack>
      {isOpen && <ConfirmDialog open={isOpen} handleClose={() => setIsOpen(false)} />}
    </>
  )
}
