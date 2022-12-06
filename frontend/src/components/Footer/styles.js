import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    float: 'right',
    height: 64
  },
  appBarDrawerOpen: {
    top: 'auto',
    bottom: 0,
    backgroundColor: '#6A6A6A',
    width: 'calc(100% - 240px)',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  appBarDrawerClose: {
    top: 'auto',
    bottom: 0,
    backgroundColor: '#6A6A6A',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  },
  toolbar: {
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  versionLink: {
    color: '#d2cf00',
    textDecoration: 'none',
    fontSize: '0.9rem',
    cursor: 'pointer'
  },
  logoLink: {
    lineHeight: 0,
    display: 'inline-block',
    verticalAlign: 'middle'
  },
  poweredBy: {
    display: 'inline-block',
    verticalAlign: 'middle'
  }
}))

export default useStyles
