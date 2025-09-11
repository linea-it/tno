import React from 'react'
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';


function KanbanCard({ task }) {
  return (
    <Card>
      {/* <CardHeader
        title={<Typography variant="h6" sx={{ fontSize: '1rem' }}>{task.asteroid_id}</Typography>}
        subheader={`Task ID: ${task.id}`}
      /> */}
      <CardContent>
        <Typography variant="h6" sx={{ fontSize: '1rem' }}>{task.asteroid_id}</Typography>
      </CardContent>
    </Card>
  )
}

export default KanbanCard
