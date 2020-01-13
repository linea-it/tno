import React, { useState } from 'react';
import PropTypes from 'prop-types';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import Grid from '@material-ui/core/Grid';
import Avatar from '@material-ui/core/Avatar';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import { logout } from '../../api/Auth';


const useStyles = makeStyles((theme) => ({
  appBar: {
    backgroundColor: '#fff',
    boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2)',
    color: '#000',
    width: (drawerWidth) => (drawerWidth === 0 ? '100%' : `calc(100% - ${theme.spacing(7) + 1}px)`),
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: (drawerWidth) => drawerWidth,
    width: (drawerWidth) => `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  avatar: {
    margin: 10,
    cursor: 'pointer',
  },
  listItemIcon: {
    minWidth: theme.spacing(4),
  },
}));

function CustomToolbar({
  title, open, drawerWidth, isAuthenticated,
}) {
  const classes = useStyles(drawerWidth);
  const [userSettingsAnchorEl, setUserSettingsAnchorEl] = useState(null);

  const handleUserOpen = (e) => setUserSettingsAnchorEl(e.currentTarget);
  const handleUserClose = () => setUserSettingsAnchorEl(null);

  return (
    <AppBar
      position="fixed"
      className={clsx(classes.appBar, {
        [classes.appBarShift]: open,
      })}
    >
      <Toolbar>
        <Grid container justify="space-between" alignItems="center">
          <Grid item>
            <Typography variant="h6" component="h1">
              {title}
            </Typography>
          </Grid>
          {isAuthenticated ? (
            <Grid item>
              <Avatar
                className={classes.avatar}
                onClick={handleUserOpen}
              >
              N
              </Avatar>
              <Menu
                anchorEl={userSettingsAnchorEl}
                keepMounted
                open={Boolean(userSettingsAnchorEl)}
                onClose={handleUserClose}
              >
                <MenuItem onClick={() => logout()}>
                  <ListItemIcon className={classes.listItemIcon}>
                    <ExitToAppIcon fontSize="small" />
                  </ListItemIcon>
                  <Typography variant="inherit">Logout</Typography>
                </MenuItem>
              </Menu>
            </Grid>
          ) : null}
        </Grid>

      </Toolbar>
    </AppBar>
  );
}

CustomToolbar.defaultProps = {
  open: null,
  drawerWidth: 0,
};

CustomToolbar.propTypes = {
  title: PropTypes.string.isRequired,
  open: PropTypes.bool,
  drawerWidth: PropTypes.number,
  isAuthenticated: PropTypes.bool.isRequired,
};

export default CustomToolbar;
