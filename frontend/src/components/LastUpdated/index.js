// import React, { useEffect, useState } from 'react'
// import moment from 'moment'
// import Typography from '@mui/material/Typography'

// function LastUpdated({ datetimeUTC }) {
//   const [durationText, setDurationText] = useState('')

//   useEffect(() => {
//     function updateDuration() {
//       const now = moment.utc()
//       const then = moment.utc(datetimeUTC)
//       const duration = moment.duration(now.diff(then))
//       const humanized = duration.humanize({ ss: 1 }) // mostra segundos
//       setDurationText(humanized)
//     }

//     updateDuration() // chamada inicial
//     const interval = setInterval(updateDuration, 1000) // atualiza a cada segundo

//     return () => clearInterval(interval)
//   }, [datetimeUTC])

//   return <Typography variant='body2'>{durationText} ago</Typography>
// }

// export default LastUpdated
