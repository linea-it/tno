import React from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import Skeleton from '@mui/material/Skeleton'
import Box from '@mui/material/Box'
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

  if (isLoading) return <Skeleton variant='rectangular' width='100%' height={250} />

  if (isError)
    return (
      <Box sx={{ height: 250 }}>
        <AlertGenericError />
      </Box>
    )

  return (
    <Card sx={{ height: 250, borderRadius: '10px' }}>
      <CardHeader title='UPCOMING THIS MONTH' titleTypographyProps={{ variant: 'h6', fontSize: '1.0rem', color: '#4f4e4e' }} />
      <CardContent>
        <Typography variant='h3' sx={{ fontWeight: 700, fontSize: '1.8rem', textAlign: 'left', paddingBottom: '20px', color: '#4383cc' }}>
          {data?.month_count}
        </Typography>
        <Typography variant='body2' sx={{ margin: '5px 0', fontSize: '1rem' }}>
          <strong>Next Month:</strong> {data?.next_month_count}
        </Typography>
      </CardContent>
    </Card>
  )
}

export default MonthlyForecast
