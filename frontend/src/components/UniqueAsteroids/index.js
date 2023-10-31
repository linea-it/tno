import React from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import Skeleton from '@mui/material/Skeleton'
import { useQuery } from 'react-query'
import { getOccultationHighlights } from '../../services/api/Occultation'

function UniqueAsteroids() {
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
                        <Skeleton width={200} animation="wave" />
                    ) : (
                        'Total Occultation Predictions'
                    )
                }
                titleTypographyProps={{ variant: 'h6', fontSize: '1.3rem' }}
            />
            <CardContent>
                <Typography
                    variant="h3"
                    sx={{ fontWeight: 700, fontSize: "2.2rem", textAlign: "left", paddingBottom: '10px'}}>
                    {isLoading ? <Skeleton /> : data?.count}
                </Typography>
                <Typography variant="body2" sx={{ margin: '5px 0' }}>
                    <strong>Unique Asteroids:</strong> {isLoading ? <Skeleton /> : data?.unique_asteroids}
                </Typography>
                <Typography variant="body2" sx={{ margin: '5px 0' }}>
                    <strong>Earliest:</strong> {isLoading ? <Skeleton /> : data?.earliest}
                </Typography>
                <Typography variant="body2" sx={{ margin: '5px 0' }}>
                    <strong>Lastest:</strong> {isLoading ? <Skeleton /> : data?.latest}
                </Typography>
            </CardContent>
        </Card>
    )
}

export default UniqueAsteroids
