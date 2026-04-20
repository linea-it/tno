import React from 'react'
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';

function StateChip({ state, count, color }) {
  return (
    <Chip variant="outlined"
      label={state}
      avatar={
        <Avatar sx={{
          backgroundColor: "#ededed",
        }}>
          {count}
        </Avatar>
      }
      sx={{ borderColor: color }} />
  )
}

export default StateChip
