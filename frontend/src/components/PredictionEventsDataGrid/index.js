import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import { PredictionEventsContext } from '../../contexts/PredictionContext'
import PredictEventGrid from './EventsGrid'
import PredictEventToolbar from './Toolbar'
import PredictEventList from './EventsList'

export function PredictionEventsDataGrid({ disabledSearch }) {
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
        {!disabledSearch && <PredictEventToolbar />}
        {viewLayoyt === 'list' && <PredictEventList />}
        {viewLayoyt === 'grid' && <PredictEventGrid />}
      </CardContent>
    </Card>
  )
}

PredictionEventsDataGrid.defaultProps = {
  disabledSearch: false
}

PredictionEventsDataGrid.propTypes = {
  disabledSearch: PropTypes.bool
}
export default PredictionEventsDataGrid
