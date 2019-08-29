import React from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import CssBaseline from '@material-ui/core/CssBaseline';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ListItem from '@material-ui/core/ListItem';
import {
  BrowserRouter as Router, Route, Link,
} from 'react-router-dom';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Icon from '@material-ui/core/Icon';
import { createBrowserHistory } from 'history';
import Logo from './assets/img/linea.png';
import RefineOrbits from './components/RefineOrbits';
import PredictionOccultation from './components/PredictionOccultation';
import PredictionDetail from './components/PredictionDetail';
import Footer from './Footer';
import OrbitRunDetail from './components/OrbitRunDetail';
import PredictAsteroid from './components/PredictAsteroid';


const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    height: '100%',
  },
  appBar: {
    backgroundColor: '#fff',
    boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2)',
    color: '#000',
    width: `calc(100% - ${theme.spacing(7) + 1}px)`,
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
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
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
  drawerOpen: {
    background: '#454545',
    borderRight: 'none',
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
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
  },
  bodyWrapper: {
    height: '100%',
    width: '100%',
    marginTop: '64px',
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
}));

function MiniDrawer() {
  const classes = useStyles();
  const [open, setOpen] = React.useState(true);

  function handleDrawerOpen() {
    setOpen(true);
  }

  function handleDrawerClose() {
    setOpen(false);
  }

  return (
    <div className={classes.root}>
      <Router history={createBrowserHistory}>
        <CssBaseline />
        <AppBar
          position="fixed"
          className={clsx(classes.appBar, {
            [classes.appBarShift]: open,
          })}
        >
          <Toolbar>
            <Typography variant="h6" component="h1">
              Dashboard
            </Typography>
          </Toolbar>
        </AppBar>
        <Drawer
          variant="permanent"
          className={clsx(classes.drawer, {
            [classes.drawerOpen]: open,
            [classes.drawerClose]: !open,
          })}
          classes={{
            paper: clsx({
              [classes.drawerOpen]: open,
              [classes.drawerClose]: !open,
            }),
          }}
          open={open}
        >
          <List className={classes.drawerList}>
            <Link to="/dashboard" className={classes.invisibleLink}>
              <ListItem button>
                <ListItemText
                  primary={(
                    <>
                      <ListItemIcon className={clsx(classes.ListIconDrawer, open ? classes.logoBlock : '')}>
                        <img src={Logo} alt="TNO" className={clsx(open ? classes.iconHomeOpen : classes.iconHomeClose)} />
                      </ListItemIcon>
                    </>
                  )}
                  className={clsx(classes.homeBtn, classes.textDrawer)}
                />
              </ListItem>
            </Link>
            <Divider className={classes.borderDrawer} />
            <Link to="/dashboard" className={classes.invisibleLink}>
              <ListItem button>
                <ListItemIcon className={clsx(classes.ListIconDrawer, open ? classes.ListIconDrawerOpen : '')}>
                  <Icon className={clsx(classes.iconDrawer, 'fa', 'fa-home')} />
                </ListItemIcon>
                <ListItemText
                  primary="Dashboard"
                  className={classes.textDrawer}
                />
              </ListItem>
            </Link>
            <Divider className={classes.borderDrawer} />
            <Link to="/registration" className={classes.invisibleLink}>
              <ListItem button>
                <ListItemIcon className={clsx(classes.ListIconDrawer, open ? classes.ListIconDrawerOpen : '')}>
                  <Icon className={clsx(classes.iconDrawer, 'fa', 'fa-user-plus')} />
                </ListItemIcon>
                <ListItemText
                  primary="Registration"
                  className={classes.textDrawer}
                />
              </ListItem>
            </Link>
            <Divider className={classes.borderDrawer} />
            <Link to="/pointings" className={classes.invisibleLink}>
              <ListItem button>
                <ListItemIcon className={clsx(classes.ListIconDrawer, open ? classes.ListIconDrawerOpen : '')}>
                  <Icon className={clsx(classes.iconDrawer, 'fa', 'fa-dot-circle')} />
                </ListItemIcon>
                <ListItemText
                  primary="Pointings"
                  className={classes.textDrawer}
                />
              </ListItem>
            </Link>
            <Divider className={classes.borderDrawer} />
            <Link to="/ssso" className={classes.invisibleLink}>
              <ListItem button>
                <ListItemIcon className={clsx(classes.ListIconDrawer, open ? classes.ListIconDrawerOpen : '')}>
                  <Icon className={clsx(classes.iconDrawer, 'fa', 'fa-satellite', classes.iconAltixDrawer)} />
                </ListItemIcon>
                <ListItemText
                  primary="Search SSSO"
                  className={classes.textDrawer}
                />
              </ListItem>
            </Link>
            <Divider className={classes.borderDrawer} />
            <Link to="/skybot" className={classes.invisibleLink}>
              <ListItem button>
                <ListItemIcon className={clsx(classes.ListIconDrawer, open ? classes.ListIconDrawerOpen : '')}>
                  <Icon className={clsx(classes.iconDrawer, 'fa', 'fa-star', classes.iconAltixDrawer)} />
                </ListItemIcon>
                <ListItemText
                  primary="Skybot Run"
                  className={classes.textDrawer}
                />
              </ListItem>
            </Link>
            <Divider className={classes.borderDrawer} />
            <Link to="/objects" className={classes.invisibleLink}>
              <ListItem button>
                <ListItemIcon className={clsx(classes.ListIconDrawer, open ? classes.ListIconDrawerOpen : '')}>
                  <Icon className={clsx(classes.iconDrawer, 'fa', 'fa-filter', classes.iconAltixDrawer)} />
                </ListItemIcon>
                <ListItemText
                  primary="Filter Objects"
                  className={classes.textDrawer}
                />
              </ListItem>
            </Link>
            <Divider className={classes.borderDrawer} />
            <Link to="/astrometry" className={classes.invisibleLink}>
              <ListItem button>
                <ListItemIcon className={clsx(classes.ListIconDrawer, open ? classes.ListIconDrawerOpen : '')}>
                  <Icon className={clsx(classes.iconDrawer, 'fa', 'fa-meteor', classes.iconAltixDrawer)} />
                </ListItemIcon>
                <ListItemText
                  primary="Astrometry"
                  className={classes.textDrawer}
                />
              </ListItem>
            </Link>
            <Divider className={classes.borderDrawer} />
            <Link to="/refine-orbits" className={classes.invisibleLink}>
              <ListItem button>
                <ListItemIcon className={clsx(classes.ListIconDrawer, open ? classes.ListIconDrawerOpen : '')}>
                  <Icon className={clsx(classes.iconDrawer, 'fa', 'fa-globe-americas', classes.iconAltixDrawer)} />
                </ListItemIcon>
                <ListItemText
                  primary="Refine Orbits"
                  className={classes.textDrawer}
                />
              </ListItem>
            </Link>
            <Divider className={classes.borderDrawer} />
            <Link to="/prediction-of-occultation" className={classes.invisibleLink}>
              <ListItem button>
                <ListItemIcon className={clsx(classes.ListIconDrawer, open ? classes.ListIconDrawerOpen : '')}>
                  <Icon className={clsx(classes.iconDrawer, 'fa', 'fa-chart-area', classes.iconAltixDrawer)} />
                </ListItemIcon>
                <ListItemText
                  primary="Prediction of Occultation"
                  className={classes.textDrawer}
                />
              </ListItem>
            </Link>
            <Divider className={classes.borderDrawer} />
            <Link to="/occultations" className={classes.invisibleLink}>
              <ListItem button>
                <ListItemIcon className={clsx(classes.ListIconDrawer, open ? classes.ListIconDrawerOpen : '')}>
                  <Icon className={clsx(classes.iconDrawer, 'fa', 'fa-eye-slash', classes.iconAltixDrawer)} />
                </ListItemIcon>
                <ListItemText
                  primary="Occultations"
                  className={classes.textDrawer}
                />
              </ListItem>
            </Link>
            <Divider className={classes.borderDrawer} />
            <Link to="/occultation-calendar" className={classes.invisibleLink}>
              <ListItem button>
                <ListItemIcon className={clsx(classes.ListIconDrawer, open ? classes.ListIconDrawerOpen : '')}>
                  <Icon className={clsx(classes.iconDrawer, 'fa', 'fa-calendar-alt', classes.iconAltixDrawer)} />
                </ListItemIcon>
                <ListItemText
                  primary="Occultation Calendar"
                  className={classes.textDrawer}
                />
              </ListItem>
            </Link>
            <Divider className={classes.borderDrawer} />
            <Link to="/light-curve" className={classes.invisibleLink}>
              <ListItem button>
                <ListItemIcon className={clsx(classes.ListIconDrawer, open ? classes.ListIconDrawerOpen : '')}>
                  <Icon className={clsx(classes.iconDrawer, 'fa', 'fa-lightbulb', classes.iconAltixDrawer)} />
                </ListItemIcon>
                <ListItemText
                  primary="Light Curve Analysis"
                  className={classes.textDrawer}
                />
              </ListItem>
            </Link>
            <Divider className={classes.borderDrawer} />
          </List>
          <div className={classes.drawerControlWrapper}>
            <IconButton
              onClick={open ? handleDrawerClose : handleDrawerOpen}
              className={clsx(classes.ListIconDrawer, classes.ListIconControlDrawer)}
            >
              {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </IconButton>
          </div>
        </Drawer>
        <div className={classes.bodyWrapper}>
          <main className={classes.content}>
            <Route exact path="/refine-orbits" component={RefineOrbits} />
            <Route exact path="/prediction-of-occultation" component={PredictionOccultation} />
            <Route exact path="/prediction-detail/:id" component={PredictionDetail} />
            <Route exact path="/orbit-run-detail/:id" component={OrbitRunDetail} />
            <Route exact path="/predict-asteroid" component={PredictAsteroid} />
          </main>
          <Footer drawerOpen={open} />
        </div>
      </Router>
    </div>
  );
}

export default MiniDrawer;
