import React from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import UsagePlot from './UsagePlot'
import { getOccultationHighlights } from '../../services/api/Occultation'
import { useQuery } from 'react-query'
import Skeleton from '@mui/material/Skeleton'
export default function Mapsdata() {

  const { data, isLoading } = useQuery({
    queryKey: ['occultationHighlights'],
    queryFn: getOccultationHighlights,
    keepPreviousData: true,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    staleTime: 1 * 60 * 60 * 1000,
  })

  return (
    <Card sx={{ height: '210px', borderRadius: '10px' }}>
      <CardHeader
        title={
          isLoading ? (
            <Skeleton
              animation="wave"
            />
          ) : (
            "Total Prediction Maps"
          )}
        titleTypographyProps={{ variant: 'h6', fontSize: '1.3rem', }}
      />
      <CardContent>
        <Typography 
          variant="h3" 
          sx={{ fontWeight: 700, fontSize: "2.2rem", textAlign: "left" }}>
          {isLoading ? ( <Skeleton /> ) : (data?.maps_stats.total_count)}
        </Typography>
        {isLoading ? (
          <></>
          ) : (
              <UsagePlot 
              maxSize={data?.maps_stats.folder_max_size} 
              used={data?.maps_stats.total_size} />            
          )}
        <Typography variant="body2" sx={{ margin: '5px 0' }}>
        <strong>Period:</strong> {isLoading ? <Skeleton /> : data?.maps_stats.period[0]} to { data?.maps_stats.period[1]}
        </Typography>
      </CardContent>
    </Card>
  )
}

Mapsdata.propTypes = {}
