import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import CssBaseline from '@material-ui/core/CssBaseline';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ListItem from '@material-ui/core/ListItem';
import {
  BrowserRouter as Router, Route, Link, Redirect, Switch,
} from 'react-router-dom';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import Collapse from '@material-ui/core/Collapse';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Icon from '@material-ui/core/Icon';
import { createBrowserHistory } from 'history';
import Logo from './assets/img/linea.png';
import CustomFooter from './components/utils/CustomFooter';
import RefineOrbit from './components/RefineOrbit';
import RefineOrbitDetail from './components/RefineOrbitDetail';
import RefineOrbitAsteroid from './components/RefineOrbitAsteroid';
import AstrometryDetail from './components/AstrometryDetail';
import Astrometry from './components/Astrometry';
import PredictionOccultation from './components/PredictionOccultation';
import PredictionOccultationDetail from './components/PredictionOccultationDetail';
import PredictionOccultationAsteroid from './components/PredictionOccultationAsteroid';
import Occultations from './components/Occultations';
import OccultationCalendar from './components/OccultationCalendar';
import OccultationsDetail from './components/OccultationsDetail';
import Skybot from './components/Skybot';
import SearchSsso from './components/SearchSsso';
import AstrometryAsteroid from './components/AstrometryAsteroid';
import Dashboard from './components/Dashboard';
import Pointings from './components/Pointings';
import FilterObjects from './components/FilterObjects';
import FilterObjectsDetail from './components/FilterObjectsDetail';
import SkybotDetail from './components/SkybotDetail';
import PointingsDetail from './components/PointingsDetail';
import SearchSssoDetail from './components/SearchSssoDetail';
import SkybotAsteroid from './components/SkybotAsteroid';
import CustomToolbar from './components/utils/CustomToolbar';
import Login from './Login';
import { isAuthenticated } from './api/Auth';
import BspJpl from './components/BspJpl';
import ObservFiles from './components/ObservFiles';
import OrbitalParameterFiles from './components/OrbitalParameterFiles';
import JohnstonArchives from './components/JohnstonArchives';
import JohnstonArchivesDetail from './components/JohnstonArchivesDetail';

const drawerWidth = 240;

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
    float: 'right',
    marginTop: '64px',
    // paddingBottom: 64,
    overflow: 'auto',
    backgroundColor: 'rgb(240, 241, 244)',
    maxHeight: 'calc(100% - 128px)',
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
  '@global': {
    '.MuiListItem-root.Mui-selected, .MuiListItem-root.Mui-selected:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.34)',
    },
  },
  nested: {
    paddingLeft: theme.spacing(4),
  },
}));

