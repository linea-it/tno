import React from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import UsagePlot from './UsagePlot'
import Box from '@mui/material/Box'
import AlertGenericError from '../AlertGenericError/index'
import { getHighlightsMapsStats } from '../../services/api/Occultation'
import { useQuery } from 'react-query'
import Skeleton from '@mui/material/Skeleton'
import moment from 'moment'

export default function Mapsdata() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['highlightsMapsStats'],
    queryFn: getHighlightsMapsStats,
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
      <CardHeader title='MAPS OVERVIEW' titleTypographyProps={{ variant: 'h6', fontSize: '1.0rem', color: '#4f4e4e' }} />
      <CardContent>
        <Typography variant='h3' sx={{ fontWeight: 700, fontSize: '1.8rem', textAlign: 'left', paddingBottom: '20px', color: '#4dabf5' }}>
          {data?.total_count}
        </Typography>

        <Typography variant='body2' sx={{ margin: '5px 0', fontSize: '1rem' }}>
          <strong>Period:</strong> {isLoading ? <Skeleton /> : moment(data?.period[0]).utc().format('YYYY-MM-DD')} to{' '}
          {moment(data?.period[1]).utc().format('YYYY-MM-DD')}
        </Typography>

        {!isLoading && <UsagePlot maxSize={data?.folder_max_size} used={data?.total_size} />}
      </CardContent>
    </Card>
  )
}

Mapsdata.propTypes = {}
