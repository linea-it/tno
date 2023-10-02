import React from 'react'
import styles from './styles'
import PublicBanner from '../../../components/PublicPortal/Banner/index'
import PublicInterfaces from './partials/Interfaces/index'
import PublicOcutation from './partials/ocultation/index'

function Main() {
  const classes = styles()

  return (
    <>
      <PublicBanner />
      <div className={classes.root}>
        <PublicInterfaces />
        <PublicOcutation />
      </div>
    </>
  )
}

export default Main
