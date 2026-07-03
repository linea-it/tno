import React from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import Skeleton from '@mui/material/Skeleton'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import AlertGenericError from '../AlertGenericError/index'
import { useQuery } from 'react-query'
import { getHighlightsMonthlyForecast } from '../../services/api/Occultation'

function MonthlyForecast() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['highlightsMonthlyForecast'],
    queryFn: getHighlightsMonthlyForecast,
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
        avatar={<CalendarMonthIcon color='primary' />}
        title='UPCOMING THIS MONTH'
        titleTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
      />
      <CardContent sx={{ flex: 1, pt: 0 }}>
        <Stack spacing={2}>
          <Box>
            <Typography variant='h4' sx={{ fontWeight: 700, color: 'primary.main' }}>
              {data?.month_count?.toLocaleString('en-US')}
            </Typography>
          </Box>
          <Stack spacing={0.5}>
            <Typography variant='body2'>
              <strong>Next Month:</strong> {data?.next_month_count?.toLocaleString('en-US')}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default MonthlyForecast
