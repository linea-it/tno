import React, { useEffect, useState, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Button from '@mui/material/Button'
import Icon from '@mui/material/Icon'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import Skeleton from '@mui/material/Skeleton'
import { getPredictionJobResultById } from '../../services/api/PredictOccultation'
import List from '../../components/List'
import { PredictionEventsContext } from '../../contexts/PredictionContext'
import PredictionEventsDataGrid from '../../components/PredictionEventsDataGrid/index'

function PredictionAsteroid() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [predictionJobResult, setPredictionJobResult] = useState(undefined)

  const [summary, setSummary] = useState([])
  const [times, setTimes] = useState([])

  const { setQueryOptions } = useContext(PredictionEventsContext)

  useEffect(() => {
    getPredictionJobResultById(id).then((res) => {
      setPredictionJobResult(res)
      setQueryOptions((prev) => {
        return {
          ...prev,
          filters: {
            ...prev.filters,
            date_time_after: undefined,
            date_time_before: undefined,
            filterType: 'name',
            filterValue: [{ name: res.name }],
            maginitudeMax: undefined,
            nightside: false,
            geo: false,
            jobid: res.job
          }
        }
      })
    })
  }, [id, setQueryOptions])

  useEffect(() => {
    if (predictionJobResult) {
      setSummary([
        {
          title: 'Status',
          value: predictionJobResult.status === 1 ? 'success' : 'failure'
        },
        {
          title: 'Name',
          value: predictionJobResult.name
        },
        {
          title: 'Number',
          value: predictionJobResult.number
        },
        {
          title: 'Dynamic class',
          value: predictionJobResult.base_dynclass
        },
        {
          title: '# Occultations',
          value: predictionJobResult.occultations
        },
        {
          title: '# Des Observations',
          value: predictionJobResult.des_obs
        }
      ])
      setTimes([
        {
          title: 'Execution time',
          value: predictionJobResult.exec_time ? predictionJobResult.exec_time.split('.')[0] : '-'
        },
        {
          title: 'Download BSP',
          value: predictionJobResult.bsp_jpl_dw_time ? predictionJobResult.bsp_jpl_dw_time.split('.')[0] : '-'
        },
        {
          title: 'Observations Download Time',
          value: predictionJobResult.obs_dw_time ? predictionJobResult.obs_dw_time.split('.')[0] : '-'
        },
        {
          title: 'Orbital Elements Download Time',
          value: predictionJobResult.orb_ele_dw_time ? predictionJobResult.orb_ele_dw_time.split('.')[0] : '-'
        },
        {
          title: 'DES Observations Execution Time',
          value: predictionJobResult.des_obs_exec_time ? predictionJobResult.des_obs_exec_time.split('.')[0] : '-'
        },
        {
          title: 'Refine Orbit Execution Time',
          value: predictionJobResult.ref_orb_exec_time ? predictionJobResult.ref_orb_exec_time.split('.')[0] : '-'
        },
        {
          title: 'Predict Occultation Execution Time',
          value: predictionJobResult.pre_occ_exec_time ? predictionJobResult.pre_occ_exec_time.split('.')[0] : '-'
        },
        {
          title: 'Path Coeff Execution Time',
          value: predictionJobResult.calc_path_coeff_exec_time ? predictionJobResult.calc_path_coeff_exec_time.split('.')[0] : '-'
        },
        {
          title: 'Result Ingestion Execution Time',
          value: predictionJobResult.ing_occ_exec_time ? predictionJobResult.ing_occ_exec_time.split('.')[0] : '-'
        }
      ])
    }
  }, [predictionJobResult])

  const handleBackNavigation = () => navigate(-1)

  const loadingCard = (height) => {
    return (
      <Skeleton
        height={height}
        animation='wave'
        sx={{
          paddingTop: 0,
          paddingBotton: 0
        }}
      />
    )
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Grid container alignItems='center' spacing={2}>
          <Grid item>
            <Button variant='contained' color='primary' title='Back' onClick={handleBackNavigation}>
              <Icon className='fas fa-undo' fontSize='inherit' />
              <Typography variant='button' sx={{ margin: '0 5px' }}>
                Back
              </Typography>
            </Button>
          </Grid>
        </Grid>
      </Grid>
      {predictionJobResult !== undefined &&
        'messages' in predictionJobResult &&
        predictionJobResult.status === 2 &&
        predictionJobResult.messages !== null && (
          <Grid item xs={12}>
            <Alert severity='error'>{predictionJobResult?.messages}</Alert>
          </Grid>
        )}
      <Grid item xs={6}>
        {!predictionJobResult && loadingCard(400)}
        {predictionJobResult && (
          <Card>
            <CardHeader title='Summary' titleTypographyProps={{ variant: 'h6' }} />
            <CardContent>
              <List data={summary} />
            </CardContent>
          </Card>
        )}
      </Grid>
      <Grid item xs={6}>
        {!predictionJobResult && loadingCard(400)}
        {predictionJobResult && (
          <Card>
            <CardHeader title='Execution Statistics' titleTypographyProps={{ variant: 'h6' }} />
            <CardContent>
              <List data={times} />
            </CardContent>
          </Card>
        )}
      </Grid>
      <Grid item xs={12} sx={{ mt: 2 }}>
        {!predictionJobResult && loadingCard(600)}
        {predictionJobResult && <PredictionEventsDataGrid />}
      </Grid>
    </Grid>
  )
}

export default PredictionAsteroid
