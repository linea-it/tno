import PropTypes from 'prop-types'
import moment from 'moment'
import Grid from '@mui/material/Grid'
import Progress from '../Progress'
import useStyles from './styles'

function ProgressList({ stageProgress }) {
  const classes = useStyles()

  return (
    <>
      {stageProgress.map((item, i) => {
        const avgTime = moment.utc(item.average_time * 1000).format('HH:mm:ss')
        const estTime = moment.utc(item.time_estimate * 1000).format('HH:mm:ss')
        return (
          <Grid item key={`progress_${i}`} sx={{ minWidth: 0 }}>
            <Progress
              key={item.step}
              title={item.task}
              variant='determinate'
              total={Number(item.count) || 0}
              current={Number(item.current) || 0}
            />
            <label>
              {Number(item.current) || 0}/{Number(item.count) || 0}
            </label>
            <br />
            <div>
              <span className={classes.labelInfo}>
                Success: {item.success != null ? item.success : '—'} / Failures: {item.failures != null ? item.failures : '—'}
              </span>
              <span className={classes.labelTimes}>
                <span className={classes.timeLine}>Average Time: {avgTime}</span>
                <span className={classes.timeLine}>Estimated Remaining Time: {estTime}</span>
              </span>
            </div>
          </Grid>
        )
      })}
    </>
  )
}

Progress.propTypes = {
  lista: PropTypes.array
}

Progress.defaultProps = {
  lista: []
}

export default ProgressList
