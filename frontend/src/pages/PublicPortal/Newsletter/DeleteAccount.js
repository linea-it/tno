import React, { useState } from 'react'
import Alert from '@mui/material/Alert'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import { delete_account, logout } from '../../../services/api/Auth'

export function ConfirmDialog({ open, handleClose }) {
  const [error, setError] = useState(false)
  return (
    <>
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
          }
        }}
      >
        <DialogTitle>Confirm</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to delete your account? Enter your email and click delete account.</DialogContentText>
          <TextField
            autoFocus
            required
            margin='dense'
            id='name'
            name='email'
            label='Email Address'
            type='email'
            fullWidth
            variant='standard'
          />
          {error && (
            <Alert severity='error'>
              There was an error and it was not possible to delete the account, please try again in a few moments and if the problem
              persists contact the helpdesk.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type='submit' color='error'>
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default function DeleteAccount() {
  const [isOpen, setIsOpen] = useState(false)

  const handleConfirm = (e) => {
    e.preventDefault()
    setIsOpen(true)
  }
  return (
    <>
      <Card>
        <CardHeader
          title='Delete Account'
          subheader='Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.'
          titleTypographyProps={{
            sx: {
              color: 'red'
            }
          }}
        ></CardHeader>
        <CardContent>
          <Button variant='outlined' color='error' onClick={handleConfirm}>
            Delete your account
          </Button>
        </CardContent>
      </Card>
      {isOpen && <ConfirmDialog open={isOpen} handleClose={() => setIsOpen(false)} />}
    </>
  )
}
