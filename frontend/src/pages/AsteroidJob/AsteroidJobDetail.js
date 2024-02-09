import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box';
import { useParams } from 'react-router-dom'
import TextField from '@mui/material/TextField';
import { getAsteroidJobById } from '../../services/api/AsteroidJob';
import { useQuery } from 'react-query';
import Alert from '@mui/material/Alert';
import moment from 'moment';
import ColumnStatus from '../../components/Table/ColumnStatus';
function AsteroidJob() {
  const { id } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ['asteroidJob', { id }],
    queryFn: getAsteroidJobById,
    keepPreviousData: false,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnmount: false,
    refetchOnReconnect: false,
    staleTime: 1 * 60 * 60 * 1000,
  })

  return (
    <Grid container spacing={2}>
      {data !== undefined && data.status === 4 && (
        <Grid item xs={12}>
          <Alert severity='error'>{data?.error}</Alert>
        </Grid>
      )}
      {isLoading && (
        <span>Loading</span>
      )}
      {!isLoading && (
        <Grid item xs={12}>
          <Box
            component="form"
            sx={{
              '& > :not(style)': { m: 1, width: '25ch' },
            }}
            noValidate
            autoComplete="off"
          >
            <TextField
              label="ID"
              value={data?.id}
              InputProps={{
                readOnly: true,
              }}
            />
            <ColumnStatus status={data?.status} />
            <TextField
              label="Submit Time"
              value={moment(data?.submit_time).utc().format('YYYY-MM-DD HH:mm:ss')}
              InputProps={{
                readOnly: true,
              }}
            />
            <TextField
              label="Start Time"
              value={moment(data?.start).utc().format('YYYY-MM-DD HH:mm:ss')}
              InputProps={{
                readOnly: true,
              }}
            />
            <TextField
              label="End Time"
              value={moment(data?.end).utc().format('YYYY-MM-DD HH:mm:ss')}
              InputProps={{
                readOnly: true,
              }}
            />
            <TextField
              label="Execution Time"
              value={data?.exec_time}
              InputProps={{
                readOnly: true,
              }}
            />
            <TextField
              label="Asteroids Before"
              value={data?.asteroids_before}
              InputProps={{
                readOnly: true,
              }}
            />
            <TextField
              label="Asteroids After"
              value={data?.asteroids_after}
              InputProps={{
                readOnly: true,
              }}
            />
            <TextField
              label="Traceback"
              value={data?.traceback !== null ? data.traceback : ''}
              multiline
              rows={4}
              InputProps={{
                readOnly: true,
              }}
            />
          </Box>
        </Grid>
      )}
    </Grid>
  )
}

export default AsteroidJob
