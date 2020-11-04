import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';
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
} from '@material-ui/core';
import {
  ChevronLeft,
  ArrowDropUp as ArrowDropUpIcon,
  ArrowDropDown as ArrowDropDownIcon,
} from '@material-ui/icons';

import Footer from '../Footer';
import Toolbar from '../Toolbar';

import Logo from '../../assets/img/logo.png';
import useStyles from './styles';
import '@fortawesome/fontawesome-free/css/all.min.css';

import { loggedUser } from '../../services/api/Auth';

const drawerWidth = 240;

function Drawer({ children, title, open, setOpen }) {
  const location = useLocation();
  const classes = useStyles({ drawerWidth });
  const [dataPreparationOpen, setDataPreparationOpen] = useState(false);
  const [desOpen, setDesOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState('');
  const [currentUser, setCurrentUser] = useState({ username: '' });

  const handleDrawerClick = () => setOpen(!open);

  const handleDataPreparationClick = () => {
    if (dataPreparationOpen === true) {
      setDesOpen(false);
    }
    setDataPreparationOpen((prev) => !prev);
  };
  const handleDesClick = () => setDesOpen((prev) => !prev);

  useEffect(() => {
    loggedUser().then((res) => {
      setCurrentUser(res);
    });
  }, []);

  useEffect(() => {
    const { pathname } = location;
    setCurrentPage(pathname.split('/')[1]);
  }, [location]);

  return (
    <div className={classes.root}>
      <CssBaseline />
      <Toolbar
        title={title}
        open={open}
        handleDrawerClick={handleDrawerClick}
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
            <ListItem
              button
              selected={currentPage === 'dashboard'}
            >
              <ListItemText
                primary={
                  <span className={classes.textDrawerParent}>
                    Dashboard
                  </span>
                }
                className={classes.textDrawer}
              />
            </ListItem>
          </Link>
          <Divider className={classes.borderDrawer} />
          <ListItem button onClick={handleDataPreparationClick}>
            <ListItemText
              primary={
                <span className={classes.textDrawerParent}>
                  Data Preparation
                </span>
              }
              className={classes.textDrawer}
            />
            {dataPreparationOpen ? (
              <ArrowDropUpIcon className={classes.menuItemIcon} />
            ) : (
              <ArrowDropDownIcon className={classes.menuItemIcon} />
            )}
          </ListItem>
          <Collapse in={dataPreparationOpen} unmountOnExit>
            <List component="div" disablePadding>
              <ListItem
                button
                onClick={handleDesClick}
                className={open ? classes.nested : ''}
              >
                <ListItemText
                  primary={
                    <span className={classes.textDrawerParent}>DES</span>
                  }
                  className={classes.textDrawer}
                />
                {desOpen ? (
                  <ArrowDropUpIcon className={classes.menuItemIcon} />
                ) : (
                  <ArrowDropDownIcon className={classes.menuItemIcon} />
                )}
              </ListItem>
            </List>
          </Collapse>
          <Collapse in={desOpen} unmountOnExit>
            <List component="div" disablePadding>
              <Link
                to="/data-preparation/des/skybot"
                className={classes.invisibleLink}
                title="Skybot"
              >
                <ListItem
                  button
                  className={open ? classes.doublenested : ''}
                  selected={currentPage === 'skybot'}
                >
                  <ListItemText
                    primary="Skybot"
                    className={classes.textDrawer}
                  />
                </ListItem>
              </Link>
              <Link
                to="/data-preparation/des/download"
                className={classes.invisibleLink}
              >
                <ListItem
                  button
                  selected={currentPage === 'download'}
                  className={open ? classes.doublenested : ''}
                >
                  <ListItemText
                    primary="Download"
                    className={classes.textDrawer}
                  />
                </ListItem>
              </Link>
              <Link
                to="/data-preparation/des/astrometry/ccd/"
                className={classes.invisibleLink}
                title="Astrometric reduction using PRAIA package and stellar catalogue Gaia like reference to detect and determine positions of objects from CCD frame."
              >
                <ListItem
                  button
                  selected={currentPage === 'astrometry'}
                  className={open ? classes.doublenested : ''}
                >
                  <ListItemText
                    primary="Astrometry"
                    className={classes.textDrawer}
                  />
                </ListItem>
              </Link>
            </List>
          </Collapse>
          <Divider className={classes.borderDrawer} />
          <Link
            to="/refine-orbit"
            className={classes.invisibleLink}
            title="Refinement of Orbits of specifics objects using NIMA code."
          >
            <ListItem button selected={currentPage === 'refine-orbit'}>
              <ListItemText
                primary={
                  <span className={classes.textDrawerParent}>Refine Orbit</span>
                }
                className={classes.textDrawer}
              />
            </ListItem>
          </Link>
          <Divider className={classes.borderDrawer} />
          <Link
            to="/prediction-of-occultation"
            className={classes.invisibleLink}
            title="Comparison of objects ephemeris and positions of stars to predict events of stellar occultation using Gaia catalogue like reference."
          >
            <ListItem
              button
              selected={currentPage === 'prediction-of-occultation'}
            >
              <ListItemText
                primary={
                  <span className={classes.textDrawerParent}>
                    Prediction of Occultation
                  </span>
                }
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
              <ListItemText
                primary={
                  <span className={classes.textDrawerParent}>Occultation</span>
                }
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
            <ListItem button selected={currentPage === 'occultation-calendar'}>
              <ListItemText
                primary={
                  <span className={classes.textDrawerParent}>
                    Occultation Calendar
                  </span>
                }
                className={classes.textDrawer}
              />
            </ListItem>
          </Link>
          <Divider className={classes.borderDrawer} />
        </List>
        <div className={classes.drawerControlWrapper}>
          <IconButton
            onClick={handleDrawerClick}
            className={clsx(
              classes.ListIconDrawer,
              classes.ListIconControlDrawer
            )}
            title="Close"
          >
            <ChevronLeft />
          </IconButton>
        </div>
      </MuiDrawer>
      <div
        className={clsx(
          classes.bodyWrapper,
          open ? classes.bodyWrapperOpen : null
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
