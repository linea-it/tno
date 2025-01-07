import React, { useEffect, useState } from 'react'
import { Button } from '../../../node_modules/@mui/material/index'
import { getOrCreatePredictionMap } from '../../services/api/Occultation'
import { useQuery } from 'react-query'

const OccultationMapDownload = ({ occultationId }) => {
  const [force, setForce] = React.useState(false)
  const { data, isLoading, isError } = useQuery({
    queryKey: ['getOrCreatePredrictMap', { id: occultationId, force: force }],
    queryFn: getOrCreatePredictionMap,
    keepPreviousData: false,
    refetchInterval: false,
    refetchOnmount: false,
    refetchOnWindowFocus: false,
    onSuccess: () => {
      if (force === true) setForce(false)
    },
    staleTime: 1 * 60 * 1000
  })

  //console.log('occultationId', data.url)

  const downloadFile = () => {
    if (data?.url) {
      const link = document.createElement('a')
      link.href = data.url
      link.download = data.filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <Button onClick={downloadFile} style={{ padding: '10px 20px', fontSize: '14px', textAlign: 'center' }}>
      Download Map SORA
    </Button>
  )
}

export default OccultationMapDownload
