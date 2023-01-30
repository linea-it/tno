import React from 'react'
import PropTypes from 'prop-types'

function Log({ data }) {
  return (
    <pre style={{ border: 'none' }}>
      {data
        ? data.map((line) => (
            <div key={line} style={{ whiteSpace: 'normal' }}>
              {line}
            </div>
          ))
        : null}
    </pre>
  )
}

Log.propTypes = {
  data: PropTypes.arrayOf(PropTypes.string).isRequired
}

export default Log
