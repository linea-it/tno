import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import Plot from 'react-plotly.js'
import useStyles from './styles'

function CcdsDownloadedGrouped({ data }) {
  const classes = useStyles()
  const [rows, setRows] = useState([])

  useEffect(() => {
    const x = data.map((ccd) => ccd.date)
    const y1 = data.map((ccd) => ccd.count)
    const y2 = data.map((ccd) => ccd.downloaded)

    const sumY1 = y1.reduce((accumulator, currentValue) => accumulator + currentValue)
    const sumY2 = y2.reduce((accumulator, currentValue) => accumulator + currentValue)

    setRows([
      {
        x,
        y: y1,
        name: `CCDs (${sumY1})`,
        type: 'bar'
      },
      {
        x,
        y: y2,
        name: `Downloaded (${sumY2})`,
        type: 'bar'
      }
    ])
  }, [data])

  return (
    <Plot
      data={rows}
      className={classes.plotWrapper}
      layout={{
        barmode: 'group',
        autosize: true,
        hovermode: 'closest',
        margin: {
          t: 30,
          l: 30,
          b: 30
        }
      }}
      config={{
        scrollZoom: false,
        displaylogo: false,
        responsive: true
      }}
    />
  )
}

CcdsDownloadedGrouped.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string,
      count: PropTypes.number,
      downloaded: PropTypes.number
    })
  ).isRequired
}

export default CcdsDownloadedGrouped
