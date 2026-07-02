import React from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import Skeleton from '@mui/material/Skeleton'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import AssessmentIcon from '@mui/icons-material/Assessment'
import { useQuery } from 'react-query'
import { getHighlightsUniqueAsteroids } from '../../services/api/Occultation'
import moment from 'moment'
import AlertGenericError from '../AlertGenericError/index'

function UniqueAsteroids() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['highlightsUniqueAsteroids'],
    queryFn: getHighlightsUniqueAsteroids,
    keepPreviousData: true,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: 1 * 60 * 60 * 1000
  })

  if (isLoading) return <Skeleton variant='rectangular' width='100%' height={180} />

  if (isError)
    return (
      <Box sx={{ height: 180 }}>
        <AlertGenericError />
      </Box>
    )

  return (
    <Card sx={{ borderRadius: '10px', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CardHeader
        avatar={<AssessmentIcon color='primary' />}
        title='TOTAL FORECAST'
        titleTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
      />
      <CardContent sx={{ flex: 1, pt: 0 }}>
        <Stack spacing={2}>
          <Box>
            <Typography variant='h4' sx={{ fontWeight: 700, color: 'primary.main' }}>
              {data?.count?.toLocaleString('en-US')}
            </Typography>
          </Box>
          <Stack spacing={0.5}>
            <Typography variant='body2'>
              <strong>Unique Asteroids:</strong> {data?.unique_asteroids?.toLocaleString('en-US')}
            </Typography>
            {data?.earliest !== undefined && (
              <Typography variant='body2'>
                <strong>Earliest:</strong> {moment(data?.earliest).utc().format('DD MMM YYYY HH:mm')} UTC
              </Typography>
            )}
            {data?.latest !== undefined && (
              <Typography variant='body2'>
                <strong>Latest:</strong> {moment(data?.latest).utc().format('DD MMM YYYY HH:mm')} UTC
              </Typography>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default UniqueAsteroids
