import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Grid, Card, CardHeader, CardContent, Icon, Button, Typography } from '@material-ui/core'
import OccultationTable from '../../components/OccultationTable'
import {
  getPredictionJobResultById,
  getOccultationsByAsteroid
} from '../../services/api/PredictOccultation'
import List from '../../components/List'
import moment from '../../../node_modules/moment/moment'
import { InfoOutlined as InfoOutlinedIcon } from '@material-ui/icons'
import { CircularProgress } from '../../../node_modules/@material-ui/core/index'
import styles from './styles'


function PredictionAsteroid() {
  const { id } = useParams()
  const navigate = useNavigate()
  const classes = styles();
  const [predictionJobResult, setPredictionJobResult] = useState({
    asteroid: 0,
    status: 0,
    name: "",
    number: "",
    base_dynclass: "",
    dynclass: "",
    des_obs: 0,
    exec_time: "",
    occultations: 0,
    bsp_jpl_dw_time: "",
    obs_dw_time: "",
    orb_ele_dw_time: "",
    des_obs_exec_time: "",
    ref_orb_exec_time: "",
    pre_occ_exec_time: "",
    ing_occ_exec_time: "",
  })

  const [summary, setSummary] = useState([])
  const [occultationsTable, setOccultationsTable] = useState([])
  const [occultationsCount, setOccultationsCount] = useState(0)
  const [asteroidId, setAsteroidId] = useState(0);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
      setSummary([
        {
          title: 'Status',
          value: predictionJobResult.status == 1 ? 'success' : 'failure'
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
          title: 'Execution time',
          value: predictionJobResult.exec_time?predictionJobResult.exec_time.split('.')[0]:"-"
        },
        {
          title: '# Occultations',
          value: predictionJobResult.occultations
        },
        {
          title: '# Des Observations',
          value: predictionJobResult.des_obs
        },
        {
          title: 'Download BSP',
          value: predictionJobResult.bsp_jpl_dw_time?predictionJobResult.bsp_jpl_dw_time.split('.')[0]:"-"
        },
        {
          title: 'Observations Download Time',
          value: predictionJobResult.obs_dw_time?predictionJobResult.obs_dw_time.split('.')[0]:"-"
        },
        {
          title: 'Orbital Elements Download Time',
          value: predictionJobResult.orb_ele_dw_time?predictionJobResult.orb_ele_dw_time.split('.')[0]:"-"
        },
        {
          title: 'DES Observations Execution Time',
          value: predictionJobResult.des_obs_exec_time?predictionJobResult.des_obs_exec_time.split('.')[0]:"-"
        },
        {
          title: 'Refine Orbit Execution Time',
          value: predictionJobResult.ref_orb_exec_time?predictionJobResult.ref_orb_exec_time.split('.')[0]:"-"
        },
        {
          title: 'Predict Occultation Execution Time',
          value: predictionJobResult.pre_occ_exec_time?predictionJobResult.pre_occ_exec_time.split('.')[0]:"-"
        },
        {
          title: 'Result Ingestion Execution Time',
          value: predictionJobResult.ing_occ_exec_time?predictionJobResult.ing_occ_exec_time.split('.')[0]:"-"
        },
      ])
  }, [predictionJobResult])

  const loadOccultationsData = ({ asteroid_id, currentPage, pageSize, sorting }) => {
    if(asteroid_id || asteroidId){  
      setLoading(true);
      const ordering = sorting[0].direction === 'desc'? `-${sorting[0].columnName}`: sorting[0].columnName;
      // Current Page count starts at 0, but the endpoint expects the 1 as the first index:
      const page = currentPage + 1
      
      getOccultationsByAsteroid({asteroid_id: asteroid_id?asteroid_id:asteroidId, page, pageSize, ordering}).then((res) => {
        
        setOccultationsTable(res.results.map((row) => ({
          key: row.id,
          detail: `/dashboard/occultation-detail/${row.id}`,
          ...row
        })));
        setOccultationsCount(res.count);
        setLoading(false);
      })
    }
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
        <OccultationTable
          loadData={loadOccultationsData}
          tableData={occultationsTable}
          totalCount={occultationsCount}
          />
      </Grid>
    </Grid>
  )
}

export default PredictionAsteroid
