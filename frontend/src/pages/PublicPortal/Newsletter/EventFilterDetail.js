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
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { data } from '../../../../node_modules/browserslist/index'
dayjs.extend(utc)
dayjs.extend(timezone)

function EventFilterDetail() {
  const navigate = useNavigate()
  const { id } = useParams()

  const default_data = {
    id: undefined,
    filter_name: '',
    description: '',
    frequency: 1,
    magnitude_min: 4,
    magnitude_max: 18,
    filter_type: 'name',
    filter_value: '',
    magnitude_drop_min: 4,
    magnitude_drop_max: 18,
    solar_time_enabled: false,
    local_solar_time_after: dayjs().set('hour', 18).startOf('hour'),
    local_solar_time_before: dayjs().set('hour', 6).startOf('hour'),
    event_duration: undefined,
    diameter_min: undefined,
    diameter_max: undefined,
    latitude: null,
    longitude: null,
    location_radius: 100,
    altitude: null
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
        console.log('Failed to load data', res)
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
        console.log('Failed to create the filter', res)
      })
  }

  const handleUpdate = () => {
    userEventFilterbUpdate({ id: id, data: currentData })
      .then((res) => {
        setinitialData(res.data)
        setCurrentData(res.data)
        toPreferences()
      })
      .catch((res) => {
        console.log('Failed to update the filter')
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
            {id === undefined && <Typography color='text.primary'>New Filter</Typography>}
            {id !== undefined && <Typography color='text.primary'>Filter Details</Typography>}
          </Breadcrumbs>
        </Grid>
        <Grid item xs={12} mt={4}>
          <Card>
            <CardHeader
              title={id === undefined ? 'Create New Filter' : 'Filter Details'}
              subheader='Please configure the event filter according to your preferences and save the settings.'
            ></CardHeader>
            <CardContent>
              {console.log('currentdata', currentData)}
              <EventFilterForm data={currentData} onChange={handleChange} />
            </CardContent>
            <CardActions>
              <Box sx={{ flexGrow: 1 }}></Box>
              <Button onClick={handleCancel}>Discard Changes</Button>
              {id === undefined && (
                <Button onClick={handleCreate} disabled={currentData === initialData}>
                  Save Filter
                </Button>
              )}
              {id !== undefined && (
                <Button onClick={handleUpdate} disabled={currentData === initialData}>
                  Update Filter
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
