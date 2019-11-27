import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import { Typography, Toolbar } from '@material-ui/core';
import logo from '../../assets/img/linea-logo-mini.png';

function CustomFooter(props) {
  const { drawerOpen, drawerWidth } = props;
  const useStyles = makeStyles((theme) => ({
    root: {
      width: '100%',
      float: 'right',
      height: 64,
    },
    grow: {
      flexGrow: 1,
    },
    appBarDrawerOpen: {
      top: 'auto',
      bottom: 0,
      backgroundColor: '#6A6A6A',
      width: 'calc(100% - 240px)',
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
    appBarDrawerClose: {
      top: 'auto',
      bottom: 0,
      backgroundColor: '#6A6A6A',
      width: drawerOpen === null ? '100%' : `calc(100% - ${theme.spacing(7) - 1}px)`,
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
    },
  }));

  // console.log('drawerOpen', drawerOpen);

  const classes = useStyles();

  return (
    <footer className={classes.root}>
      <AppBar position="fixed" className={drawerOpen ? classes.appBarDrawerOpen : classes.appBarDrawerClose}>
        <Toolbar className={classes.toolbar}>
          <Typography color="inherit">
            TNO:
            {' '}
            <span
              className={classes.versionLink}
            >
              1.0.0
            </span>
          </Typography>
          <Typography color="inherit">
            <span className={classes.poweredBy}>Powered by</span>
            <a href="http://www.linea.gov.br/" target="blank" className={classes.logoLink}>
              <img
                src={logo}
                title="LIneA"
                alt="LineA"
                style={{ cursor: 'pointer', marginLeft: '10px' }}
              />
            </a>
          </Typography>
        </Toolbar>
      </AppBar>
    </footer>
  );
}

CustomFooter.defaultProps = {
  drawerOpen: null,
};

CustomFooter.propTypes = {
  drawerOpen: PropTypes.bool,
};

export default CustomFooter;
