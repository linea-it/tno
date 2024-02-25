import React from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import UsagePlot from './UsagePlot'
import { getOccultationHighlights } from '../../services/api/Occultation'
import { useQuery } from 'react-query'
import Skeleton from '@mui/material/Skeleton'
import moment from 'moment'

export default function Mapsdata() {
  const { data, isLoading } = useQuery({
    queryKey: ['occultationHighlights'],
    queryFn: getOccultationHighlights,
    keepPreviousData: true,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    staleTime: 1 * 60 * 60 * 1000
  })

  return (
    <Card sx={{ height: '100%', borderRadius: '10px' }}>
      <CardHeader
        title={isLoading ? <Skeleton animation='wave' /> : 'MAPS OVERVIEW'}
        titleTypographyProps={{ variant: 'h6', fontSize: '1.0rem', color: '#4f4e4e' }}
      />
      <CardContent>
        <Typography variant='h3' sx={{ fontWeight: 700, fontSize: '1.8rem', textAlign: 'left', paddingBottom: '20px', color: '#4dabf5' }}>
          {isLoading ? <Skeleton /> : data?.maps_stats.total_count}
        </Typography>

        <Typography variant='body2' sx={{ margin: '5px 0', fontSize: '1rem' }}>
          <strong>Period:</strong> {isLoading ? <Skeleton /> : moment(data?.maps_stats.period[0]).utc().format('YYYY-MM-DD')} to{' '}
          {moment(data?.maps_stats.period[1]).utc().format('YYYY-MM-DD')}
        </Typography>

        {isLoading ? <></> : <UsagePlot maxSize={data?.maps_stats.folder_max_size} used={data?.maps_stats.total_size} />}
      </CardContent>
    </Card>
  )
}

Mapsdata.propTypes = {}
