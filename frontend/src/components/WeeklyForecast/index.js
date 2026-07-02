import React from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import Skeleton from '@mui/material/Skeleton'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import TodayIcon from '@mui/icons-material/Today'
import AlertGenericError from '../AlertGenericError/index'
import { useQuery } from 'react-query'
import { getHighlightsWeeklyForecast } from '../../services/api/Occultation'

function WeeklyForecast() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['highlightsWeeklyForecast'],
    queryFn: getHighlightsWeeklyForecast,
    keepPreviousData: true,
    refetchInterval: false,
    refetchOnWindowFocus: false,
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
        avatar={<TodayIcon color='primary' />}
        title='EVENTS TODAY'
        titleTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
      />
      <CardContent sx={{ flex: 1, pt: 0 }}>
        <Stack spacing={2}>
          <Box>
            <Typography variant='h4' sx={{ fontWeight: 700, color: 'primary.main' }}>
              {data?.today_count?.toLocaleString('en-US')}
            </Typography>
          </Box>
          <Stack spacing={0.5}>
            <Typography variant='body2'>
              <strong>This Week:</strong> {data?.week_count?.toLocaleString('en-US')}
            </Typography>
            <Typography variant='body2'>
              <strong>Next Week:</strong> {data?.next_week_count?.toLocaleString('en-US')}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default WeeklyForecast
