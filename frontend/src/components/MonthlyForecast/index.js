import React from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Skeleton from '@mui/material/Skeleton'
import { useQuery } from 'react-query'
import { getOccultationHighlights } from '../../services/api/Occultation'

export default function MonthlyForecast() {

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
                        'Occultations This Month'
                    )}
                </Typography >
                <Typography variant="h3" sx={{ fontWeight: 'bold', fontSize: '1.4rem', margin: '10px 0' }}>
                    {isLoading ? <Skeleton /> : data?.month_count}
                </Typography>
                <Typography variant="body2">
                    Next Month: {isLoading ? <Skeleton /> : data?.next_month_count}
                </Typography>
            </CardContent>
        </Card>
    )
}