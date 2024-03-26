import React from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import Skeleton from '@mui/material/Skeleton'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
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

  if (isLoading) return <Skeleton variant='rectangular' width='100%' height={250} />

  if (isError)
    return (
      <Box sx={{ height: 250 }}>
        <AlertGenericError />
      </Box>
    )

  return (
    <Card sx={{ height: 250, borderRadius: '10px' }}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant='h6' sx={{ fontWeight: 700, fontSize: '1.0rem', color: '#4f4e4e' }}>
              TOTAL FORECAST
            </Typography>
            <IconButton href='/docs/release-notes/' target='_blank' aria-label='help'>
              <HelpOutlineIcon />
            </IconButton>
          </Box>
        }
      />
      <CardContent>
        <Typography variant='h3' sx={{ fontWeight: 700, fontSize: '1.8rem', textAlign: 'left', paddingBottom: '20px', color: '#0e4686' }}>
          {data?.count}
        </Typography>
        <Typography variant='body2' sx={{ margin: '5px 0', fontSize: '1rem' }}>
          <strong>Unique Asteroids:</strong> {data?.unique_asteroids}
        </Typography>
        {data?.earliest !== undefined && (
          <Typography variant='body2' sx={{ margin: '5px 0', fontSize: '1rem' }}>
            <strong>Earliest:</strong> {moment(data?.earliest).utc().format('YYYY-MM-DD HH:mm:ss')} (UTC)
          </Typography>
        )}
        {data?.latest !== undefined && (
          <Typography variant='body2' sx={{ margin: '0px 0', fontSize: '1rem' }}>
            <strong>Latest:</strong> {moment(data?.latest).utc().format('YYYY-MM-DD HH:mm:ss')} (UTC)
          </Typography>
        )}
      </CardContent>
    </Card>
  )
}

export default UniqueAsteroids
