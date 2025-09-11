import { useState } from 'react';
import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2

import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import IconButton from '@mui/material/IconButton';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import ViewListIcon from '@mui/icons-material/ViewList'
import TasksGrid from './TasksGrid';
import TasksKanban from './TasksKanban';
import TaskSummary from './Summary';

function PredictionTasks() {

  const [viewLayout, setViewLayout] = useState('kanban');

  const handleChangeLayout = (e, value) => {
    if (value !== null) {
      setViewLayout(value)
    }
  }
  return (
    <>
      <Grid
        container
        alignItems="stretch"
        spacing={3}
        sx={{ minWidth: 'lg' }}>
        <Grid xs={8}>
          <Card sx={{ minHeight: 200 }}>
            <CardContent><TaskSummary /></CardContent>
          </Card>
        </Grid>
        <Grid xs={4}>
          <Card sx={{ minHeight: 200 }}>
            <CardContent>Heartbeat of workers</CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid
        container
        alignItems="stretch"
        spacing={3}
        sx={{ minWidth: 'lg' }}>

        <Grid item xs={12}>
          <Card sx={{ minHeight: 400 }}>
            <CardHeader
              title="Prediction Tasks"
              action={
                <ToggleButtonGroup value={viewLayout} onChange={handleChangeLayout} exclusive aria-label='view-layout'>
                  <ToggleButton value='list' aria-label='list-layout'>
                    <ViewListIcon />
                  </ToggleButton>
                  <ToggleButton value='kanban' aria-label='kanban-layout'>
                    <ViewKanbanIcon />
                  </ToggleButton>
                </ToggleButtonGroup>
              }
            />
            <CardContent>
              {viewLayout === 'list' && (<TasksGrid />)}
              {viewLayout === 'kanban' && (<TasksKanban />)}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  )
}

export default PredictionTasks
