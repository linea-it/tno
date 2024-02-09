import { makeStyles } from '@mui/styles'

const styles = makeStyles((theme) => ({
  root: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: `url(${process.env.PUBLIC_URL}/img/home1.jpg)`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    height: 220,
    [theme.breakpoints.down('sm')]: {
      height: 330
    },
    marginBottom: theme.spacing(4)
  },
  container: {
    background: 'transparent',
    position: 'relative',
    textAlign: 'center',
    color: '#FFF',
    zIndex: 2,
    marginTop: '0'
  },
  title: {
    fontFamily: 'Oxanium',
    fontWeight: 100,
    fontSize: 50,
    margin: 0,
    [theme.breakpoints.down('sm')]: {
      fontSize: 48,
      margin: `0 ${theme.spacing(2)}px`
    },
    textShadow: 'black 0.1em 0.1em 0.2em'
  },
  logo: {
    position: 'relative',
    [theme.breakpoints.up('sm')]: {
      maxWidth: 120
    },
    maxWidth: 120
  },
  titleWrapper: {
    [theme.breakpoints.up('sm')]: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }
  },
  socialWrapper: {
    color: '#fff',
    position: 'absolute',
    right: 0,
    bottom: 0,
    zIndex: 2
  }
}))

export default styles
