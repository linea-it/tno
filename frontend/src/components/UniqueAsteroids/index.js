import React from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import Skeleton from '@mui/material/Skeleton'
import { useQuery } from 'react-query'
import { getOccultationHighlights } from '../../services/api/Occultation'
import moment from 'moment'

function UniqueAsteroids() {
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
        title={isLoading ? <Skeleton width={200} animation='wave' /> : 'TOTAL FORECAST'}
        titleTypographyProps={{ variant: 'h6', fontSize: '1.0rem', color: '#4f4e4e' }}
      />
      <CardContent>
        <Typography variant='h3' sx={{ fontWeight: 700, fontSize: '1.8rem', textAlign: 'left', paddingBottom: '20px', color: '#0e4686' }}>
          {isLoading ? <Skeleton /> : data?.count}
        </Typography>
        <Typography variant='body2' sx={{ margin: '5px 0', fontSize: '1rem' }}>
          <strong>Unique Asteroids:</strong> {isLoading ? <Skeleton /> : data?.unique_asteroids}
        </Typography>
        <Typography variant='body2' sx={{ margin: '5px 0', fontSize: '1rem' }}>
          <strong>Earliest:</strong> {isLoading ? <Skeleton /> : moment(data?.earliest).utc().format('YYYY-MM-DD HH:mm:ss')} (UTC)
        </Typography>
        <Typography variant='body2' sx={{ margin: '0px 0', fontSize: '1rem' }}>
          <strong>Lastest:</strong> {isLoading ? <Skeleton /> : moment(data?.latest).utc().format('YYYY-MM-DD HH:mm:ss')} (UTC)
        </Typography>
      </CardContent>
    </Card>
  )
}

export default UniqueAsteroids
