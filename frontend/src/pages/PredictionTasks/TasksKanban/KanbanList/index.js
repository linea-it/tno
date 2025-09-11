import React from 'react'
import { useQuery } from 'react-query'
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import KanbanCard from '../KanbanCard/index';
import { getPredictionTasksByState } from '../../../../services/api/PredictionTasks';

function KanbanList({ title, backgroundColor, state }) {

  const { data, isLoading } = useQuery({
    queryKey: ['tasksByGroup', { state: state }],
    queryFn: getPredictionTasksByState,
    keepPreviousData: true,
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
    refetchOnmount: false,
    refetchOnReconnect: false,
    // retry: 1,
    // staleTime: 5 * 60 * 60 * 1000
  })

  return (
    <Card sx={{
      width: 270,
      minWidth: 270,
      height: 400,
      backgroundColor: backgroundColor
    }}>
      <CardHeader title={<Typography variant="h6" sx={{ fontSize: '1rem' }}>{title}</Typography>} />
      <Divider />
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <CardContent sx={{ overflowX: 'auto', flex: 1 }}>
          <Stack spacing={1} >
            {data && data.results.map((task) => (
              <KanbanCard key={task.id} task={task} />
            ))}
          </Stack>
        </CardContent>
      </Box>
    </Card>
  )
}

export default KanbanList