function MiniDrawer() {
  const classes = useStyles();
  const [open, setOpen] = useState(true);
  const [sssoOpen, setSssoOpen] = useState(false);
  const [inputOpen, setInputOpen] = useState(false);
  const [title, setTitle] = useState('Dashboard');
  const [currentPage, setCurrentPage] = useState('');

  const handleDrawerClick = () => setOpen(!open);

  const handleDrawerSssoClick = () => setSssoOpen(!sssoOpen);

  const handleDrawerInputClick = () => setInputOpen(!inputOpen);

  useEffect(() => {
    const { href, origin } = window.location;
    const location = href.split(origin)[1].split('/')[1];
    setCurrentPage(location);
  }, [title]);

  return (
    <div className={classes.root}>
      <Router history={createBrowserHistory}>
        <CssBaseline />
        <CustomToolbar title={title} open={open} drawerWidth={drawerWidth} isAuthenticated={isAuthenticated()} />
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
            <Link to={isAuthenticated() ? '/dashboard' : ''} className={classes.invisibleLink} title="Laboratório Interinstitucional de e-Astronomia">
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
              <ListItem button selected={currentPage === 'dashboard'}>
                <ListItemIcon className={clsx(classes.ListIconDrawer, open ? classes.ListIconDrawerOpen : '')}>
                  <Icon className={clsx(classes.iconDrawer, 'fa', 'fa-home')} />
                </ListItemIcon>
                <ListItemText
                  primary="Dashboard"
                  className={classes.textDrawer}
                />
              </ListItem>
            </Link>
            {isAuthenticated() ? (
              <>
                <Divider className={classes.borderDrawer} />
                <Link to="/pointings" className={classes.invisibleLink} title="Query the database and download the metadata telling, among others, pointing coordinates, date of observation, exposure time, band, and image location in database">
                  <ListItem button selected={currentPage === 'pointings'}>
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
                <ListItem button onClick={handleDrawerSssoClick}>
                  {open ? (
                    <ListItemIcon className={clsx(classes.ListIconDrawer, open ? classes.ListIconDrawerOpen : '')}>
                      <Icon className={clsx(classes.iconDrawer, 'fa', 'fa-satellite')} />
                    </ListItemIcon>
                  ) : (
                      <ListItemIcon className={clsx(classes.ListIconDrawer, open ? classes.ListIconDrawerOpen : '')}>
                        {sssoOpen ? (
                          <ExpandLess className={classes.expandClosed} />
                        ) : (
                            <ExpandMore className={classes.expandClosed} />
                          )}
                      </ListItemIcon>
                    )}
                  <ListItemText
                    primary="Search SSSO"
                    className={classes.textDrawer}
                    title="Identification of small solar system objects (SSSO) in all pointings using the SkyBoT service:"
                  />
                  {open ? (
                    <ListItemIcon className={clsx(classes.ListIconDrawer, open ? classes.ListIconDrawerOpen : '')}>
                      {sssoOpen
                        ? <ExpandLess className={classes.iconDrawer} />
                        : <ExpandMore className={classes.iconDrawer} />}
                    </ListItemIcon>
                  ) : null}
                </ListItem>
                <Collapse in={sssoOpen} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    <Link to="/skybot" className={classes.invisibleLink} title="Execute Skybot">
                      <ListItem button className={open ? classes.nested : ''} selected={currentPage === 'skybot'}>
                        <ListItemIcon className={clsx(classes.ListIconDrawer, open ? classes.ListIconDrawerOpen : '')}>
                          <Icon className={clsx(classes.iconDrawer, 'fa', 'fa-arrow-circle-up')} />
                        </ListItemIcon>
                        <ListItemText
                          primary="Execute Skybot"
                          className={classes.textDrawer}
                        />
                      </ListItem>
                    </Link>
                    <Link to="/ssso" className={classes.invisibleLink} title="Result">
                      <ListItem button className={open ? classes.nested : ''} selected={currentPage === 'ssso'}>
                        <ListItemIcon className={clsx(classes.ListIconDrawer, open ? classes.ListIconDrawerOpen : '')}>
                          <Icon className={clsx(classes.iconDrawer, 'fa', 'fa-check-circle')} />
                        </ListItemIcon>
                        <ListItemText
                          primary="Result"
                          className={classes.textDrawer}
                        />
                      </ListItem>
                    </Link>
                  </List>
                </Collapse>

                <Divider className={classes.borderDrawer} />
                <Link to="/filter-objects" className={classes.invisibleLink} title="Download of images which have observations of specific objects.">
                  <ListItem button selected={currentPage === 'filter-objects'}>
                    <ListItemIcon className={clsx(classes.ListIconDrawer, open ? classes.ListIconDrawerOpen : '')}>
                      <Icon className={clsx(classes.iconDrawer, 'fa', 'fa-filter')} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Filter Objects"
                      className={classes.textDrawer}
                    />
                  </ListItem>
                </Link>
                <Divider className={classes.borderDrawer} />
                <Link to="/astrometry" className={classes.invisibleLink} title="Astrometric reduction using PRAIA package and stellar catalogue Gaia like reference to detect and determine positions of objects from CCD frame.">
                  <ListItem button selected={currentPage === 'astrometry'}>
                    <ListItemIcon className={clsx(classes.ListIconDrawer, open ? classes.ListIconDrawerOpen : '')}>
                      <Icon className={clsx(classes.iconDrawer, 'fa', 'fa-meteor')} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Astrometry"
                      className={classes.textDrawer}
                    />
                  </ListItem>
                </Link>
                <Divider className={classes.borderDrawer} />
                <Link to="/refine-orbit" className={classes.invisibleLink} title="Refinement of Orbits of specifics objects using NIMA code.">
                  <ListItem button selected={currentPage === 'refine-orbit'}>
                    <ListItemIcon className={clsx(classes.ListIconDrawer, open ? classes.ListIconDrawerOpen : '')}>
                      <Icon className={clsx(classes.iconDrawer, 'fa', 'fa-globe-americas')} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Refine Orbit"
                      className={classes.textDrawer}
                    />
                  </ListItem>
                </Link>
                <Divider className={classes.borderDrawer} />
                <Link to="/prediction-of-occultation" className={classes.invisibleLink} title="Comparison of objects��� ephemeris and positions of stars to predict events of stellar occultation using Gaia catalogue like reference.">
                  <ListItem button selected={currentPage === 'prediction-of-occultation'}>
                    <ListItemIcon className={clsx(classes.ListIconDrawer, open ? classes.ListIconDrawerOpen : '')}>
                      <Icon className={clsx(classes.iconDrawer, 'fa', 'fa-chart-area')} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Prediction of Occultation"
                      className={classes.textDrawer}
                    />
                  </ListItem>
                </Link>
                <Divider className={classes.borderDrawer} />
                <Link to="/occultations" className={classes.invisibleLink} title="Occultations">
                  <ListItem button selected={currentPage === 'occultations'}>
                    <ListItemIcon className={clsx(classes.ListIconDrawer, open ? classes.ListIconDrawerOpen : '')}>
                      <Icon className={clsx(classes.iconDrawer, 'fa', 'fa-eye-slash')} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Occultations"
                      className={classes.textDrawer}
                    />
                  </ListItem>
                </Link>
                <Divider className={classes.borderDrawer} />
                <Link to="/occultation-calendar" className={classes.invisibleLink} title="Calendar containing all the occultations">
                  <ListItem button selected={currentPage === 'occultation-calendar'}>
                    <ListItemIcon className={clsx(classes.ListIconDrawer, open ? classes.ListIconDrawerOpen : '')}>
                      <Icon className={clsx(classes.iconDrawer, 'fa', 'fa-calendar-alt')} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Occultation Calendar"
                      className={classes.textDrawer}
                    />
                  </ListItem>
                </Link>
                <Divider className={classes.borderDrawer} />

                <ListItem button onClick={handleDrawerInputClick}>
                  {open ? (
                    <ListItemIcon className={clsx(classes.ListIconDrawer, open ? classes.ListIconDrawerOpen : '')}>
                      <Icon className={clsx(classes.iconDrawer, 'fas', 'fa-file-import')} />
                    </ListItemIcon>
                  ) : (
                      <ListItemIcon className={clsx(classes.ListIconDrawer, open ? classes.ListIconDrawerOpen : '')}>
                        {inputOpen ? (
                          <ExpandLess className={classes.expandClosed} />
                        ) : (
                            <ExpandMore className={classes.expandClosed} />
                          )}
                      </ListItemIcon>
                    )}
                  <ListItemText
                    primary="Input Files"
                    className={classes.textDrawer}
                    title="Import necessary updating files"
                  />
                  {open ? (
                    <ListItemIcon className={clsx(classes.ListIconDrawer, open ? classes.ListIconDrawerOpen : '')}>
                      {inputOpen
                        ? <ExpandLess className={classes.iconDrawer} />
                        : <ExpandMore className={classes.iconDrawer} />}
                    </ListItemIcon>
                  ) : null}
                </ListItem>

                <Collapse in={inputOpen} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    <Link to="/bsp-jpl" className={classes.invisibleLink} title="Bsp_Jpl">
                      <ListItem button className={open ? classes.nested : ''} selected={currentPage === 'bsp-jpl'}>
                        <ListItemIcon className={clsx(classes.ListIconDrawer, open ? classes.ListIconDrawerOpen : '')}>
                          <Icon className={clsx(classes.iconDrawer, 'fas', 'fa-space-shuttle')} />
                        </ListItemIcon>
                        <ListItemText
                          primary="Bsp_Jpl"
                          className={classes.textDrawer}
                        />
                      </ListItem>
                    </Link>
                    <Link to="/observ-files" className={classes.invisibleLink} title="Observation Files">
                      <ListItem button className={open ? classes.nested : ''} selected={currentPage === 'observ-files'}>
                        <ListItemIcon className={clsx(classes.ListIconDrawer, open ? classes.ListIconDrawerOpen : '')}>
                          <Icon className={clsx(classes.iconDrawer, 'fas', 'fa-file')} />
                        </ListItemIcon>
                        <ListItemText
                          primary="Observation"
                          className={classes.textDrawer}
                        />
                      </ListItem>
                    </Link>
                    <Link to="/orbital-parameter" className={classes.invisibleLink} title="Orbital Parameter Files">
                      <ListItem button className={open ? classes.nested : ''} selected={currentPage === 'orbital-parameter'}>
                        <ListItemIcon className={clsx(classes.ListIconDrawer, open ? classes.ListIconDrawerOpen : '')}>
                          <Icon className={clsx(classes.iconDrawer, 'fas', 'fa-globe')} />
                        </ListItemIcon>
                        <ListItemText
                          primary="Orbital Parameter"
                          className={classes.textDrawer}
                        >
                        </ListItemText>
                      </ListItem>
                    </Link>


                    {/* Johnston Archives */}
                    <Link to="/johnston-archives" className={classes.invisibleLink} title="List of Known Trans-Neptunian Objects and other outer solar system objects">
                      <ListItem button className={open ? classes.nested : ''} selected={currentPage === 'johnston-archives'}>
                        <ListItemIcon className={clsx(classes.ListIconDrawer, open ? classes.ListIconDrawerOpen : '')}>
                          <Icon className={clsx(classes.iconDrawer, 'far', 'fa-object-group')} />
                        </ListItemIcon>
                        <ListItemText
                          primary="Johnston Archives"
                          className={classes.textDrawer}
                        >
                        </ListItemText>
                      </ListItem>
                    </Link>

                  </List>
                </Collapse>

                <Divider className={classes.borderDrawer} />
              </>
            ) : null}
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
            {isAuthenticated() ? (
              <Switch>
                <Route exact path="/refine-orbit" render={(props) => <RefineOrbit {...props} setTitle={setTitle} />} />
                <Route exact path="/refine-orbit/:id" render={(props) => <RefineOrbitDetail {...props} setTitle={setTitle} />} />
                <Route exact path="/refine-orbit/asteroid/:id" render={(props) => <RefineOrbitAsteroid {...props} setTitle={setTitle} drawerOpen={open} />} />
                <Route exact path="/astrometry/asteroid/:id" render={(props) => <AstrometryAsteroid {...props} setTitle={setTitle} drawerOpen={open} />} />
                <Route exact path="/astrometry/:id" render={(props) => <AstrometryDetail {...props} setTitle={setTitle} />} />
                <Route exact path="/astrometry" render={(props) => <Astrometry {...props} setTitle={setTitle} />} />
                <Route exact path="/prediction-of-occultation/asteroid/:id" render={(props) => <PredictionOccultationAsteroid {...props} setTitle={setTitle} drawerOpen={open} />} />
                <Route exact path="/prediction-of-occultation/:id" render={(props) => <PredictionOccultationDetail {...props} setTitle={setTitle} />} />
                <Route exact path="/prediction-of-occultation" render={(props) => <PredictionOccultation {...props} setTitle={setTitle} />} />
                <Route exact path="/occultation-calendar" render={(props) => <OccultationCalendar {...props} setTitle={setTitle} />} />
                <Route exact path="/occultation-calendar-back/:id/:date/:view/:sDate/:fDate/:searching" render={(props) => <OccultationCalendar {...props} setTitle={setTitle} />} />
                <Route exact path="/occultations" render={(props) => <Occultations {...props} setTitle={setTitle} />} />
                <Route exact path="/occultations/:id" render={(props) => <OccultationsDetail {...props} setTitle={setTitle} />} />
                <Route exact path="/pointings" render={(props) => <Pointings {...props} setTitle={setTitle} />} />
                <Route exact path="/skybot" render={(props) => <Skybot {...props} setTitle={setTitle} />} />
                <Route exact path="/bsp-jpl" render={(props) => <BspJpl {...props} setTitle={setTitle} />} />
                <Route exact path="/observ-files" render={(props) => <ObservFiles {...props} setTitle={setTitle} />} />
                <Route exact path="/orbital-parameter" render={(props) => <OrbitalParameterFiles {...props} setTitle={setTitle} />} />
                <Route exact path="/johnston-archives" render={(props) => <JohnstonArchives {...props} setTitle={setTitle} />} />
                <Route exact path="/johnston-archives/:id" render={(props) => <JohnstonArchivesDetail {...props} setTitle={setTitle} />} />
                <Route exact path="/ssso" render={(props) => <SearchSsso {...props} setTitle={setTitle} />} />
                <Route exact path="/filter-objects" render={(props) => <FilterObjects {...props} setTitle={setTitle} drawerOpen={open} />} />
                <Route exact path="/filter-objects/:id" render={(props) => <FilterObjectsDetail {...props} setTitle={setTitle} />} />
                <Route exact path="/skybot/:id" render={(props) => <SkybotDetail {...props} setTitle={setTitle} />} />
                <Route exact path="/skybot/:runId/asteroid/:id" render={(props) => <SkybotAsteroid {...props} setTitle={setTitle} />} />
                <Route exact path="/pointings/:id" render={(props) => <PointingsDetail {...props} setTitle={setTitle} />} />
                <Route exact path="/search-ssso-detail/:id" render={(props) => <SearchSssoDetail {...props} setTitle={setTitle} />} />
                <Route exact path="/dashboard" render={(props) => <Dashboard {...props} setTitle={setTitle} />} />
                <Redirect path="/" to="/dashboard" />
              </Switch>
            ) : (
                <Switch>
                  <Route exact path="/dashboard" render={(props) => <Dashboard {...props} setTitle={setTitle} />} />
                  <Route exact path="/login" render={(props) => <Login {...props} setTitle={setTitle} />} />
                  <Redirect to="/login" />
                </Switch>
              )}
          </main>
        </div>
        <CustomFooter drawerOpen={open} />
      </Router>
    </div>
  );
}
export default MiniDrawer;
