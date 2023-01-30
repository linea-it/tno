import React from 'react'
import PropTypes from 'prop-types'
import Panel from '../../libs/Aladin/Panel'
import useStyles from './styles'

function Aladin({ ra, dec }) {
  const classes = useStyles()

  // Zoom Level:
  const fov = 0.1

  return (
    <div className={classes.wrapper}>
      <Panel position={`${ra} ${dec}`} fov={fov} desfootprint />
    </div>
  )
}

Aladin.propTypes = {
  ra: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  dec: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
}

export default Aladin
