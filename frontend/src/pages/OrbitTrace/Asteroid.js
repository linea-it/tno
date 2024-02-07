import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Grid, Card, CardHeader, CardContent, CardMedia, Icon, Button, Typography, CircularProgress } from '@material-ui/core'
import Table from '../../components/Table'
import {
  getOrbitTraceJobResultById,
  getObservationByAsteroid,
  getPlotObservationByAsteroid
} from '../../services/api/OrbitTrace'
import List from '../../components/List'
import moment from '../../../node_modules/moment/moment'
import useStyles from './styles'
import { Alert } from '@material-ui/lab'

function OrbitTraceAsteroid() {
  const { id } = useParams()
  const classes = useStyles()

  const navigate = useNavigate()
  const [orbitTraceResult, setOrbitTraceResult] = useState({
    asteroid: 0,
    status: 0,
    name: "",
    number: "",
    base_dynclass: "",
    dynclass: "",
    observations: 0,
    ccds: 0,
    error: "",
    exec_time: "",
  })

  const [summary, setSummary] = useState([])
  const [observationsTable, setObservationsTable] = useState([])
  const [observationsCount, setObservationsCount] = useState(0)
  const [asteroidId, setAsteroidId] = useState(0)

  const [observationPlot, setObservationPlot] = useState("")
  const [observationPlotError, setObservationPlotError] = useState(false)


  useEffect(() => {
    getOrbitTraceJobResultById(id).then((res) => {
      setAsteroidId(res.asteroid)
      setOrbitTraceResult(res)
      loadObservationsData({
        asteroid_id: res.asteroid,
        currentPage: 0,
        pageSize: 50,
        sorting: [{ columnName: 'id', direction: 'asc' }]
      })
      if(res.status != 2){
        getPlotObservationByAsteroid(res.name).then((res) => {
          setObservationPlot(res.plot_url)
        }).catch(function (error) {
          setObservationPlotError(true);
          setObservationPlot("")
        })
      }
    })

  }, [id])

  const observationsTableColumns = [
      {
        name: 'index',
        title: ' ',
        sortingEnabled: false,
        width: 70
      },
      {
        name: 'ccd_id',
        title: 'CCD',
        align: 'center',
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
        customElement: (row) => <span>{row.ra.toFixed(4)}</span>
      },
      {
        name: 'dec',
        title: 'Dec (DEG) ',
        width: 150,
        align: 'center',
        customElement: (row) => <span>{row.dec.toFixed(4)}</span>
      },
      {
        name: 'offset_ra',
        title: 'Offset RA (DEG) ',
        width: 150,
        align: 'center',
        customElement: (row) => <span>{row.offset_ra.toFixed(4)}</span>
      },
      {
        name: 'offset_dec',
        title: 'Offset Dec (DEG) ',
        width: 150,
        align: 'center',
        customElement: (row) => <span>{row.offset_dec.toFixed(4)}</span>
      },
      {
        name: 'mag_psf',
        title: 'Mag PSF ',
        width: 150,
        align: 'center',
        customElement: (row) => <span>{row.mag_psf.toFixed(3)}</span>
      },
      {
        name: 'mag_psf_err',
        title: 'Mag PSF Error',
        width: 150,
        align: 'center',
        customElement: (row) => <span>{row.mag_psf_err.toFixed(3)}</span>
      },



  ]



  useEffect(() => {
      let defaultSummary = [
        {
          title: 'Status',
          value: orbitTraceResult.status == 1 ? 'success' : 'failure'
        },
        {
          title: 'Asteroid Name',
          value: orbitTraceResult.name
        },
        {
          title: 'Asteroid Number',
          value: orbitTraceResult.number
        },
        {
          title: 'Base DynClass',
          value: orbitTraceResult.base_dynclass
        },
        {
          title: 'DynClass',
          value: orbitTraceResult.dynclass
        },
        {
          title: 'Observations',
          value: orbitTraceResult.observations
        },
        {
          title: 'CCDs',
          value: orbitTraceResult.ccds
        },
        {
          title: 'Execution Time',
          value: orbitTraceResult.exec_time ? orbitTraceResult.exec_time.split('.')[0] : "-"
        }
      ]
      setSummary(defaultSummary)
  }, [orbitTraceResult])

  const loadObservationsData = ({ asteroid_id, currentPage, pageSize, sorting }) => {
    // Current Page count starts at 0, but the endpoint expects the 1 as the first index:
    const page = currentPage + 1
    const ordering = sorting[0].direction === 'desc'? `-${sorting[0].columnName}`: sorting[0].columnName;

    getObservationByAsteroid({asteroid_id: asteroid_id?asteroid_id:asteroidId, page, pageSize, ordering: ordering}).then((res) => {
      setObservationsTable(res.results);
      setObservationsCount(res.count);
    })

  }

  const handleBackNavigation = () => navigate(-1)
  console.log(summary)
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
      {'error' in orbitTraceResult && orbitTraceResult.status === 2 && orbitTraceResult.error !== null && (
        <Grid item xs={12}>
          <Alert severity='error'>{orbitTraceResult.error}</Alert>
        </Grid>
      )}
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
          {orbitTraceResult.status != 2 && <>
            {observationPlotError && <CardContent>
              <label className={classes.errorText}>An error occurred while the plot was generated</label>
            </CardContent>}
            {!observationPlotError && observationPlot === '' && <CircularProgress className={classes.loadingPlot} disableShrink size={100} />}
            {!observationPlotError && observationPlot !== "" && (
              <CardMedia
                component="iframe"
                height="100%"
                frameBorder="0"
                src={observationPlot}
              />
            )}
          </>}

          {/* <iframe src="/data/tmp/plot_des_observations_Eris-2013-08-30-2018-10-20.html"></iframe> */}
          {/* <CardContent>

            <img src={graphFake} style={{ width:'100%', margin: 'auto' }} />
          </CardContent> */}
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
                hasFiltering={false}
                hasColumnVisibility={true}
                hasToolbar={true}
                pageSizes={[5, 10, 25, 50,100]}
                pageSize={50}
                defaultSorting={[{ columnName: 'date_obs', direction: 'asc' }]}
              />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default OrbitTraceAsteroid
