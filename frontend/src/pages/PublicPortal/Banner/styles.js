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
      minHeight: 200,
    },
    [theme.breakpoints.down('md')]: {
      minHeight: 250,
    },
    borderBottom: '5px solid #ffffff'
  },
  container: {
    background: 'transparent',
    position: 'relative',
    color: '#FFF',
    zIndex: 2,
    marginTop: '0',
    padding: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(1),
    },
    [theme.breakpoints.down('md')]: {
      padding: theme.spacing(1.5),
    },
  },
  title: {
    fontFamily: 'Oxanium',
    fontWeight: 100,
    fontSize: 50,
    margin: 0,
    [theme.breakpoints.down('sm')]: {
      fontSize: 28,
      textAlign: 'center',
    },
    [theme.breakpoints.down('md')]: {
      fontSize: 28,
    },
    textShadow: 'black 0.1em 0.1em 0.2em',
  },
  logo: {
    position: 'relative',
    maxWidth: 120,
    margin: '0 auto',
    [theme.breakpoints.up('sm')]: {
      maxWidth: 150,
    },
    [theme.breakpoints.up('md')]: {
      maxWidth: 180,
    },
  },
  titleWrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerWrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
      textAlign: 'center',
    },
  },
  textOcultatiom: {
    paddingTop: '10px',
    paddingBottom: '10px',
    fontSize: 18,
    [theme.breakpoints.down('sm')]: {
      display: 'none'
    },
    [theme.breakpoints.down('md')]: {
      fontSize: 16,
    },
  },
  textTitleOcultatiom: {
    fontFamily: 'Oxanium',
    fontWeight: 100,
    fontSize: 20
  },
}))

export default styles
