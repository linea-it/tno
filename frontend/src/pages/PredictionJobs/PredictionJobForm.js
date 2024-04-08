import React from 'react'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import Button from '@mui/material/Button'
import LoadingButton from '@mui/lab/LoadingButton'
import TextField from '@mui/material/TextField'
import StarCatalogSelect from '../../components/StarCatalogSelect/index'
import PlanetaryEphemerisSelect from '../../components/PlanetaryEphemerisSelect/index'
import LeapSecondSelect from '../../components/LeapSecondSelect/index'
import AsteroidSelect from '../../components/AsteroidSelect/AsteroidSelect'
import DateIntervalPicker from './DateIntervalPicker'
import dayjs from 'dayjs'
import Divider from '@mui/material/Divider'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import Alert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'
import * as yup from 'yup'
import { useMutation } from 'react-query'
import { createPredictionJob } from '../../services/api/PredictJobs'

function PredictionJobForm() {
  let formSchema = yup.object().shape({
    filterType: yup.string().required(),
    filterValue: yup.mixed().required(),
    predict_start_date: yup.object().required(),
    predict_end_date: yup.object().required(),
    predict_step: yup.number().positive().integer().required('Ephemeris Step(s) is required'),
    catalog: yup.number().required().positive(),
    bsp_planetary: yup.number().required().positive(),
    leap_second: yup.number().required().positive(),
    debug: yup.boolean().required()
  })

  const initialJobData = {
    filterType: 'name',
    filterValue: undefined,
    predict_start_date: dayjs().utc().startOf('date'),
    predict_end_date: dayjs().utc().add(1, 'month'),
    predict_step: 60,
    catalog: 2,
    bsp_planetary: 2,
    leap_second: 1,
    debug: false
  }

  const [data, setData] = React.useState(initialJobData)
  const [validationErrors, setValidationErrors] = React.useState({})

  const mutation = useMutation((newjob) => {
    return createPredictionJob(newjob)
  })

  const handleClear = () => {
    setData(initialJobData)
    setValidationErrors({})
    mutation.reset()
  }

  const handleExecute = () => {
    formSchema
      .validate(data, { abortEarly: false })
      .then((dataValidated) => {
        setValidationErrors({})
        mutation.mutate(dataValidated)
      })
      .catch((errors) => {
        const tempErrors = {}
        errors.inner.forEach((error) => {
          if (!error.path) return
          tempErrors[error.path] = error.message
        })
        setValidationErrors(tempErrors)
      })
  }

  const dateInterval = (
    <DateIntervalPicker
      value={[data.predict_start_date, data.predict_end_date]}
      onChange={(value) => {
        setData((prev) => {
          return {
            ...prev,
            predict_start_date: value[0],
            predict_end_date: value[1]
          }
        })
      }}
      error={validationErrors}
    />
  )

  const asteroidSelect = (
    <AsteroidSelect
      source={'asteroid'}
      value={{
        filterType: data.filterType,
        filterValue: data.filterValue
      }}
      onChange={(value) => {
        setData((prev) => {
          return {
            ...prev,
            ...value
          }
        })
      }}
      error={'filterValue' in validationErrors}
      required
    />
  )

  const ephemerisStep = (
    <TextField
      id='ephemeris-step'
      label='Ephemeris Step(s)'
      type='number'
      // helperText='Step in time, in seconds, to determine the positions of objects. 600 for distant objects and 60 for nearby objects.'
      required
      fullWidth
      value={data.predict_step}
      onChange={(e) =>
        setData((prev) => {
          return { ...prev, predict_step: e.target.value }
        })
      }
      InputLabelProps={{
        shrink: true
      }}
      error={'predict_step' in validationErrors}
      // helperText={validationErrors?.predict_step}
    />
  )

  const starCatalog = (
    <StarCatalogSelect
      value={data.catalog}
      onChange={(value) =>
        setData((prev) => {
          return { ...prev, catalog: value }
        })
      }
      error={'catalog' in validationErrors}
      required
    />
  )

  const planetaryEphemeris = (
    <PlanetaryEphemerisSelect
      value={data.bsp_planetary}
      onChange={(value) =>
        setData((prev) => {
          return { ...prev, bsp_planetary: value }
        })
      }
      error={'bsp_planetary' in validationErrors}
      required
      readOnly
    />
  )
  const leapSecond = (
    <LeapSecondSelect
      value={data.leap_second}
      onChange={(value) =>
        setData((prev) => {
          return { ...prev, leap_second: value }
        })
      }
      error={'leap_second' in validationErrors}
      readOnly
      required
    />
  )

  const debugSwitch = (
    <FormControlLabel
      control={
        <Switch
          checked={data.debug}
          onChange={(e) =>
            setData((prev) => {
              return { ...prev, debug: e.target.checked }
            })
          }
        />
      }
      label='Debug'
    />
  )

  const errorAlert = () => (
    <Grid item xs={12}>
      <Alert
        severity='error'
        onClose={() => {
          mutation.reset()
        }}
      >
        {mutation.error.message}
      </Alert>
    </Grid>
  )
  const successAlert = () => (
    <Snackbar open={true} autoHideDuration={6000} onClose={() => mutation.reset()} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
      <Alert severity='success' variant='filled' sx={{ width: '100%' }}>
        Prediction job Created successfully
      </Alert>
    </Snackbar>
  )

  return (
    <React.Fragment>
      <Card>
        <CardHeader title='Predict Occultation Run'></CardHeader>
        <CardContent>
          <Box component='form' noValidate autoComplete='off'>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                {dateInterval}
                <Divider />
              </Grid>
              <Grid item xs={12}>
                {asteroidSelect}
              </Grid>
              <Grid item xs={12} sm={6}>
                {ephemerisStep}
              </Grid>
              <Grid item xs={12} sm={6}>
                {starCatalog}
              </Grid>
              <Grid item xs={12} sm={6}>
                {planetaryEphemeris}
              </Grid>
              <Grid item xs={12} sm={6}>
                {leapSecond}
              </Grid>
              <Grid item xs={12} sm={6}>
                {debugSwitch}
              </Grid>
            </Grid>
            {mutation.isError && errorAlert()}
          </Box>
        </CardContent>
        <CardActions>
          <Button onClick={handleClear} variant='outlined' sx={{ ml: 'auto' }}>
            Clear
          </Button>
          {/* <LoadingButton onClick={handleExecute} loading={mutation.isLoading} variant='contained'>
            Execute and add another
          </LoadingButton> */}
          <LoadingButton onClick={handleExecute} loading={mutation.isLoading} variant='contained'>
            Execute
          </LoadingButton>
        </CardActions>
      </Card>
      {mutation.isSuccess && successAlert()}
    </React.Fragment>
  )
}

export default PredictionJobForm
