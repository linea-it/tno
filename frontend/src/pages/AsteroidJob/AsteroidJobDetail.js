import React, { useEffect, useState } from 'react'
import Grid from '@mui/material/Grid'
import { useParams, useNavigate } from 'react-router-dom'
import { getAsteroidJobById, getAsteroidJobByIdTwo } from '../../services/api/AsteroidJob'
import { useQuery } from 'react-query'
import Alert from '@mui/material/Alert'
import moment from 'moment'
import ColumnStatus from '../../components/Table/ColumnStatus'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import List from '../../components/List'
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos'

function AsteroidJob() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [summaryExecution, setSummaryExecution] = useState([])
  const handleBackNavigation = () => navigate(-1)

  // consultando api para buscar os dados
  const { data, isLoading } = useQuery({
    queryKey: ['asteroidJob', { id }],
    //queryFn: getAsteroidJobById,
    queryFn: () => getAsteroidJobById({ queryKey: [{ id }] }),
    keepPreviousData: false,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnmount: false,
    refetchOnReconnect: false,
    staleTime: 1 * 60 * 60 * 1000
  })

  //itens das linhas da tabela
  useEffect(() => {
    if (data?.status) {
      setSummaryExecution([
        {
          title: 'ID',
          value: data?.id
        },
        {
          title: 'Status',
          value: () => <ColumnStatus status={data?.status} align='right' />
        },
        {
          title: 'Submit Time',
          value: data?.submit_time ? moment(data.submit_time).utc().format('YYYY-MM-DD HH:mm:ss') : ''
        },
        {
          title: 'Start Time',
          value: data?.start !== null ? moment(data?.start).utc().format('YYYY-MM-DD HH:mm:ss') : ''
        },
        {
          title: 'End Time',
          value: data?.end !== null ? moment(data?.end).utc().format('YYYY-MM-DD HH:mm:ss') : ''
        },
        {
          title: 'Execution Time',
          value: data?.exec_time !== null ? data?.exec_time : ''
        },
        {
          title: 'Asteroids Before',
          value: data?.asteroids_before !== null ? data?.asteroids_before : ''
        },
        {
          title: 'Asteroids After',
          value: data?.asteroids_after !== null ? data?.asteroids_after : ''
        },
        {
          title: 'Traceback',
          value: ''
        }
      ])
    }
  }, [data])

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={9} xl={9}>
            <Button variant='contained' color='primary' title='Back' onClick={handleBackNavigation} startIcon={<ArrowBackIosIcon />}>
              <Typography variant='button' sx={{ margin: '0 5px' }}>
                Back
              </Typography>
            </Button>
          </Grid>
          {data !== undefined && data.status === 4 && (
            <Grid item xs={12} md={9} xl={9} sx={{ margin: 'auto' }}>
              <Alert severity='error'>{data?.error}</Alert>
            </Grid>
          )}
          {isLoading && <span>Loading</span>}
          {!isLoading && (
            <Grid item xs={12} md={6} xl={6} sx={{ margin: 'auto' }}>
              <Card>
                <CardContent>
                  <List data={summaryExecution} />
                  {data?.traceback !== undefined && (
                    <Typography variant='caption' sx={{ margin: '0 5px', textAlign: 'center' }}>
                      {data?.traceback}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </Grid>
    </Grid>
  )
}

export default AsteroidJob
