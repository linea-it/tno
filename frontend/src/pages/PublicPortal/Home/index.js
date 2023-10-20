import React from 'react'
import styles from './styles'
import PublicBanner from '../../../components/PublicPortal/Banner/index'
import PublicInterfaces from './partials/Interfaces/index'
import PublicOcutation from './partials/ocultation/index'
import PredictionHighlights from '../../../components/PredictionHighlights/index'

function Main() {
  const classes = styles()

  return (
    <>
      <PublicBanner />
      <div className={classes.root}>
        <PublicInterfaces />
        <PredictionHighlights />
        <PublicOcutation />
      </div>
    </>
  )
}

export default Main
