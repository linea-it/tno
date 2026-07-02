import React from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import Skeleton from '@mui/material/Skeleton'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import FolderOpenIcon from '@mui/icons-material/FolderOpen'
import AlertGenericError from '../AlertGenericError/index'
import UsagePlot from './UsagePlot'
import { getHighlightsMapsStats } from '../../services/api/Occultation'
import { useQuery } from 'react-query'
import moment from 'moment'

export default function MapsStats() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['highlightsMapsStats'],
    queryFn: getHighlightsMapsStats,
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
        avatar={<FolderOpenIcon color='primary' />}
        title='MAPS OVERVIEW'
        titleTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
      />
      <CardContent sx={{ flex: 1, pt: 0 }}>
        <Stack spacing={2}>
          <Box>
            <Typography variant='h4' sx={{ fontWeight: 700, color: 'primary.main' }}>
              {data?.total_count?.toLocaleString('en-US')}
            </Typography>
          </Box>
          <Typography variant='body2'>
            <strong>Period:</strong>{' '}
            {moment(data?.period[0]).utc().format('DD MMM YYYY')} —{' '}
            {moment(data?.period[1]).utc().format('DD MMM YYYY')}
          </Typography>
          <UsagePlot maxSize={data?.folder_max_size} used={data?.total_size} />
        </Stack>
      </CardContent>
    </Card>
  )
}
