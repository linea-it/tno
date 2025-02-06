import React, { useState } from 'react'
import { Button, CircularProgress } from '../../../node_modules/@mui/material/index'
import { getOrCreatePredictionMap } from '../../services/api/Occultation'
import { useQuery } from 'react-query'

const OccultationMapDownload = ({ occultationId }) => {
  const [force, setForce] = useState(false)

  const downloadFile = (url, filename) => {
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Only run this query when refetch() is called
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['getOrCreatePredrictMap', { id: occultationId, force }],
    queryFn: getOrCreatePredictionMap,
    enabled: false,
    onSuccess: (res) => {
      if (force) setForce(false)
      if (res?.url) {
        downloadFile(res.url, res.filename)
      }
    },
    staleTime: 60 * 1000
  })

  const handleClick = () => {
    // setForce(true)
    refetch()
  }

  return (
    <Button variant='contained' color='primary' disabled={isLoading} onClick={handleClick}>
      {isLoading ? (
        <>
          Generating... <CircularProgress size={20} style={{ marginLeft: 8 }} />
        </>
      ) : (
        'Download Map'
      )}
    </Button>
  )
}

export default OccultationMapDownload
