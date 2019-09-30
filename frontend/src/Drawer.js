import React, { useState } from 'react';
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
import Footer from './Footer';
import RefineOrbit from './components/RefineOrbit';
import RefineOrbitDetail from './components/RefineOrbitDetail';
import RefineOrbitAsteroid from './components/RefineOrbitAsteroid';
// import PredictAsteroid from './components/PredictAsteroid';
import AstrometryRun from './components/AstrometryRun';
// import PredictAsteroid from './components/PredictAsteroid';
import Astrometry from './components/Astrometry';
import OccultationCalendar from './components/OccultationCalendar';
import TestCalendar from './components/TestCalendar';
import PredictionOccultation from './components/PredictionOccultation';
import PredictionOccultationDetail from './components/PredictionOccultationDetail';
import PredictionOccultationAsteroid from './components/PredictionOccultationAsteroid';


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
    // height: '100%',
  },
  bodyWrapper: {
    height: '100%',
    width: '100%',
    marginTop: '64px',
  },
  bodyWrapperOpen: {
    maxWidth: `calc(100% - ${drawerWidth}px)`,
  },
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
}));

function MiniDrawer() {
  const classes = useStyles();
  const [open, setOpen] = useState(true);
  const [title, setTitle] = useState('Dashboard');

  const handleDrawerClick = () => setOpen(!open);

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
              {title}
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
            <Link to="/dashboard" className={classes.invisibleLink} title="Laboratório Interinstitucional de e-Astronomia">
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
            <Link to="/dashboard" className={classes.invisibleLink} title="Dashboard">
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
            <Link to="/registration" className={classes.invisibleLink} title="Registration">
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
            <Link to="/pointings" className={classes.invisibleLink} title="Pointings">
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
            <Link to="/ssso" className={classes.invisibleLink} title="Search SSSO">
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
            <Link to="/skybot" className={classes.invisibleLink} title="Skybot Run">
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
            <Link to="/objects" className={classes.invisibleLink} title="Filter Objects">
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
            <Link to="/astrometry" className={classes.invisibleLink} title="Astrometry">
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
            <Link to="/refine-orbit" className={classes.invisibleLink} title="Refine Orbit">
              <ListItem button>
                <ListItemIcon className={clsx(classes.ListIconDrawer, open ? classes.ListIconDrawerOpen : '')}>
                  <Icon className={clsx(classes.iconDrawer, 'fa', 'fa-globe-americas', classes.iconAltixDrawer)} />
                </ListItemIcon>
                <ListItemText
                  primary="Refine Orbit"
                  className={classes.textDrawer}
                />
              </ListItem>
            </Link>
            <Divider className={classes.borderDrawer} />
            <Link to="/prediction-of-occultation" className={classes.invisibleLink} title="Prediction of Occultation">
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
            <Link to="/occultations" className={classes.invisibleLink} title="Occultations">
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
            <Link to="/occultation-calendar" className={classes.invisibleLink} title="Occultation Calendar">
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
            <Link to="/light-curve" className={classes.invisibleLink} title="Light Curve Analysis">
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
              onClick={handleDrawerClick}
              className={clsx(classes.ListIconDrawer, classes.ListIconControlDrawer)}
              title={open ? 'Close' : 'Open'}
            >
              {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </IconButton>
          </div>
        </Drawer>
        <div className={clsx(classes.bodyWrapper, open ? classes.bodyWrapperOpen : classes.bodyWrapperClose)}>
          <main className={classes.content}>
            <Route exact path="/refine-orbit" render={(props) => <RefineOrbit {...props} setTitle={setTitle} />} />
            <Route exact path="/refine-orbit/:id" render={(props) => <RefineOrbitDetail {...props} setTitle={setTitle} />} />
            <Route exact path="/refine-orbit/asteroid/:id" render={(props) => <RefineOrbitAsteroid {...props} setTitle={setTitle} drawerOpen={open} />} />
            <Route exact path="/prediction-of-occultation" render={(props) => <PredictionOccultation {...props} setTitle={setTitle} />} />
            {/* <Route exact path="/prediction-detail/:id" render={(props) => <PredictionDetail {...props} setTitle={setTitle} />} /> */}
            {/* <Route exact path="/predict-asteroid" render={(props) => <PredictAsteroid {...props} setTitle={setTitle} />} /> */}
            <Route exact path="/astrometry-run/:id" render={(props) => <AstrometryRun {...props} setTitle={setTitle} />} />
            {/* <Route exact path="/predict-asteroid" render={(props) => <PredictAsteroid {...props} setTitle={setTitle} />} /> */}
            <Route exact path="/astrometry" render={(props) => <Astrometry {...props} setTitle={setTitle} />} />
            <Route exact path="/prediction-of-occultation/:id" render={(props) => <PredictionOccultationDetail {...props} setTitle={setTitle} />} />
            <Route exact path="/prediction-of-occultation/asteroid/:id" render={(props) => <PredictionOccultationAsteroid {...props} setTitle={setTitle} drawerOpen={open} />} />
            <Route exact path="/occultation-calendar" render={(props) => <OccultationCalendar {...props} setTitle={setTitle} />} />
            <Route exact path="/test-calendar/:id/:date/:view/:flag/:sDate/:fDate" render={(props) => <TestCalendar {...props} setTitle={setTitle} />} />
            <Route exact path="/occultation-calendar-back/:id/:date/:view/:sDate/:fDate" render={(props) => <OccultationCalendar {...props} setTitle={setTitle} />} />

          </main>
          <Footer drawerOpen={open} />
        </div>
      </Router>
    </div>
  );
}

export default MiniDrawer;
