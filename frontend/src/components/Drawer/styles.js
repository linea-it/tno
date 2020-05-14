import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'block',
    height: '100%',
  },
  menuButton: {
    marginRight: 36,
    color: '#fff',
  },
  hide: {
    display: 'none',
  },
  drawerList: {
    paddingTop: 0,
  },
  drawer: (props) => ({
    width: props.drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
  }),
  drawerOpen: (props) => ({
    background: '#454545',
    borderRight: 'none',
    width: props.drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
  drawerClose: {
    background: '#454545',
    borderRight: 'none',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: theme.spacing(7),
  },
  drawerControlWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 8px',
    ...theme.mixins.toolbar,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    backgroundColor: 'rgb(240, 241, 244)',
    // height: '100%',
  },
  bodyWrapper: {
    height: '100%',
    width: '100%',
    float: 'right',
    marginTop: '64px',
    // paddingBottom: 64,
    overflow: 'auto',
    backgroundColor: 'rgb(240, 241, 244)',
    maxHeight: 'calc(100% - 128px)',
  },
  bodyWrapperOpen: (props) => ({
    maxWidth: `calc(100% - ${props.drawerWidth}px)`,
  }),
  bodyWrapperClose: {
    maxWidth: `calc(100% - ${theme.spacing(7)}px)`,
  },
  homeBtn: {
    fontSize: 18,
    fontWeight: 'bold !important',
    textAlign: 'center',
    maxWidth: '100%',
    textTransform: 'uppercase',
    display: 'block',
  },
  btnGroup: {
    textAlign: 'right',
    width: '100%',
    color: '#fff',
  },
  invisibleLink: {
    color: 'black',
    textDecoration: 'none',
    display: 'none,',
  },
  textDrawer: {
    color: 'white',
    fontWeight: 500,
  },
  ListIconDrawer: {
    minWidth: 40,
    color: 'white',
  },
  ListIconDrawerOpen: {
    minWidth: 35,
  },
  ListIconControlDrawer: {
    backgroundColor: 'rgba(255,255,255,.2)',
    padding: 7,
  },
  iconDrawer: {
    width: 'auto',
    fontSize: '1.4rem',
  },
  borderDrawer: {
    backgroundColor: 'rgba(255, 255, 255, 0.32)',
  },
  iconHomeOpen: {
    maxWidth: 140,
    borderRadius: 140,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeInOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  iconHomeClose: {
    maxWidth: 42,
    marginLeft: -8,
    borderRadius: 42,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeInOut,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  logoBlock: {
    display: 'block',
  },
  '@global': {
    '.MuiListItem-root.Mui-selected, .MuiListItem-root.Mui-selected:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.34)',
    },
  },
  nested: {
    paddingLeft: theme.spacing(4),
  },
  doublenested: {
    paddingLeft: theme.spacing(6),
  },
}));

export default useStyles;
