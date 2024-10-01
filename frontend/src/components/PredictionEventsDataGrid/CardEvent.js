import React, { useState } from 'react'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import PropTypes from 'prop-types'
import Box from '@mui/material/Box'
import moment from 'moment'
import Stack from '@mui/material/Stack'
import StarBorderPurple500Icon from '@mui/icons-material/StarBorderPurple500'
import { blue } from '@mui/material/colors'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import Snackbar from '@mui/material/Snackbar'
//import PredictOccultationMap from '../../pages/PredictionEvents/partials/OccultationMap/index'

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
        <StarBorderPurple500Icon fontSize='small' />
        {`G (Gaia) ${value.toFixed(3)}`}
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

  const handleImageError = (e) => {
    console.log('handleImageError')
    e.target.onerror = null
    e.target.src = 'https://placehold.co/250?text=No%20Image'
  }

  return (
    <Card sx={{ display: 'flex', height: 176 }}>
      <CardMedia
        sx={{
          width: 250
        }}
        onError={handleImageError}
      >
        {/*<PredictOccultationMap occultationId={data.id} thumbsCard={true} thumbsList={false} />*/}
      </CardMedia>
      <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <CardHeader
          sx={{
            pb: 0
          }}
          title={getDisplayName(data.name, data.number)}
          titleTypographyProps={{ variant: 'body1' }}
          subheader={formatDateTime(data.date_time)}
          subheaderTypographyProps={{ variant: 'body2' }}
        />
        <CardContent sx={{ flex: '1 0 auto', pt: 1 }}>
          <Chip label={data.dynclass} color='info' size='small'></Chip>
          <Stack spacing={1} sx={{ pt: 1 }}>
            <Stack direction='row' spacing={2}>
              {starMag(data.g_star)}
            </Stack>
            <Stack direction='row' justifyContent='flex-end' alignItems='center' spacing={1}>
              <Button size='small' onClick={handleShare}>
                Share
              </Button>
              <Button size='small' href={getDetailUrl()} target='_blank'>
                More
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Box>
      <Snackbar open={snackbarOpen} autoHideDuration={2500} onClose={handleCloseSnackbar} message='URL copied to clipboard' />
    </Card>
  )
}

PredictEventCard.propTypes = {
  data: PropTypes.object.isRequired
}

export default PredictEventCard
