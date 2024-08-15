import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Grid from '@mui/material/Grid'
import Container from '@mui/material/Container'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Link from '@mui/material/Link'
import Button from '@mui/material/Button'
import AddIcon from '@mui/icons-material/Add'
import { getSubscriptionInfo } from '../../../services/api/Newsletter'
import SubscriptionStatus from './SubscriptionStatus'
import DeleteAccount from './DeleteAccount'
import UserEventFilters from './UserEventFilters'

function NewsletterSettings() {
  const navigate = useNavigate()
  const [info, setInfo] = useState({ id: undefined, unsubscribe: false })

  const loadData = (e) => {
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
    <Container maxWidth='lg' sx={{ minHeight: 500 }}>
      <Grid container direction='row' justifyContent='center' alignItems='center'>
        <Grid item xs={12} mt={2}>
          <Breadcrumbs aria-label='breadcrumb'>
            <Link underline='hover' color='inherit' href='/'>
              Home
            </Link>
            <Typography color='text.primary'>Newsletter Settings</Typography>
          </Breadcrumbs>
        </Grid>
        <Grid item xs={12} mt={4} sx={{ textAlign: 'center' }}>
          <Typography color='text.primary' variant='h4' gutterBottom>
            Olá, {info?.email}
          </Typography>
        </Grid>
        <Grid item xs={12} mt={2}>
          <Card>
            <CardHeader
              title='Filtros e Configurações'
              subheader='Gerencie suas preferencias de filtro e frequencia dos emails.'
            ></CardHeader>
            <CardContent></CardContent>
          </Card>
        </Grid>
        {/* <Grid item xs={12} mt={2}>
          <Card>
            <CardContent>
              <NewsletterEventFiltersSettings subscriptionId={info.id} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} mt={2}>
          <EventFiltersResults subscriptionId={info.id}></EventFiltersResults>
        </Grid> */}
        <Grid item xs={12} mt={2}>
          <Card>
            <CardHeader
              title='Filtros'
              subheader='Gerencie suas preferencias de filtro e frequencia dos emails.'
              action={
                <Button variant='contained' color='primary' startIcon={<AddIcon />} onClick={handleAddFilterClick}>
                  New Filter
                </Button>
              }
            ></CardHeader>
            <CardContent>
              <UserEventFilters />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} mt={2}>
          <Card>
            <CardHeader title='Assinatura' subheader='Ative ou desative o recebimento de emails.'></CardHeader>
            <CardContent>
              <SubscriptionStatus value={info?.unsubscribe} onChange={loadData} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} mt={2}>
          <DeleteAccount />
        </Grid>
        {/* <Grid item xs={12} mt={2}>
          <Card>
            <CardHeader title='Assinatura' subheader='Ative ou desative o recebimento de emails.'></CardHeader>
            <CardContent>
              <Grid item xs={12}>
                <UpdateEmail subscriptionId={info.id} />
              </Grid>
            </CardContent>
          </Card>
        </Grid> */}
      </Grid>
    </Container>
  )
}

export default NewsletterSettings
