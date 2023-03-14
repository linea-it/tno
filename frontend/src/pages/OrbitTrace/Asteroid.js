import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Grid, Card, CardHeader, CardContent, Toolbar, Icon, Button, Typography } from '@material-ui/core'
import Table from '../../components/Table'
import {
  getOrbitTraceJobResultById,
  getObservationByAsteroid
} from '../../services/api/OrbitTrace'
import List from '../../components/List'
import graphFake from '../../assets/img/graph_fake.png'
import moment from '../../../node_modules/moment/moment'

function OrbitTraceAsteroid() {
  const { id } = useParams()

  const navigate = useNavigate()
  const [orbitTraceResult, setOrbitTraceResult] = useState({
    asteroid: 0,
    status: 0,
    asteroid_name: "",
    asteroid_number: "",
    base_dynclass: "",
    dynclass: "",
    observations: 0,
    ccds: 0
  })

  const [summary, setSummary] = useState([])
  const [observationsTable, setObservationsTable] = useState([])
  const [observationsCount, setObservationsCount] = useState(0)

  useEffect(() => {
    getOrbitTraceJobResultById(id).then((res) => {
      setOrbitTraceResult(res)
      loadObservationsData({
        asteroid_id: res.asteroid,
        currentPage: 0,
        pageSize: 10,
        sorting: [{ columnName: 'id', direction: 'asc' }]
      })
    })

  }, [id])

  const observationsTableColumns = [
      {
        name: 'name',
        title: 'Name',
        align: 'center',
        sortingEnabled: false,
        customElement: (row) => { return <span>{row.name}</span> },
        width: 180
      },
      {
        name: 'ccd',
        title: 'CCD',
        align: 'center',
        sortingEnabled: false,
        customElement: (row) => { return <span>{row.ccd}</span> },
        width: 180
      },
      {
        name: 'date_obs',
        title: 'Date',
        width: 150,
        align: 'center',
        customElement: (row) => row.date_obs ? <span title={moment(row.date_obs).format('YYYY-MM-DD HH:mm:ss')}>{moment(row.date_obs).format('YYYY-MM-DD HH:mm:ss')}</span> : <span>Invalid Date</span>
      },
      {
        name: 'ra',
        title: 'RA (DEG) ',
        width: 150,
        align: 'center',
        customElement: (row) => <span>{row.ra.toFixed(1)}</span>
      },
      {
        name: 'dec',
        title: 'Dec (DEG) ',
        width: 150,
        align: 'center',
        customElement: (row) => <span>{row.dec.toFixed(1)}</span>
      },
      {
        name: 'offset_ra',
        title: 'Offset RA (DEG) ',
        width: 150,
        align: 'center',
        customElement: (row) => <span>{row.offset_ra.toFixed(2)}</span>
      },
      {
        name: 'offset_dec',
        title: 'Offset Dec (DEG) ',
        width: 150,
        align: 'center',
        customElement: (row) => <span>{row.offset_dec.toFixed(2)}</span>
      },
      {
        name: 'mag_psf',
        title: 'Mag PSF ',
        width: 150,
        align: 'center',
        customElement: (row) => <span>{row.mag_psf.toFixed(2)}</span>
      },
      {
        name: 'mag_psf_err',
        title: 'Mag PSF Error',
        width: 150,
        align: 'center',
        customElement: (row) => <span>{row.mag_psf_err.toFixed(2)}</span>
      }
      
      
  ]



  useEffect(() => {
      setSummary([
        {
          title: '# Status',
          value: orbitTraceResult.status == 1 ? 'success' : 'failure'
        },
        {
          title: '# Asteroid Name',
          value: orbitTraceResult.asteroid_name
        },
        {
          title: '# Asteroid Number',
          value: orbitTraceResult.asteroid_number
        },
        {
          title: '# Base DynClass',
          value: orbitTraceResult.base_dynclass
        },
        {
          title: '# DynClass',
          value: orbitTraceResult.dynclass
        },
        {
          title: '# Observations',
          value: orbitTraceResult.observations
        },
        {
          title: '# CCDs',
          value: orbitTraceResult.ccds
        }
      ])
  }, [orbitTraceResult])

  const loadObservationsData = ({ asteroid_id, currentPage, pageSize, sorting }) => {
    // Current Page count starts at 0, but the endpoint expects the 1 as the first index:
    const page = currentPage + 1
    
    getObservationByAsteroid({asteroid_id, page, pageSize}).then((res) => {
      setObservationsTable(res);
      setObservationsCount(res.length);
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
            {/* {'ccds' in ccdsPlotData ? <CCD data={ccdsPlotData} height={550} /> : <Skeleton variant='rect' hght={550} />} */}
            <img src={graphFake} style={{ width:'100%', margin: 'auto' }} />
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Observations' />
          <CardContent>            
              <Table
                columns={observationsTableColumns}
                data={observationsTable}
                loadData={loadObservationsData}
                totalCount={observationsCount}
                hasSearching={false}
                // hasSorting={false}
                hasFiltering={false}
                hasColumnVisibility={false}
                hasToolbar={false}
              />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default OrbitTraceAsteroid
