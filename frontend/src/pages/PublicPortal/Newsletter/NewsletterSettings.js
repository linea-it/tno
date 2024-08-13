import React, { useState, useEffect } from 'react'
import Grid from '@mui/material/Grid'
import Container from '@mui/material/Container'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Link from '@mui/material/Link'
import { getSubscriptionInfo } from '../../../services/api/Newsletter'
import SubscriptionStatus from './SubscriptionStatus'

function NewsletterSettings() {
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
            <Link color='inherit' to='/'>
              Home
            </Link>
            <Typography color='textPrimary'>Newsletter Settings</Typography>
          </Breadcrumbs>
        </Grid>
        <Grid item xs={12} mt={4} sx={{ textAlign: 'center' }}>
          <Typography color='textPrimary' variant='h4' gutterBottom>
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
            <CardHeader title='Assinatura' subheader='Ative ou desative o recebimento de emails.'></CardHeader>
            <CardContent>
              <SubscriptionStatus value={info?.unsubscribe} onChange={loadData} />
            </CardContent>
          </Card>
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
