import PropTypes from 'prop-types'
import dayjs from 'dayjs'
import 'dayjs/locale/en-gb'
import quarterOfYear from 'dayjs/plugin/quarterOfYear'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'

dayjs.extend(quarterOfYear)

function DateIntervalPicker({ value, onChange, error }) {
  const addInterval = (x, unit) => {
    onChange([value[0], value[0].add(x, unit)])
  }

  const setQuarters = (x) => {
    const year = dayjs().utc().startOf('year')
    const startQtr = year.add(x, 'quarter')
    const start = startQtr.startOf('quarter')
    // console.log(start.format())
    let end = start.endOf('quarter')
    // console.log(end.format())
    onChange([start, end])
  }

  const setThisYear = () => {
    const start = dayjs().utc().startOf('year')
    const end = dayjs().utc().endOf('year')
    onChange([start, end])
  }

  const firstQuarter = (
    <Button size='small' onClick={() => setQuarters(0)}>
      1st qtr.
    </Button>
  )

  const secondQuarter = (
    <Button size='small' onClick={() => setQuarters(1)}>
      2nd qtr.
    </Button>
  )

  const thirdQuarter = (
    <Button size='small' onClick={() => setQuarters(2)}>
      3rd qtr.
    </Button>
  )

  const fourthQuarter = (
    <Button size='small' onClick={() => setQuarters(3)}>
      4th qtr.
    </Button>
  )

  const oneMonth = (
    <Button size='small' onClick={() => addInterval(1, 'month')}>
      1 Month
    </Button>
  )
  const sixMonth = (
    <Button size='small' onClick={() => addInterval(6, 'month')}>
      6 Months
    </Button>
  )
  const oneYear = (
    <Button size='small' onClick={() => addInterval(1, 'year')}>
      1 Year
    </Button>
  )
  const thisYear = (
    <Button size='small' onClick={() => setThisYear()}>
      This Year
    </Button>
  )

  return (
    <Box sx={{ mb: 2 }}>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={'en-gb'}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <DatePicker
              name='predict_start_date'
              label='Initial date'
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: 'predict_start_date' in error,
                  required: true
                }
              }}
              value={value[0]}
              onChange={(newValue) => onChange([newValue, value[1]])}
              sx={{ mb: 2 }}
            />
            <Stack direction='row' justifyContent='center' alignItems='center' spacing={2}>
              <ButtonGroup variant='outlined'>
                {firstQuarter}
                {secondQuarter}
                {thirdQuarter}
                {fourthQuarter}
              </ButtonGroup>
            </Stack>
          </Grid>
          <Grid item xs={12} sm={6}>
            <DatePicker
              name='predict_end_date'
              label='Final date'
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: 'predict_end_date' in error,
                  required: true
                }
              }}
              value={value[1]}
              onChange={(newValue) => onChange([value[0], newValue])}
              sx={{ mb: 2 }}
              error={'predict_end_date' in error}
            />
            <Stack direction='row' justifyContent='center' alignItems='center' spacing={2}>
              <ButtonGroup variant='outlined'>
                {oneMonth}
                {sixMonth}
                {oneYear}
                {thisYear}
              </ButtonGroup>
            </Stack>
          </Grid>
        </Grid>
      </LocalizationProvider>
    </Box>
  )
}

DateIntervalPicker.defaultProps = {
  value: [dayjs().startOf('date'), dayjs().utc().endOf('date')]
}

DateIntervalPicker.propTypes = {
  value: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired
}

export default DateIntervalPicker
