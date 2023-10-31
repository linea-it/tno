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
        <Card sx={{ height: '90%', borderRadius: '10px' }}>
            <CardHeader
                title={
                    isLoading ? (
                        <Skeleton
                            width={200}
                            animation="wave"
                        />
                    ) : (
                        'UPCOMING THIS MONTH'
                    )
                }
                titleTypographyProps={{ variant: 'h6', fontSize: '1.0rem', color:'#4f4e4e'}}
            />
            <CardContent>
                <Typography
                    variant="h3"
                    sx={{ fontWeight: 700, fontSize: "1.8rem", textAlign: "left", paddingBottom: '10px', color:'#4383cc' }}>
                    {isLoading ? <Skeleton /> : data?.month_count}
                </Typography>
                <Typography variant="body2" sx={{ margin: '5px 0', fontSize: '0.9rem' }}>
                    <strong>Next Month:</strong> {isLoading ? <Skeleton /> : data?.next_month_count}
                </Typography>    
            </CardContent>
        </Card>
    )
}

export default MonthlyForecast
