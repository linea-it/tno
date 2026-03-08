import { makeStyles } from '@mui/styles'

const useStyles = makeStyles((theme) => ({
  labelInfo: {
    fontSize: 12,
    display: 'block',
    marginBottom: 4
  },
  labelTimes: {
    fontSize: 12,
    display: 'block',
    marginTop: 4,
    [theme.breakpoints.up('sm')]: {
      textAlign: 'right'
    }
  },
  timeLine: {
    display: 'block',
    fontSize: 12,
    [theme.breakpoints.up('sm')]: {
      textAlign: 'right'
    }
  }
}))

export default useStyles
