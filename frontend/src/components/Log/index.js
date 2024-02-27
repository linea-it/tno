import React from 'react'
import Box from '@mui/material/Box'
import PropTypes from 'prop-types'

function Log({ data }) {
  return (
    <Box sx={{ border: 'none' }}>
      <pre>
        {data
          ? data.map((line, index) => (
              <Box key={index} sx={{ whiteSpace: 'normal' }}>
                {line}
              </Box>
            ))
          : null}
      </pre>
    </Box>
  )
}

Log.propTypes = {
  data: PropTypes.arrayOf(PropTypes.string).isRequired
}

export default Log
