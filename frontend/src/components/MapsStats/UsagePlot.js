import React from 'react'
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
// import Plot from 'react-plotly.js'
import { filesize } from 'filesize';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import PropTypes from 'prop-types'

// MIN = Minimum expected value
// MAX = Maximum expected value
// Function to normalise the values (MIN / MAX could be integrated)
const normalise = (value, max) => (value * 100) / (max);

export default function UsagePlot({ maxSize, used }) {

  const o_size = filesize(maxSize, { output: "object" })
  const o_used = filesize(used, { output: "object" })

  return (
    <Box sx={{ width: '100%' }}>
      <Stack spacing={1}>
        <Box sx={{ width: '100%', mr: 1 }}>
          <LinearProgress variant="determinate" value={normalise(o_used.value, o_size.value)} />
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: "right" }}>
            {`${o_used.value}${o_used.unit}`} / {`${o_size.value}${o_size.unit}`}</Typography>
        </Box>
      </Stack>
    </Box>
  )

  // return (
  //   <Plot
  //     data={
  //       [
  //         {
  //           domain: { x: [0, 1], y: [0, 1] },
  //           value: o_used.value,
  //           title: { text: "" },
  //           type: "indicator",
  //           mode: "gauge+number",
  //           // delta: { reference: 380 },
  //           gauge: {
  //             axis: { range: [null, o_size.value] },
  //             // steps: [
  //             //   { range: [0, 250], color: "lightgray" },
  //             //   { range: [250, 400], color: "gray" }
  //             // ],
  //             // threshold: {
  //             //   line: { color: "red", width: 4 },
  //             //   thickness: 0.75,
  //             //   value: 490
  //             // }
  //           }
  //         }
  //       ]
  //     }
  //     config={{
  //       scrollZoom: false,
  //       displaylogo: false,
  //       responsive: true,
  //     }}
  //   />
  // )
}
UsagePlot.propTypes = {
  maxSize: PropTypes.number.isRequired,
  used: PropTypes.number.isRequired
}
