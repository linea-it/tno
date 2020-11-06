import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    float: 'right',
    height: 64,
    position: 'fixed',
  },
  appBarDrawerClose: {
    top: 'auto',
    bottom: 0,
    backgroundColor: '#212121',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  toolbar: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  versionLink: {
    color: '#d2cf00',
    textDecoration: 'none',
    fontSize: '0.9rem',
    cursor: 'pointer',
  },
  logoLink: {
    lineHeight: 0,
    display: 'inline-block',
    verticalAlign: 'middle',
  },
  poweredBy: {
    display: 'inline-block',
    verticalAlign: 'middle',
    color: '#fff',
  },
  logoFooter: {
    cursor: 'pointer',
    marginLeft: '10px',
    maxWidth: '75px',
  },
  marginItem: {
    marginLeft: 20,
    marginRight: 20,
    marginTop: 5,
  },
}));

export default useStyles;
