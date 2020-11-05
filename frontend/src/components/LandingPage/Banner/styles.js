import { makeStyles } from '@material-ui/core/styles';
import { deepOrange } from '@material-ui/core/colors';

const styles = makeStyles((theme) => ({
  root: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: `url(${process.env.PUBLIC_URL}/img/home1.jpg)`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    height: 380,
    marginBottom: theme.spacing(4),
  },
  container: {
    background: 'transparent',
    position: 'relative',
    textAlign: 'center',
    color: '#FFF',
    zIndex: 2,
    marginTop: '0',
    // minHeight: 300,
  },
  table: {
    margin: 'auto',
    paddingBottom: 8,
  },
  // logo: {
  //   maxHeight: 48,
  //   paddingTop: '8px',
  // },
  particlesWrapper: {
    position: 'absolute',
    top: 40,
    width: '100%',
    zIndex: 1,
    height: 340,
  },
  userWrapper: {
    borderRadius: '50%',
    margin: '0 7px',
  },
  button: {
    zIndex: 1,
    [theme.breakpoints.up('sm')]: {
      float: 'right',
    },
  },
  title: {
    fontFamily: 'Oxanium',
    fontWeight: 100,
    fontSize: 60,
    margin: 0,
    [theme.breakpoints.down('sm')]: {
      fontSize: 48,
      margin: `0 ${theme.spacing(2)}px`,
    },
    textShadow: 'black 0.1em 0.1em 0.2em',
  },
  subtitle: {
    position: 'relative',
    width: '400px',
    marginTop: '-22px',
    fontFamily: 'Oxanium',
    fontWeight: 100,
    fontSize: 35,
    [theme.breakpoints.up('sm')]: {
      fontSize: 35,
      marginTop: 0,
    },
    paddingTop: 8,
    textShadow: 'black 0.1em 0.1em 0.2em',
  },
  positionTitle: {
    textAlign: '-webkit-center',
  },
  logo: {
    position: 'relative',
    [theme.breakpoints.up('sm')]: {
      maxWidth: 120,
    },
    maxWidth: 120,
  },
  titleWrapper: {
    [theme.breakpoints.up('sm')]: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
  },
  descriptionWrapper: {
    margin: 'auto',
    textShadow: '1px 1px 1px #333',
  },
  avatar: {
    margin: 10,
    cursor: 'pointer',
    color: theme.palette.getContrastText(deepOrange[500]),
    backgroundColor: deepOrange[500],
  },
  separatorToolBar: {
    flexGrow: 1,
  },
  floarRight: {
    width: '100%',
    textAlign: 'right',
    paddingRight: 40,
  },

  socialWrapper: {
    color: '#fff',
    position: 'absolute',
    right: 0,
    bottom: 0,
    zIndex: 2,
  },
}));

export default styles;
