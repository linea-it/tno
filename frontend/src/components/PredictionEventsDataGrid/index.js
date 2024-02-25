import React, { useContext } from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import { PredictionEventsContext } from '../../contexts/PredictionContext'
import PredictEventGrid from './EventsGrid'
import PredictEventToolbar from './Toolbar'
import PredictEventList from './EventsList'

export function PredictionEventsDataGrid() {
  const { viewLayoyt } = useContext(PredictionEventsContext)

  return (
    <Card>
      <CardContent
        sx={{
          minHeight: 500,
          pl: { xs: 1, sm: 2 },
          pr: { xs: 1, sm: 2 }
        }}
      >
        <PredictEventToolbar />
        {viewLayoyt === 'list' && <PredictEventList />}
        {viewLayoyt === 'grid' && <PredictEventGrid />}
      </CardContent>
    </Card>
  )
}

export default PredictionEventsDataGrid
