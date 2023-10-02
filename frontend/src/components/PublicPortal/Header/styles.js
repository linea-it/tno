import { makeStyles } from '@material-ui/core/styles'

const styles = makeStyles((theme) => ({
  list: {
    padding: 0
  },
  avatar: {
    marginRight: 10
  },
  appbar: {
    background: '#24292e',
    height:'64px'
  },
  menuList: {
    display: 'flex',
    [theme.breakpoints.down('xs')]: {
      flexDirection: 'column'
    }
  },
  menuListItem: {
    [theme.breakpoints.down('xs')]: {
      justifyContent: 'center',
      padding: `${theme.spacing(1)}px 0`
    }
  },
  menuLink: {
    color: '#fff',
    textDecoration: 'none',
    fontWeight: 500,
    textTransform: 'uppercase',
    whiteSpace: 'nowrap'
  },
  logoLIneA:   {
    [theme.breakpoints.up('sm')]: {
      maxWidth: 75,
      marginTop: '5px'
    },
    maxWidth: 75,
  },
  toolbar: {
    display: 'flex',
    [theme.breakpoints.down('xs')]: {
      flexDirection: 'column'
    }
  }
}))

export default styles
