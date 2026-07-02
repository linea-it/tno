import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Link from '@mui/material/Link'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import EventFilterForm from './EventFilterForm'
import { getUserEventFilterbById, userEventFilterbUpdate, userEventFilterbCreate } from '../../../services/api/Newsletter'
import { listAllAsteroidsByName } from '../../../services/api/Asteroid'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

const defaultData = {
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
  altitude: undefined,
}

function EventFilterDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isNew = id === undefined

  const [initialData, setInitialData] = useState(defaultData)
  const [currentData, setCurrentData] = useState(defaultData)

  const loadData = (filterId) => {
    getUserEventFilterbById({ id: filterId })
      .then(async (res) => {
        const data = res.data
        if (data.filter_type === 'name' && typeof data.filter_value === 'string') {
          const asteroidNames = data.filter_value.split(',').map((name) => name.trim())
          const asteroidObjects = await Promise.all(
            asteroidNames.map(async (name) => {
              try {
                const response = await listAllAsteroidsByName({ name })
                return Array.isArray(response) ? response[0] : undefined
              } catch {
                return undefined
              }
            })
          )
          data.filter_value = asteroidObjects.filter(Boolean)
        }
        data.local_solar_time_after = data.local_solar_time_after ? dayjs(data.local_solar_time_after, 'HH:mm') : null
        data.local_solar_time_before = data.local_solar_time_before ? dayjs(data.local_solar_time_before, 'HH:mm') : null
        setCurrentData(data)
        setInitialData(data)
      })
      .catch(() => {
        // Silencioso — dados exibidos em branco; opcional: mostrar toast
      })
  }

  useEffect(() => {
    if (id !== undefined) {
      loadData(id)
    }
  }, [id])

  const handleChange = (newData) => {
    setCurrentData((prevData) => {
      const updatedData = Object.fromEntries(
        Object.entries(newData).filter(([key, value]) => {
          if (['latitude', 'longitude', 'location_radius', 'altitude'].includes(key)) return true
          return value !== undefined
        })
      )
      return { ...prevData, ...updatedData }
    })
  }

  const handleSave = () => {
    const action = isNew
      ? userEventFilterbCreate({ data: currentData })
      : userEventFilterbUpdate({ id, data: currentData })

    action
      .then(() => navigate('/newsletter_settings/'))
      .catch(() => {
        // Silencioso — navegação não ocorre, usuário vê o formulário ainda
      })
  }

  const hasChanges = JSON.stringify(currentData) !== JSON.stringify(initialData)

  return (
    <Container maxWidth='md' sx={{ minHeight: 500, py: 4 }}>
      <Stack spacing={4}>
        <Breadcrumbs aria-label='breadcrumb'>
          <Link underline='hover' color='inherit' href='/'>
            Home
          </Link>
          <Link underline='hover' color='inherit' href='/newsletter_settings/'>
            Newsletter Settings
          </Link>
          <Typography color='text.primary'>{isNew ? 'New Filter' : 'Edit Filter'}</Typography>
        </Breadcrumbs>

        <Typography variant='h5' fontWeight={500}>
          {isNew ? 'New Filter' : 'Edit Filter'}
        </Typography>

        <EventFilterForm data={currentData} onChange={handleChange} />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, pt: 2 }}>
          <Button onClick={() => navigate('/newsletter_settings/')}>
            Cancel
          </Button>
          <Button variant='contained' disabled={!hasChanges} onClick={handleSave}>
            {isNew ? 'Create Filter' : 'Save Changes'}
          </Button>
        </Box>
      </Stack>
    </Container>
  )
}

export default EventFilterDetail
