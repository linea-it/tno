import { makeStyles } from '@mui/styles'

const styles = makeStyles((theme) => ({
  root: {
    position: 'relative',
    display: 'flex',
    background: `url(${process.env.PUBLIC_URL}/img/publicPortalBanner.jpg)`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    minHeight: 320,
    [theme.breakpoints.down('sm')]: {
      minHeight: 330
    },
    borderBottom: '5px solid #ffffff',
  },
  container: {
    background: 'transparent',
    position: 'relative',
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
      maxWidth: 150,
      margin: '0 auto',
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
  },
  bannerWrapper: {
    [theme.breakpoints.up('sm')]: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }
  },
  textOcultatiom: {
    paddingTop: '10px',
    paddingBottom: '10px'
  },
  textTitleOcultatiom: {
    fontFamily: 'Oxanium',
    fontWeight: 100,
    fontSize: 20,
  },
  menuLink: {
    textDecoration: 'none',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    cursor: 'pointer'
  },
}))

export default styles
