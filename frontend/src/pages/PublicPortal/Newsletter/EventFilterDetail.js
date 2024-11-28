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
import { listAllAsteroidsByName } from '../../../services/api/Asteroid' // Adjust the path if needed
import { Box } from '../../../../node_modules/@mui/material/index'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

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
    magnitude_min: null,
    magnitude_max: null,
    filter_type: '',
    filter_value: null,
    magnitude_drop_min: null,
    magnitude_drop_max: null,
    solar_time_enabled: false,
    local_solar_time_after: dayjs().set('hour', 18).startOf('hour'),
    local_solar_time_before: dayjs().set('hour', 6).startOf('hour'),
    event_duration: undefined,
    diameter_min: undefined,
    diameter_max: undefined,
    closest_approach_uncertainty_km: undefined,
    latitude: undefined,
    longitude: undefined,
    location_radius: undefined,
    altitude: undefined
  }

  const [initialData, setinitialData] = useState(default_data)
  const [currentData, setCurrentData] = useState(default_data)

  const loadData = (id) => {
    getUserEventFilterbById({ id: id })
      .then(async (res) => {
        const data = res.data
        if (data.filter_type === 'name' && typeof data.filter_value === 'string') {
          const asteroidNames = data.filter_value.split(',').map((name) => name.trim())
          // console.log('Asteroid names:', asteroidNames)

          // Fetch full asteroid data for each name in the array
          const asteroidObjects = await Promise.all(
            asteroidNames.map(async (name) => {
              try {
                const response = await listAllAsteroidsByName({ name })
                const asteroidObject = Array.isArray(response) ? response[0] : undefined
                if (!asteroidObject) {
                  console.warn(`No valid data found for asteroid: ${name}`)
                }
                return asteroidObject
              } catch (error) {
                console.error(`Error fetching data for asteroid ${name}:`, error)
                return undefined
              }
            })
          )
          // console.log('Asteroid objects:', asteroidObjects)

          // Filter out any undefined values in case of errors
          data.filter_value = asteroidObjects.filter(Boolean)
        }

        // Only parse as dayjs objects if values are not null or empty
        data.local_solar_time_after = data.local_solar_time_after ? dayjs(data.local_solar_time_after, 'HH:mm') : null
        data.local_solar_time_before = data.local_solar_time_before ? dayjs(data.local_solar_time_before, 'HH:mm') : null

        setCurrentData(data)
        setinitialData(data)
      })
      .catch((error) => {
        console.error('Failed to load data', error)
      })
  }

  useEffect(() => {
    if (id !== undefined) {
      loadData(id)
    }
  }, [id])

  const handleChange = (newData) => {
    console.log('handleChange received newData:', newData) // Log incoming data to handleChange
    setCurrentData((prevData) => {
      const updatedData = Object.fromEntries(
        Object.entries(newData).filter(([key, value]) => {
          if (['latitude', 'longitude', 'location_radius', 'altitude'].includes(key)) {
            return true
          }
          return value !== undefined
        })
      )
      console.log('Updated data in handleChange:', updatedData) // Log final data before updating state
      return {
        ...prevData,
        ...updatedData
      }
    })
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
