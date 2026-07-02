import React from 'react'
import { Box, Button, CircularProgress, Typography } from '@mui/material'

export default function MapStatusPanel({
  status,
  error,
  warnings = [],
  onRetry,
  minHeight = 200,
}) {
  if (status === 'loading') {
    return (
      <Box
        display='flex'
        flexDirection='column'
        justifyContent='center'
        alignItems='center'
        minHeight={minHeight}
        bgcolor='grey.100'
        borderRadius='8px'
      >
        <CircularProgress size={50} sx={{ mb: 2 }} />
        <Typography variant='subtitle1' color='text.secondary'>
          Loading, please wait...
        </Typography>
      </Box>
    )
  }

  if (status === 'query-error' || status === 'invalid-payload' || status === 'geometry-error') {
    return (
      <Box
        display='flex'
        flexDirection='column'
        justifyContent='center'
        alignItems='center'
        minHeight={minHeight}
        bgcolor='grey.100'
        borderRadius='8px'
        px={2}
        textAlign='center'
      >
        <Typography variant='subtitle1' color='error' gutterBottom>
          {status === 'query-error' ? 'Failed to load occultation paths' : 'Unable to render map'}
        </Typography>
        <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
          {error || 'Unknown error'}
        </Typography>
        {onRetry && (
          <Button variant='outlined' onClick={onRetry}>
            Retry
          </Button>
        )}
      </Box>
    )
  }

  if (warnings.length > 0) {
    return (
      <Box sx={{ px: 1, py: 0.5 }}>
        {warnings.map((warning) => (
          <Typography key={warning} variant='caption' color='warning.main' display='block'>
            {warning}
          </Typography>
        ))}
      </Box>
    )
  }

  return null
}
