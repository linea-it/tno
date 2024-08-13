import React, { useState, useEffect } from 'react'
import Grid from '@mui/material/Grid'
import Container from '@mui/material/Container'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Link from '@mui/material/Link'
import Switch from '@mui/material/Switch'
import Divider from '@mui/material/Divider'
import FormControlLabel from '@mui/material/FormControlLabel'
import Stack from '@mui/material/Stack'
import Alert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'
import EventFiltersResults from './EventFiltersResults'
import NewsletterEventFiltersSettings from '../../../components/Newsletter/index'
import { getSubscriptionInfo, unsubscribe, reactivateSubscription, listPreferenceEventFilters } from '../../../services/api/Newsletter'
import UpdateEmail from '../../../components/Newsletter/UpdateEmail'
import SubscriptionStatus from './SubscriptionStatus'

function NewsletterSettings() {
  const [info, setInfo] = useState({ id: undefined, unsubscribe: false })
  const [unsubError, setUnsubError] = useState(false)
  const [activError, setActivError] = useState(false)

  const loadData = (e) => {
    console.log('loadData')
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

  // const handleUnsubscribe = (e) => {
  //   console.log('handleUnsubscribe')
  //   // TODO: Alterar o backend para desiscrever o usuario logado.
  //   unsubscribe()
  //     .then((res) => {
  //       console.log('res', res)
  //       // reload the current page
  //       // window.location.reload()
  //       loadData()
  //     })
  //     .catch(function (error) {
  //       setUnsubError(true)
  //     })
  // }

  // const handleReactivate = (e) => {
  //   console.log('handleReactivate')
  //   reactivateSubscription()
  //     .then((res) => {
  //       loadData()
  //     })
  //     .catch(function (error) {
  //       setActivError(true)
  //     })
  // }

  if (!('email' in info)) {
    return (
      <Container maxWidth='lg' sx={{ minHeight: 500 }}>
        Loading...
      </Container>
    )
  }

  console.log('info', info)
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
