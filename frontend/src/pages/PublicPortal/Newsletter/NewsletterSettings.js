import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Link from '@mui/material/Link'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import AddIcon from '@mui/icons-material/Add'
import { getSubscriptionInfo } from '../../../services/api/Newsletter'
import SubscriptionStatus from './SubscriptionStatus'
import DeleteAccount from './DeleteAccount'
import UserEventFilters from './UserEventFilters'

function NewsletterSettings() {
  const navigate = useNavigate()
  const [info, setInfo] = useState({ id: undefined, unsubscribe: false })

  const loadData = () => {
    getSubscriptionInfo()
      .then((res) => {
        setInfo(res.data)
      })
      .catch((res) => {
        if (res.response.status === 401) {
          window.location.replace('/login')
        }
      })
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleAddFilterClick = (e) => {
    e.preventDefault()
    navigate('/new_event_filter/')
  }

  if (!('email' in info)) {
    return (
      <Container maxWidth='lg' sx={{ minHeight: 500 }}>
        Loading...
      </Container>
    )
  }

  return (
    <Container maxWidth='lg' sx={{ minHeight: 500, py: 4 }}>
      <Stack spacing={4}>
        <Breadcrumbs aria-label='breadcrumb'>
          <Link underline='hover' color='inherit' href='/'>
            Home
          </Link>
          <Typography color='text.primary'>Newsletter Settings</Typography>
        </Breadcrumbs>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent='space-between' alignItems={{ xs: 'flex-start', sm: 'center' }}>
          <Typography variant='body2' color='text.secondary'>
            Signed in as <strong style={{ color: 'inherit' }}>{info?.email}</strong>
          </Typography>
          <SubscriptionStatus value={info?.unsubscribe} onChange={loadData} />
        </Stack>

        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent='space-between' alignItems={{ xs: 'flex-start', sm: 'center' }}>
            <Typography variant='subtitle1' fontWeight={500}>
              Your Filters
            </Typography>
            <Button variant='contained' size='small' startIcon={<AddIcon />} onClick={handleAddFilterClick}>
              New Filter
            </Button>
          </Stack>
          <UserEventFilters />
        </Stack>

        <DeleteAccount />
      </Stack>
    </Container>
  )
}

export default NewsletterSettings
