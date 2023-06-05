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
import { InfoOutlined as InfoOutlinedIcon } from '@material-ui/icons'



function PredictionAsteroid() {
  const { id } = useParams()

  const navigate = useNavigate()
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
        name: 'detail',
        title: 'Detail',
        width: 80,
        customElement: (row) => (
          <Button onClick={() => navigate(row.detail)}>
            <InfoOutlinedIcon />
          </Button>
        ),
        align: 'center',
        sortingEnabled: false
      },
      {
        name: 'date_time',
        title: 'Date',
        width: 150,
        align: 'center',
        hide: true,
        customElement: (row) => row.date_time ? <span title={moment(row.date_time).format('YYYY-MM-DD HH:mm:ss')}>{moment(row.date_time).format('YYYY-MM-DD HH:mm:ss')}</span> : <span>Invalid Date</span>
      },
      {
        name: 'ra_star_candidate',
        title: 'RA Star Candidate ',
        width: 150,
        align: 'center',
      },
      {
        name: 'dec_star_candidate',
        title: 'DEC Star Candidate ',
        width: 150,
        align: 'center',
      },
      {
        name: 'ra_target',
        title: 'RA Target ',
        width: 150,
        align: 'center',
      },
      {
        name: 'dec_target',
        title: 'DEC Target ',
        width: 150,
        align: 'center',
      },
      {
        name: 'ra_star_deg',
        title: 'RA Star (DEG) ',
        width: 150,
        align: 'center',
        customElement: (row) => <span>{row.ra_star_deg?row.ra_star_deg.toFixed(2):''}</span>
      },
      {
        name: 'closest_approach',
        title: 'Closest Approach ',
        width: 150,
        align: 'center',
        customElement: (row) => <span>{row.closest_approach?row.closest_approach.toFixed(2):''}</span>
      },
      {
        name: 'position_angle',
        title: 'Position Angle ',
        width: 150,
        align: 'center',
        customElement: (row) => <span>{row.position_angle?row.position_angle.toFixed(2):''}</span>
      },
      {
        name: 'velocity',
        title: 'Velocity ',
        width: 150,
        align: 'center',
        customElement: (row) => <span>{row.velocity?row.velocity.toFixed(2):''}</span>
      },
      {
        name: 'delta',
        title: 'Delta ',
        width: 150,
        align: 'center',
        customElement: (row) => <span>{row.delta?row.delta.toFixed(2):''}</span>
      },
      {
        name: 'g',
        title: 'G ',
        width: 150,
        align: 'center',
        customElement: (row) => <span>{row.g?row.g.toFixed(2):''}</span>
      },
      {
        name: 'j',
        title: 'J ',
        width: 150,
        align: 'center',
        customElement: (row) => <span>{row.j?row.j.toFixed(2):''}</span>
      },
      {
        name: 'h',
        title: 'H ',
        width: 150,
        align: 'center',
        customElement: (row) => <span>{row.h?row.h.toFixed(2):''}</span>
      },
      {
        name: 'k',
        title: 'K ',
        width: 150,
        align: 'center',
        customElement: (row) => <span>{row.k?row.k.toFixed(2):''}</span>
      },
      {
        name: 'long',
        title: 'Long ',
        width: 150,
        align: 'center',
        customElement: (row) => <span>{row.long?row.long.toFixed(2):''}</span>
      },
      {
        name: 'loc_t',
        title: 'Loc T ',
        width: 150,
        align: 'center',
      },
      {
        name: 'off_ra',
        title: 'Off RA ',
        width: 150,
        align: 'center',
        customElement: (row) => <span>{row.off_ra?row.off_ra.toFixed(2):''}</span>
      },
      {
        name: 'off_dec',
        title: 'Off DEC ',
        width: 150,
        align: 'center',
        customElement: (row) => <span>{row.off_dec?row.off_dec.toFixed(2):''}</span>
      },
      {
        name: 'proper_motion',
        title: 'Proper Motion ',
        width: 150,
        align: 'center',
      },
      {
        name: 'ct',
        title: 'CT ',
        width: 150,
        align: 'center',
      },
      {
        name: 'multiplicity_flag',
        title: 'Multiplicity Flag ',
        width: 150,
        align: 'center',
      },
      {
        name: 'e_ra',
        title: 'E RA ',
        width: 150,
        align: 'center',
        customElement: (row) => <span>{row.e_ra?row.e_ra.toFixed(2):''}</span>
      },
      {
        name: 'e_dec',
        title: 'E DEC ',
        width: 150,
        align: 'center',
        customElement: (row) => <span>{row.e_dec?row.e_dec.toFixed(2):''}</span>
      },
      {
        name: 'pmra',
        title: 'PMRA',
        width: 150,
        align: 'center',
        customElement: (row) => <span>{row.pmra?row.pmra.toFixed(2):''}</span>
      },
      {
        name: 'pmdec',
        title: 'PMDEC',
        width: 150,
        align: 'center',
        customElement: (row) => <span>{row.pmdec?row.pmdec.toFixed(2):''}</span>
      },
      {
        name: 'ra_star_deg',
        title: 'RA Star (DEG) ',
        width: 150,
        align: 'center',
        customElement: (row) => <span>{row.ra_star_deg?row.ra_star_deg.toFixed(2):''}</span>
      },
      {
        name: 'dec_star_deg',
        title: 'DEC Star (DEG) ',
        width: 150,
        align: 'center',
        customElement: (row) => <span>{row.dec_star_deg?row.dec_star_deg.toFixed(2):''}</span>
      },
      {
        name: 'ra_target_deg',
        title: 'RA Target (DEG) ',
        width: 150,
        align: 'center',
        customElement: (row) => <span>{row.ra_target_deg?row.ra_target_deg.toFixed(2):''}</span>
      },
      {
        name: 'dec_target_deg',
        title: 'Dec Target (DEG) ',
        width: 150,
        align: 'center',
        customElement: (row) => <span>{row.dec_target_deg?row.dec_target_deg.toFixed(2):''}</span>
      },
      {
        name: 'created_at',
        title: 'Created At',
        width: 150,
        align: 'center',
        customElement: (row) => row.created_at ? <span title={moment(row.created_at).format('YYYY-MM-DD HH:mm:ss')}>{moment(row.created_at).format('YYYY-MM-DD HH:mm:ss')}</span> : <span>Invalid Date</span>
      },
      
  ]



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
    const ordering = sorting[0].direction === 'desc'? `-${sorting[0].columnName}`: sorting[0].columnName;
      // Current Page count starts at 0, but the endpoint expects the 1 as the first index:
      const page = currentPage + 1
      
      getOccultationsByAsteroid({asteroid_id: asteroid_id?asteroid_id:asteroidId, page, pageSize, ordering}).then((res) => {
        
        setOccultationsTable(res.results.map((row) => ({
          key: row.id,
          detail: `/occultation-detail/${row.id}`,
          ...row
        })));
        setOccultationsCount(res.count);
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
