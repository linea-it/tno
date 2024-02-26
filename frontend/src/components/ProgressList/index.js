import PropTypes from 'prop-types'
import moment from 'moment'
import Grid from '@mui/material/Grid'
import Progress from '../Progress'
import useStyles from './styles'

function ProgressList({ lista }) {
  const classes = useStyles()

  return (
    <>
      {lista.map((item, i) => (
        <Grid item key={`progress_${i}`}>
          <Progress key={item.step} title={item.task} variant='determinate' label={`teste`} total={item.count} current={item.current} />
          <label>
            {item.current}/{item.count}
          </label>
          <br />
          <div>
            <i className={classes.labelInfo}>
              Success: {item.success} / Failures: {item.failures}
            </i>
            <i className={classes.labelTimes}>
              Average Time: {moment.utc(item.average_time * 1000).format('HH:mm:ss')} / Estimated Time:{' '}
              {moment.utc(item.time_estimate * 1000).format('HH:mm:ss')}
            </i>
          </div>
        </Grid>
      ))}
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
