import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {
  Drawer as MuiDrawer,
  List,
  CssBaseline,
  Divider,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  Icon,
} from '@material-ui/core';
import {
  ChevronLeft,
  ChevronRight,
  ExpandLess,
  ExpandMore,
} from '@material-ui/icons';

import Footer from '../Footer';
import Toolbar from '../Toolbar';

import Logo from '../../assets/img/linea.png';
import useStyles from './styles';
import '@fortawesome/fontawesome-free/css/all.min.css';

import { loggedUser } from '../../services/api/Auth';

const drawerWidth = 240;

function Drawer({ children, title, open, setOpen }) {
  const classes = useStyles({ drawerWidth });
  const [sssoOpen, setSssoOpen] = useState(false);
  const [inputOpen, setInputOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState('');
  const [currentUser, setCurrentUser] = useState({ username: '' });

  const handleDrawerClick = () => setOpen(!open);

  const handleDrawerSssoClick = () => setSssoOpen(!sssoOpen);

  const handleDrawerInputClick = () => setInputOpen(!inputOpen);

  useEffect(() => {
    loggedUser().then((res) => {
      setCurrentUser(res);
    });
  }, []);

  useEffect(() => {
    const { href, origin } = window.location;
    const location = href.split(origin)[1].split('/')[1];
    setCurrentPage(location);
  }, [title]);

  return (
    <div className={classes.root}>
      <CssBaseline />
      <Toolbar
        title={title}
        open={open}
        drawerWidth={drawerWidth}
        currentUser={currentUser}
      />
      <MuiDrawer
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
          <Link
            to="/dashboard"
            className={classes.invisibleLink}
            title="Laboratório Interinstitucional de e-Astronomia"
          >
            <ListItem button>
              <ListItemText
                primary={
                  <>
                    <ListItemIcon
                      className={clsx(
                        classes.ListIconDrawer,
                        open ? classes.logoBlock : ''
                      )}
                    >
                      <img
                        src={Logo}
                        alt="TNO"
                        className={clsx(
                          open ? classes.iconHomeOpen : classes.iconHomeClose
                        )}
                      />
                    </ListItemIcon>
                  </>
                }
                className={clsx(classes.homeBtn, classes.textDrawer)}
              />
            </ListItem>
          </Link>
          <Divider className={classes.borderDrawer} />
          <Link
            to="/dashboard"
            className={classes.invisibleLink}
            title="Dashboard"
          >
            <ListItem button selected={currentPage === 'dashboard'}>
              <ListItemIcon
                className={clsx(
                  classes.ListIconDrawer,
                  open ? classes.ListIconDrawerOpen : ''
                )}
              >
                <Icon className={clsx(classes.iconDrawer, 'fa', 'fa-home')} />
              </ListItemIcon>
              <ListItemText
                primary="Dashboard"
                className={classes.textDrawer}
              />
            </ListItem>
          </Link>
          <>
            <Divider className={classes.borderDrawer} />
            <Link
              to="/pointings"
              className={classes.invisibleLink}
              title="Query the database and download the metadata telling, among others, pointing coordinates, date of observation, exposure time, band, and image location in database"
            >
              <ListItem button selected={currentPage === 'pointings'}>
                <ListItemIcon
                  className={clsx(
                    classes.ListIconDrawer,
                    open ? classes.ListIconDrawerOpen : ''
                  )}
                >
                  <Icon
                    className={clsx(classes.iconDrawer, 'fa', 'fa-dot-circle')}
                  />
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
                <ListItemIcon
                  className={clsx(
                    classes.ListIconDrawer,
                    open ? classes.ListIconDrawerOpen : ''
                  )}
                >
                  <Icon
                    className={clsx(classes.iconDrawer, 'fa', 'fa-satellite')}
                  />
                </ListItemIcon>
              ) : (
                <ListItemIcon
                  className={clsx(
                    classes.ListIconDrawer,
                    open ? classes.ListIconDrawerOpen : ''
                  )}
                >
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
                <ListItemIcon
                  className={clsx(
                    classes.ListIconDrawer,
                    open ? classes.ListIconDrawerOpen : ''
                  )}
                >
                  {sssoOpen ? (
                    <ExpandLess className={classes.iconDrawer} />
                  ) : (
                    <ExpandMore className={classes.iconDrawer} />
                  )}
                </ListItemIcon>
              ) : null}
            </ListItem>
            <Collapse in={sssoOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <Link
                  to="/skybot"
                  className={classes.invisibleLink}
                  title="Execute Skybot"
                >
                  <ListItem
                    button
                    className={open ? classes.nested : ''}
                    selected={currentPage === 'skybot'}
                  >
                    <ListItemIcon
                      className={clsx(
                        classes.ListIconDrawer,
                        open ? classes.ListIconDrawerOpen : ''
                      )}
                    >
                      <Icon
                        className={clsx(
                          classes.iconDrawer,
                          'fa',
                          'fa-arrow-circle-up'
                        )}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary="Execute Skybot"
                      className={classes.textDrawer}
                    />
                  </ListItem>
                </Link>
                <Link
                  to="/ssso"
                  className={classes.invisibleLink}
                  title="Result"
                >
                  <ListItem
                    button
                    className={open ? classes.nested : ''}
                    selected={currentPage === 'ssso'}
                  >
                    <ListItemIcon
                      className={clsx(
                        classes.ListIconDrawer,
                        open ? classes.ListIconDrawerOpen : ''
                      )}
                    >
                      <Icon
                        className={clsx(
                          classes.iconDrawer,
                          'fa',
                          'fa-check-circle'
                        )}
                      />
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
            <Link
              to="/filter-objects"
              className={classes.invisibleLink}
              title="Download of images which have observations of specific objects."
            >
              <ListItem button selected={currentPage === 'filter-objects'}>
                <ListItemIcon
                  className={clsx(
                    classes.ListIconDrawer,
                    open ? classes.ListIconDrawerOpen : ''
                  )}
                >
                  <Icon
                    className={clsx(classes.iconDrawer, 'fa', 'fa-filter')}
                  />
                </ListItemIcon>
                <ListItemText
                  primary="Filter Objects"
                  className={classes.textDrawer}
                />
              </ListItem>
            </Link>
            <Divider className={classes.borderDrawer} />
            <Link
              to="/astrometry"
              className={classes.invisibleLink}
              title="Astrometric reduction using PRAIA package and stellar catalogue Gaia like reference to detect and determine positions of objects from CCD frame."
            >
              <ListItem button selected={currentPage === 'astrometry'}>
                <ListItemIcon
                  className={clsx(
                    classes.ListIconDrawer,
                    open ? classes.ListIconDrawerOpen : ''
                  )}
                >
                  <Icon
                    className={clsx(classes.iconDrawer, 'fa', 'fa-meteor')}
                  />
                </ListItemIcon>
                <ListItemText
                  primary="Astrometry"
                  className={classes.textDrawer}
                />
              </ListItem>
            </Link>
            <Divider className={classes.borderDrawer} />
            <Link
              to="/refine-orbit"
              className={classes.invisibleLink}
              title="Refinement of Orbits of specifics objects using NIMA code."
            >
              <ListItem button selected={currentPage === 'refine-orbit'}>
                <ListItemIcon
                  className={clsx(
                    classes.ListIconDrawer,
                    open ? classes.ListIconDrawerOpen : ''
                  )}
                >
                  <Icon
                    className={clsx(
                      classes.iconDrawer,
                      'fa',
                      'fa-globe-americas'
                    )}
                  />
                </ListItemIcon>
                <ListItemText
                  primary="Refine Orbit"
                  className={classes.textDrawer}
                />
              </ListItem>
            </Link>
            <Divider className={classes.borderDrawer} />
            <Link
              to="/prediction-of-occultation"
              className={classes.invisibleLink}
              title="Comparison of objects��� ephemeris and positions of stars to predict events of stellar occultation using Gaia catalogue like reference."
            >
              <ListItem
                button
                selected={currentPage === 'prediction-of-occultation'}
              >
                <ListItemIcon
                  className={clsx(
                    classes.ListIconDrawer,
                    open ? classes.ListIconDrawerOpen : ''
                  )}
                >
                  <Icon
                    className={clsx(classes.iconDrawer, 'fa', 'fa-chart-area')}
                  />
                </ListItemIcon>
                <ListItemText
                  primary="Prediction of Occultation"
                  className={classes.textDrawer}
                />
              </ListItem>
            </Link>
            <Divider className={classes.borderDrawer} />
            <Link
              to="/occultation"
              className={classes.invisibleLink}
              title="Occultation"
            >
              <ListItem button selected={currentPage === 'occultation'}>
                <ListItemIcon
                  className={clsx(
                    classes.ListIconDrawer,
                    open ? classes.ListIconDrawerOpen : ''
                  )}
                >
                  <Icon
                    className={clsx(classes.iconDrawer, 'fa', 'fa-eye-slash')}
                  />
                </ListItemIcon>
                <ListItemText
                  primary="Occultation"
                  className={classes.textDrawer}
                />
              </ListItem>
            </Link>
            <Divider className={classes.borderDrawer} />
            <Link
              to="/occultation-calendar"
              className={classes.invisibleLink}
              title="Calendar containing all the occultations"
            >
              <ListItem
                button
                selected={currentPage === 'occultation-calendar'}
              >
                <ListItemIcon
                  className={clsx(
                    classes.ListIconDrawer,
                    open ? classes.ListIconDrawerOpen : ''
                  )}
                >
                  <Icon
                    className={clsx(
                      classes.iconDrawer,
                      'fa',
                      'fa-calendar-alt'
                    )}
                  />
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
                <ListItemIcon
                  className={clsx(
                    classes.ListIconDrawer,
                    open ? classes.ListIconDrawerOpen : ''
                  )}
                >
                  <Icon
                    className={clsx(
                      classes.iconDrawer,
                      'fas',
                      'fa-file-import'
                    )}
                  />
                </ListItemIcon>
              ) : (
                <ListItemIcon
                  className={clsx(
                    classes.ListIconDrawer,
                    open ? classes.ListIconDrawerOpen : ''
                  )}
                >
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
                <ListItemIcon
                  className={clsx(
                    classes.ListIconDrawer,
                    open ? classes.ListIconDrawerOpen : ''
                  )}
                >
                  {inputOpen ? (
                    <ExpandLess className={classes.iconDrawer} />
                  ) : (
                    <ExpandMore className={classes.iconDrawer} />
                  )}
                </ListItemIcon>
              ) : null}
            </ListItem>

            <Collapse in={inputOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <Link
                  to="/bsp-jpl"
                  className={classes.invisibleLink}
                  title="Bsp Jpl"
                >
                  <ListItem
                    button
                    className={open ? classes.nested : ''}
                    selected={currentPage === 'bsp-jpl'}
                  >
                    <ListItemIcon
                      className={clsx(
                        classes.ListIconDrawer,
                        open ? classes.ListIconDrawerOpen : ''
                      )}
                    >
                      <Icon
                        className={clsx(
                          classes.iconDrawer,
                          'fas',
                          'fa-space-shuttle'
                        )}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary="Bsp Jpl"
                      className={classes.textDrawer}
                    />
                  </ListItem>
                </Link>
                <Link
                  to="/observation"
                  className={classes.invisibleLink}
                  title="Observation Files"
                >
                  <ListItem
                    button
                    className={open ? classes.nested : ''}
                    selected={currentPage === 'observation'}
                  >
                    <ListItemIcon
                      className={clsx(
                        classes.ListIconDrawer,
                        open ? classes.ListIconDrawerOpen : ''
                      )}
                    >
                      <Icon
                        className={clsx(classes.iconDrawer, 'fas', 'fa-file')}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary="Observation"
                      className={classes.textDrawer}
                    />
                  </ListItem>
                </Link>
                <Link
                  to="/orbital-parameter"
                  className={classes.invisibleLink}
                  title="Orbital Parameter Files"
                >
                  <ListItem
                    button
                    className={open ? classes.nested : ''}
                    selected={currentPage === 'orbital-parameter'}
                  >
                    <ListItemIcon
                      className={clsx(
                        classes.ListIconDrawer,
                        open ? classes.ListIconDrawerOpen : ''
                      )}
                    >
                      <Icon
                        className={clsx(classes.iconDrawer, 'fas', 'fa-globe')}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary="Orbital Parameter"
                      className={classes.textDrawer}
                    />
                  </ListItem>
                </Link>

                {/* Johnston Archives */}
                <Link
                  to="/johnston-archive"
                  className={classes.invisibleLink}
                  title="List of Known Trans-Neptunian Objects and other outer solar system objects"
                >
                  <ListItem
                    button
                    className={open ? classes.nested : ''}
                    selected={currentPage === 'johnston-archive'}
                  >
                    <ListItemIcon
                      className={clsx(
                        classes.ListIconDrawer,
                        open ? classes.ListIconDrawerOpen : ''
                      )}
                    >
                      <Icon
                        className={clsx(
                          classes.iconDrawer,
                          'fas',
                          'fa-object-group'
                        )}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary="Johnston Archives"
                      className={classes.textDrawer}
                    />
                  </ListItem>
                </Link>
              </List>
            </Collapse>

            <Divider className={classes.borderDrawer} />
          </>
          <Divider className={classes.borderDrawer} />
        </List>
        <div className={classes.drawerControlWrapper}>
          <IconButton
            onClick={handleDrawerClick}
            className={clsx(
              classes.ListIconDrawer,
              classes.ListIconControlDrawer
            )}
            title={open ? 'Close' : 'Open'}
          >
            {open ? <ChevronLeft /> : <ChevronRight />}
          </IconButton>
        </div>
      </MuiDrawer>
      <div
        className={clsx(
          classes.bodyWrapper,
          open ? classes.bodyWrapperOpen : classes.bodyWrapperClose
        )}
      >
        <main className={classes.content}>{children}</main>
      </div>
      <Footer drawerOpen={open} />
    </div>
  );
}

Drawer.propTypes = {
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.func]).isRequired,
  title: PropTypes.string.isRequired,
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
};

export default Drawer;
