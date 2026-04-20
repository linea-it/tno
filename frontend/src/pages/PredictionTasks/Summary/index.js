import React from 'react'
import { useQuery } from 'react-query'
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import StateChip from './StateChip';
import { taskStates, states, sortByState } from '../data'
import { getPredictionTasksGroupByState } from '../../../services/api/PredictionTasks';

function TaskSummary() {

  const { data, isLoading } = useQuery({
    queryKey: ['tasksByGroup'],
    queryFn: getPredictionTasksGroupByState,
    keepPreviousData: true,
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
    refetchOnmount: false,
    refetchOnReconnect: false,
    // retry: 1,
    // staleTime: 5 * 60 * 60 * 1000
  })


  const ordered = data ? sortByState(data, states) : [];

  return (
    <Box>
      Tasks Summary
      <Stack direction='row' alignItems='center' spacing={1} m={2}>
        {ordered.map((state, idx) => {
          return <StateChip key={idx} state={taskStates[state.state].label} count={state.count} color={taskStates[state.state].color} />
        })}
      </Stack>

    </Box>
  )
}

export default TaskSummary
