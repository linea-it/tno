import React, { useState } from 'react'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import PropTypes from 'prop-types'
import Box from '@mui/material/Box'
import moment from 'moment'
import Stack from '@mui/material/Stack'
import StarBorder from '@mui/icons-material/StarBorder'
import { blue } from '@mui/material/colors'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import OccultationThumbnail from '../OccultationThumbnail'
import Snackbar from '@mui/material/Snackbar'

function PredictEventCard({ data }) {
  const [snackbarOpen, setSnackbarOpen] = useState(false)

  const getDisplayName = (name, number) => {
    return number !== null ? `${name} (${number})` : `${name}`
  }

  const formatDateTime = (value) => {
    return `${moment(value).utc().format('YYYY-MM-DD HH:mm:ss')}`
  }

  const starMag = (value) => {
    return (
      <Stack
        direction='row'
        justifyContent='flex-start'
        alignItems='center'
        sx={{
          color: blue[400],
          lineHeight: 1.5,
          fontSize: '0.75rem',
          fontFamily: 'Public Sans, sans-serif',
          fontWeight: 400,
          gap: 1
        }}
      >
        <StarBorder fontSize='small'/>
        {`${value.toFixed(2)} (G)`}
      </Stack>
    )
  }

  const handleShare = () => {
    const url = `${window.location.origin}${getDetailUrl()}`
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setSnackbarOpen(true)
      })
      .catch((error) => console.error('Failed to copy URL: ', error))
  }

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setSnackbarOpen(false)
  }

  const getDetailUrl = () => {
    return `/prediction-event-detail/${data.id}`
  }

  return (
    <Card sx={{ display: 'flex', alignItems: 'center', minHeight: 150, overflow: 'hidden' }}>
      <Box sx={{ px: 1.5, flexShrink: 0 }}>
        <Box sx={{ overflow: 'visible', flexShrink: 0, lineHeight: 0 }}>
          <Box sx={{ transform: 'scale(1.15)', transformOrigin: 'top left', display: 'inline-block' }}>
            <OccultationThumbnail event={data} width={140} height={150} />
          </Box>
        </Box>
        <Box sx={{ px: { xs: 1, sm: 2 }, pt: 1 }}>
        <Stack direction='row' flexWrap='wrap' spacing={1} justifyContent='space-between'>
          <Button size='small' onClick={handleShare} sx={{ minHeight: 36 }}>
            Share
          </Button>
          <Button size='small' href={getDetailUrl()} target='_blank' sx={{ minHeight: 36 }}>
            More
          </Button>
        </Stack>
      </Box>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0, flex: 1, py: 1 }}>
        <CardHeader
          sx={{ pb: 0.5, px: { xs: 1, sm: 2 }, '& .MuiCardHeader-content': { minWidth: 0 }, '& .MuiCardHeader-title': { overflow: 'hidden', textOverflow: 'ellipsis' } }}
          title={getDisplayName(data.name, data.number)}
          titleTypographyProps={{ variant: 'body1', color: 'primary.main' }}
          subheader={formatDateTime(data.date_time)}
          subheaderTypographyProps={{ variant: 'body2' }}
        />
        <CardContent sx={{ py: '0 !important', px: { xs: 1, sm: 2 } }}>
          <Stack spacing={0.5}>
            <Stack direction='row' alignItems='center' spacing={1.5} flexWrap='nowrap'>
              <Chip label={data.dynclass} color='info' size='small' sx={{ maxWidth: '100%', flexShrink: 1, minWidth: 0 }} />
            </Stack>
            <Stack direction='row' spacing={1.5} flexWrap='wrap'>
              <Box sx={{ flexShrink: 0 }}>{starMag(data.g_star)}</Box>
            </Stack>
            <Stack direction='row' spacing={1.5} flexWrap='wrap'>
              <Typography variant='caption' color='text.secondary'>
                C/A {data.closest_approach?.toFixed(2)}″
              </Typography>
            </Stack>
            <Stack direction='row' spacing={1.5} flexWrap='wrap'>
              <Typography variant='caption' color='text.secondary'>
                Vel {data.velocity?.toFixed(1)} km/s
              </Typography>
            </Stack>
            <Typography variant='caption' color='text.secondary'>
              LT {data.loc_t?.slice(0, 5)}
            </Typography>
          </Stack>
        </CardContent>
        {/* <Box sx={{ px: { xs: 1, sm: 2 }, pt: 1 }}>
          <Stack direction='row' flexWrap='wrap' spacing={1} justifyContent='space-between'>
            <Button size='small' onClick={handleShare} sx={{ minHeight: 36 }}>
              Share
            </Button>
            <Button size='small' href={getDetailUrl()} target='_blank' sx={{ minHeight: 36 }}>
              More
            </Button>
          </Stack>
        </Box> */}
      </Box>
      <Snackbar open={snackbarOpen} autoHideDuration={2500} onClose={handleCloseSnackbar} message='URL copied to clipboard' />
    </Card>
  )
}

PredictEventCard.propTypes = {
  data: PropTypes.object.isRequired
}

export default PredictEventCard
