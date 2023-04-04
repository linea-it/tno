import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Grid, Card, CardHeader, CardContent, Toolbar, Icon, Button, Typography } from '@material-ui/core'
import Table from '../../components/Table'
import {
  getPredictionJobResultById,
  getOccultationsByAsteroid
} from '../../services/api/PredictOccultation'
import List from '../../components/List'
import moment from '../../../node_modules/moment/moment'

function PredictionAsteroid() {
  const { id } = useParams()

  const navigate = useNavigate()
  const [predictionJobResult, setPredictionJobResult] = useState({
    asteroid: 0,
    status: 0,
    asteroid_name: "",
    asteroid_number: "",
    des_obs: "",
    exec_time: "",
    pre_occ_count: 0,
    ing_occ_count: 0
  })

  const [summary, setSummary] = useState([])
  const [occultationsTable, setOccultationsTable] = useState([])
  const [occultationsCount, setOccultationsCount] = useState(0)
  const [asteroidId, setAsteroidId] = useState(0);

  useEffect(() => {
    getPredictionJobResultById(id).then((res) => {
      setPredictionJobResult(res)
      setAsteroidId(res.asteroid)
      loadOccultationsData({
        asteroid_id: res.asteroid,
        currentPage: 0,
        pageSize: 10,
        sorting: [{ columnName: 'id', direction: 'asc' }]
      })
    })

  }, [id])

  const occultationsTableColumns = [
      {
        name: 'index',
        title: ' ',
        width: 70,
        sortingEnabled: false
      },
      {
        name: 'date_time',
        title: 'Date',
        width: 150,
        align: 'center',
        customElement: (row) => row.date_time ? <span title={moment(row.date_time).format('YYYY-MM-DD HH:mm:ss')}>{moment(row.date_time).format('YYYY-MM-DD HH:mm:ss')}</span> : <span>Invalid Date</span>
      },
      {
        name: 'ra_star_deg',
        title: 'RA Star (DEG) ',
        width: 150,
        align: 'center',
        customElement: (row) => <span>{row.ra_star_deg?row.ra_star_deg.toFixed(1):''}</span>
      },
      {
        name: 'dec_star_deg',
        title: 'Dec Star (DEG) ',
        width: 150,
        align: 'center',
        customElement: (row) => <span>{row.dec_star_deg?row.dec_star_deg.toFixed(1):''}</span>
      },
      {
        name: 'ra_target_deg',
        title: 'RA Target (DEG) ',
        width: 150,
        align: 'center',
        customElement: (row) => <span>{row.ra_target_deg?row.ra_target_deg.toFixed(1):''}</span>
      },
      {
        name: 'dec_target_deg',
        title: 'Dec Target (DEG) ',
        width: 150,
        align: 'center',
        customElement: (row) => <span>{row.dec_target_deg?row.dec_target_deg.toFixed(1):''}</span>
      },
      
  ]



  useEffect(() => {
      setSummary([
        {
          title: '# Status',
          value: predictionJobResult.status == 1 ? 'success' : 'failure'
        },
        {
          title: '# Asteroid Name',
          value: predictionJobResult.asteroid_name
        },
        {
          title: '# Asteroid Number',
          value: predictionJobResult.asteroid_number
        },
        {
          title: '# Des Obs',
          value: predictionJobResult.des_obs
        },
        {
          title: '# Execution time',
          value: predictionJobResult.exec_time
        },
        {
          title: '# Pre Occ Count',
          value: predictionJobResult.pre_occ_count
        },
        {
          title: '# ING Occ Count',
          value: predictionJobResult.ing_occ_count
        }
      ])
  }, [predictionJobResult])

  const loadOccultationsData = ({ asteroid_id, currentPage, pageSize, sorting }) => {
      const ordering = sorting[0].direction === 'desc'? `-${sorting[0].columnName}`: sorting[0].columnName;
      // Current Page count starts at 0, but the endpoint expects the 1 as the first index:
      const page = currentPage + 1
      
      getOccultationsByAsteroid({asteroid_id: asteroid_id?asteroid_id:asteroidId, page, pageSize, ordering}).then((res) => {
        setOccultationsTable(res);
        setOccultationsCount(res.length);
      })
  }

  const handleBackNavigation = () => navigate(-1)

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Grid container alignItems='center' spacing={2}>
          <Grid item>
            <Button variant='contained' color='primary' title='Back' onClick={handleBackNavigation}>
              <Icon className='fas fa-undo' fontSize='inherit' />
              <Typography variant='button' style={{ margin: '0 5px' }}>
                Back
              </Typography>
            </Button>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12} md={4}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Card>
              <CardHeader title='Summary' />
              <CardContent>
                <List data={summary} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12} md={8}>
        <Card>
          <CardHeader title='Asteroid Graphic' />
          <CardContent>
            {/* <img src={graphFake} style={{ width:'100%', margin: 'auto' }} /> */}
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Occultations' />
          <CardContent>            
              <Table
                columns={occultationsTableColumns}
                data={occultationsTable}
                loadData={loadOccultationsData}
                totalCount={occultationsCount}
                hasSearching={false}
                hasFiltering={false}
                hasColumnVisibility={true}
                hasToolbar={true}
                defaultSorting={[{ columnName: 'date_time', direction: 'asc' }]}
              />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default PredictionAsteroid
