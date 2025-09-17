import React from 'react'
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import FlashOffIcon from '@mui/icons-material/FlashOff';

import moment from 'moment'

function WorkerCard({ worker }) {

  const colors = {
    STALE: {
      background: '#fae6e5',
      chip: "error"
    },
    RUNNING: {
      background: '#e6faea',
      chip: "success"
    }
  }

  const lastActivity = (value) => {
    if (!value) {
      return ''
    }

    const now = moment.utc()
    const then = moment.utc(value)
    const duration = moment.duration(now.diff(then))
    const humanized = duration.humanize({ ss: 1 }) // mostra segundos

    return `${humanized} ago`
  }

  const uptime = (value) => {
    if (!value) {
      return ''
    }
    const duration = moment.duration(value, 'seconds');
    const humanized = duration.humanize({ ss: 1 }) // mostra segundos
    return `${humanized}`
  }

  return (
    <Card variant="outlined" sx={{
      // minWidth: 300 
      minWidth: 240,
      width: 300,
      // maxWidth: 300,
      // flex: 1,
      backgroundColor: colors[worker.status]?.background ? colors[worker.status].background : 'inherit',
    }}>
      <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
        <Stack direction="row" spacing={2}>
          <Chip variant="outlined"
            label={worker.status}
            color={colors[worker.status]?.chip}
            size="small" />
          <Typography variant="h6" sx={{ fontSize: '1rem' }}>{worker.name}</Typography>
        </Stack>
        <Stack direction="row" spacing={2}>
          <Stack direction="row" spacing={1}>
            {worker.status === "STALE" ? <FlashOffIcon fontSize="small" color="error" /> : <FlashOnIcon fontSize="small" color="success" />}
            <Typography variant="body2" >{lastActivity(worker.updated_at)}</Typography>
          </Stack>
          <Stack direction="row" spacing={1}>
            <AccessTimeIcon fontSize="small" color="info" />
            <Typography variant="body2" >{uptime(worker.uptime)}</Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default WorkerCard