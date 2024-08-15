import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import Grid from '@mui/material/Grid'
import Container from '@mui/material/Container'
import Link from '@mui/material/Link'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import Button from '@mui/material/Button'
import EventFilterForm from './EventFilterForm'
import { getUserEventFilterbById, userEventFilterbUpdate, userEventFilterbCreate } from '../../../services/api/Newsletter'
import { Box } from '../../../../node_modules/@mui/material/index'

function EventFilterDetail() {
  const navigate = useNavigate()
  const { id } = useParams()

  const default_data = {
    id: undefined,
    filter_name: '',
    description: '',
    frequency: 1,
    magnitude_min: 15,
    magnitude_max: 15,
    filter_type: 'name',
    filter_value: '',
    local_solar_time_after: null,
    local_solar_time_before: null,
    magnitude_drop_min: null,
    magnitude_drop_max: null,
    event_duration: null,
    diameter_min: null,
    diameter_max: null,
    latitude: null,
    longitude: null,
    altitude: null,
    location_radius: null
  }

  const [initialData, setinitialData] = useState(default_data)
  const [currentData, setCurrentData] = useState(default_data)

  const loadData = (id) => {
    getUserEventFilterbById({ id: id })
      .then((res) => {
        setCurrentData(res.data)
        setinitialData(res.data)
      })
      .catch((res) => {
        console.log('Falhou ao Carregar os dados', res)
      })
  }

  useEffect(() => {
    if (id !== undefined) {
      loadData(id)
    }
  }, [id])

  const handleChange = (newData) => {
    setCurrentData(newData)
  }

  const toPreferences = () => {
    navigate('/newsletter_settings/')
  }

  const handleCancel = () => {
    toPreferences()
  }

  const handleCreate = () => {
    userEventFilterbCreate({ data: currentData })
      .then((res) => {
        toPreferences()
      })
      .catch((res) => {
        console.log('Falhou ao criar o filtro', res)
      })
  }

  const handleUpdate = () => {
    userEventFilterbUpdate({ id: id, data: currentData })
      .then((res) => {
        setinitialData(res.data)
        setCurrentData(res.data)
      })
      .catch((res) => {
        console.log('Falhou ao atualizar')
      })
  }

  return (
    <Container maxWidth='lg' sx={{ minHeight: 'calc(100vh - 320px)' }}>
      <Grid container direction='row' justifyContent='center' alignItems='center'>
        <Grid item xs={12} mt={2}>
          <Breadcrumbs aria-label='breadcrumb'>
            <Link underline='hover' color='inherit' href='/'>
              Home
            </Link>
            <Link underline='hover' color='inherit' href='/newsletter_settings/'>
              Newsletter Settings
            </Link>
            {id === undefined && <Typography color='text.primary'>New Event Filter</Typography>}
            {id !== undefined && <Typography color='text.primary'>Event Filter Detail</Typography>}
          </Breadcrumbs>
        </Grid>
        <Grid item xs={12} mt={4}>
          <Card>
            <CardHeader
              title={id === undefined ? 'New Event Filter' : 'Event Filter Detail'}
              subheader='Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. '
            ></CardHeader>
            <CardContent>
              <EventFilterForm data={currentData} onChange={handleChange} />
            </CardContent>
            <CardActions>
              <Box sx={{ flexGrow: 1 }}></Box>
              <Button onClick={handleCancel}>Cancel</Button>
              {id === undefined && (
                <Button onClick={handleCreate} disabled={currentData === initialData}>
                  Save
                </Button>
              )}
              {id !== undefined && (
                <Button onClick={handleUpdate} disabled={currentData === initialData}>
                  Update
                </Button>
              )}
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Container>
  )
}

export default EventFilterDetail
