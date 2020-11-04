import { makeStyles } from '@material-ui/core/styles';

const styles = makeStyles((theme) => ({
  list: {
    padding: 0,
  },
  avatar: {
    marginRight: 10,
  },
  root: {
    flexGrow: 1,
  },
  appbar: {
    background: '#212121',
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  separator: {
    flexGrow: 1,
  },
  menuList: {
    display: 'flex',
  },
  menuLink: {
    color: '#fff',
    textDecoration: 'none',
    fontWeight: 500,
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  },
  logoLIneA: {
    [theme.breakpoints.up('sm')]: {
      maxWidth: 75,
    },
    maxWidth: 75,
  },
}));

export default styles;
