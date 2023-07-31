import PropTypes from 'prop-types'
import moment from '../../../node_modules/moment/moment'
import { Grid } from '../../../node_modules/@material-ui/core/index'
import Progress from '../Progress'
import useStyles from './styles'

function ProgressList({ lista }) {

  const classes = useStyles()

  return (
    <>
        {lista.map((item, i) => (
             <Grid item>
                <Progress
                  key={item.step}
                  title={item.task}
                  variant='determinate'
                  label={`teste`}
                  total={item.count}
                  current={item.current}
                /> 
                <label >{item.current}/{item.count}</label><br/>
                <div>
                <i className={classes.labelInfo}>Success: {item.success} / Failures: {item.failures}</i>
                <i className={classes.labelTimes}>Average Time: {moment.utc(((item.average_time) * 1000)).format("HH:mm:ss")} / Estimated Time: {moment.utc(((item.time_estimate) * 1000)).format("HH:mm:ss")}</i>
  
                </div>
                              
            </Grid>
        ))}
    </>
  )
}

Progress.propTypes = {
  lista: PropTypes.array, 
}

Progress.defaultProps = {
  lista: [],
}

export default ProgressList
