import React from 'react'
import Stack from '@mui/material/Stack';
import KanbanList from './KanbanList/index';




function TasksKanban() {

  const lists = ['PENDING', 'PREPARING', 'SUBMITTING', 'RUNNING', 'INGESTING', 'DONE', 'FAILED']

  // 'PENDING',

  // 'PREPARING',
  // 'READY_FOR_RUN',

  // 'SUBMITTING',
  // 'QUEUED',

  // 'RUNNING',
  // 'WAITING_RESULTS',

  // 'INGESTING',

  // 'DONE',
  // 'FAILED',
  // 'STALLED',
  // 'ABORTED',

  const colors = ['#FFCDD2', '#F8BBD0', '#E1BEE7', '#D1C4E9', '#C5CAE9', '#BBDEFB', '#B3E5FC', '#B2EBF2', '#B2DFDB', '#C8E6C9', '#DCEDC8', '#F0F4C3']
  return (
    <React.Fragment>
      <Stack direction="row" spacing={1}>
        {lists.map((status, idx) => (
          <KanbanList key={status} title={status} state={status} backgroundColor={colors[idx]} />
        ))}
      </Stack>
    </React.Fragment>
  )
}

export default TasksKanban
