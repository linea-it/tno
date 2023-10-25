import React from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Skeleton from '@mui/material/Skeleton'
import { useQuery } from 'react-query'
import { getOccultationHighlights } from '../../services/api/Occultation'

export default function UniqueAsteroids() {

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
            <CardContent>
                <Typography sx={{ fontSize: '0.9rem', fontWeight: '500', marginBottom: '15px' }}>
                    {isLoading ? (
                        <Skeleton
                            width={200}
                            animation="wave"
                        />
                    ) : (
                        'Total Occultations Count'
                    )}
                </Typography>
                <Typography
                    variant="h3"
                    sx={{ fontWeight: 'bold', fontSize: '1.4rem', margin: '10px 0' }}>
                    {isLoading ? <Skeleton /> : data?.count}
                </Typography>
                <Typography
                    variant="body2"
                    sx={{ margin: '5px 0' }}>
                    Number of Unique Asteroids: {isLoading ? <Skeleton /> : data?.unique_asteroids}
                </Typography>
                <Typography
                    variant="body2"
                    sx={{ margin: '5px 0' }}>
                    Earliest Date: {isLoading ? <Skeleton /> : data?.earliest}
                </Typography>
                <Typography
                    variant="body2"
                    sx={{ margin: '5px 0' }}>
                    Latest Date: {isLoading ? <Skeleton /> : data?.latest}
                </Typography>
            </CardContent>
        </Card>
    )
}
