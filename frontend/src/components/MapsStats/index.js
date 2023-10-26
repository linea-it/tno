import React from 'react'
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import UsagePlot from './UsagePlot'
import { getOccultationHighlights } from '../../services/api/Occultation'
import { useQuery } from 'react-query'
import Skeleton from '@mui/material/Skeleton';
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
    <Card sx={{ borderRadius: '10px' }}>
      <CardHeader
        title={
          isLoading ? (
            <Skeleton
              animation="wave"
            />
          ) : (
            "Total Prediction Maps"
          )}
        titleTypographyProps={{ variant: 'h6', fontSize: '1rem', }}
        subheader={
          isLoading ? (
            <Skeleton
              animation="wave"
            />
          ) : (
            `from ${data?.maps_stats.period[0]} to ${data?.maps_stats.period[1]}`
          )}
        subheaderTypographyProps={{ variant: 'body2', fontSize: '0.87rem', }}
      />
      <CardContent>
        <Typography 
          variant="h3" 
          sx={{ fontWeight: 700, fontSize: "2rem", textAlign: "left" }}>
          {isLoading ? ( <Skeleton /> ) : (data?.maps_stats.total_count)}
        </Typography>

        {isLoading ? (
          <></>
          ) : (
              <UsagePlot 
              maxSize={data?.maps_stats.folder_max_size} 
              used={data?.maps_stats.total_size} />            
          )}
      </CardContent>
    </Card>
  )
}

Mapsdata.propTypes = {}
