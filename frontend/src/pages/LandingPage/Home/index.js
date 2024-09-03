import React from 'react'
import Banner from '../../../components/LandingPage/Banner'
import Interfaces from './partials/Interfaces'
import styles from './styles'

function Main() {
  const classes = styles()

  return (
    <>
      <Banner />
      <div className={classes.root}>
        <Interfaces />
      </div>
    </>
  )
}

export default Main
