import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from 'react-query'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Link from '@mui/material/Link'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import Stack from '@mui/material/Stack'
import Alert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'
import { getSubscriptionInfo, unsubscribe, reactivateSubscription } from '../../../services/api/Newsletter'
import { CardHeader } from '../../../../node_modules/@mui/material/index'

function NewsletterSettings() {
  const { id } = useParams()

  const [info, setInfo] = useState({})
  const [unsubError, setUnsubError] = useState(false)
  const [activError, setActivError] = useState(false)

  useEffect(() => {
    getSubscriptionInfo(id).then((res) => {
      setInfo(res.data)
    })
  }, [id])

  // const { data, isLoading } = useQuery({
  //   queryKey: ['subscriptionInfo', { id: id }],
  //   queryFn: getSubscriptionInfo,
  //   keepPreviousData: true,
  //   refetchInterval: false,
  //   refetchOnWindowFocus: false,
  //   refetchOnmount: false,
  //   refetchOnReconnect: false,
  //   // retry: 1,
  //   staleTime: 1 * 60 * 60 * 1000
  // })

  const handleUnsubscribe = (e) => {
    unsubscribe(id)
      .then((res) => {
        // reload the current page
        window.location.reload()
      })
      .catch(function (error) {
        setUnsubError(true)
      })
  }

  const handleReactivate = (e) => {
    console.log('handleReactivate')

    reactivateSubscription(id)
      .then((res) => {
        // reload the current page
        window.location.reload()
      })
      .catch(function (error) {
        setActivError(true)
      })
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
          <Card sx={{ margin: '16px 0' }}>
            <CardHeader
              title='Filtros e Configurações'
              subheader='Gerencie suas preferencias de filtro e frequencia dos emails.'
            ></CardHeader>
            <CardContent></CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} mt={2}>
          <Card>
            <CardHeader title='Assinatura' subheader='Ative ou desative o recebimento de emails.'></CardHeader>
            <CardContent>
              <Stack spacing={2}>
                <FormControlLabel
                  required
                  control={
                    info?.is_active ? (
                      <Switch checked={true} onChange={handleUnsubscribe} />
                    ) : (
                      <Switch checked={false} onChange={handleReactivate} />
                    )
                  }
                  label='Receber emails'
                />
                {info?.is_active && (
                  <Alert variant='outlined' severity='success'>
                    Sua Assinatura está ativa e você recebera os emails conforme suas configurações de filtro.
                  </Alert>
                )}

                {!info?.is_active && (
                  <Alert variant='outlined' severity='warning'>
                    Sua Assinatura está inativa e você Não recebera nenhum email.
                  </Alert>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Snackbar
        open={unsubError}
        autoHideDuration={5000}
        onClose={() => setUnsubError(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity='error'>
          Falhou ao cancelar a inscrição tente novamente em alguns instantes ou entre em contato com o helpdesk.
        </Alert>
      </Snackbar>
      <Snackbar
        open={activError}
        autoHideDuration={5000}
        onClose={() => setActivError(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity='error'>
          Falhou ao Reativar a inscrição tente novamente em alguns instantes ou entre em contato com o helpdesk.
        </Alert>
      </Snackbar>
    </Container>
  )
}

export default NewsletterSettings
