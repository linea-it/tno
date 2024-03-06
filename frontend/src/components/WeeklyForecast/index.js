import React from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import Skeleton from '@mui/material/Skeleton'
import AlertGenericError from '../AlertGenericError/index'
import Box from '@mui/material/Box'
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

  if (isLoading) return <Skeleton variant='rectangular' width='100%' height={250} />
  if (isError)
    return (
      <Box sx={{ height: 250 }}>
        <AlertGenericError />
      </Box>
    )

  return (
    <Card sx={{ height: 250, borderRadius: '10px' }}>
      <CardHeader title='EVENTS TODAY' titleTypographyProps={{ variant: 'h6', fontSize: '1.0rem', color: '#4f4e4e' }} />
      <CardContent>
        <Typography variant='h3' sx={{ fontWeight: 700, fontSize: '1.8rem', textAlign: 'left', paddingBottom: '20px', color: '#1565c0' }}>
          {data?.today_count}
        </Typography>
        <Typography variant='body2' sx={{ margin: '5px 0', fontSize: '1rem' }}>
          <strong>This Week:</strong> {data?.week_count}
        </Typography>
        <Typography variant='body2' sx={{ margin: '5px 0', fontSize: '1rem' }}>
          <strong>Next Week:</strong> {data?.next_week_count}
        </Typography>
      </CardContent>
    </Card>
  )
}

export default WeeklyForecast
