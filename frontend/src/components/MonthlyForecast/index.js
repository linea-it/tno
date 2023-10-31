import React from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import Skeleton from '@mui/material/Skeleton'
import { useQuery } from 'react-query'
import { getOccultationHighlights } from '../../services/api/Occultation'

function MonthlyForecast() {
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
                            width={200}
                            animation="wave"
                        />
                    ) : (
                        'Occultations Predictions This Month'
                    )
                }
                titleTypographyProps={{ variant: 'h6', fontSize: '1.3rem' }}
            />
            <CardContent>
                <Typography
                    variant="h3"
                    sx={{ fontWeight: 700, fontSize: "2.2rem", textAlign: "left", paddingBottom: '10px' }}>
                    {isLoading ? <Skeleton /> : data?.month_count}
                </Typography>
                <Typography variant="body2">
                    <strong>Next Month:</strong> {isLoading ? <Skeleton /> : data?.next_month_count}
                </Typography>    
            </CardContent>
        </Card>
    )
}

export default MonthlyForecast
