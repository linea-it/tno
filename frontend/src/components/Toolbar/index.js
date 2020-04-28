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
import Button from '@material-ui/core/Button';
import { deepOrange } from '@material-ui/core/colors';
import { logout } from '../../services/api/Auth';

const useStyles = makeStyles((theme) => ({
  appBar: {
    backgroundColor: '#fff',
    boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2)',
    color: '#000',
    width: (drawerWidth) =>
      drawerWidth === 0 ? '100%' : `calc(100% - ${theme.spacing(7) + 1}px)`,
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
  sectionButtons: {
    display: 'flex',
  },
  avatar: {
    margin: 10,
    cursor: 'pointer',
    color: theme.palette.getContrastText(deepOrange[500]),
    backgroundColor: deepOrange[500],
  },
  listItemIcon: {
    minWidth: theme.spacing(4),
  },
}));

function CustomToolbar({ title, open, drawerWidth, currentUser }) {
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
          <Grid item>
            <div className={classes.sectionButtons}>
              <Avatar className={classes.avatar} onClick={handleUserOpen}>
                {currentUser.username.substring(0, 2).toUpperCase()}
              </Avatar>
              <Button color="inherit" onClick={handleUserOpen}>
                {currentUser.username}
              </Button>
              <Menu
                anchorEl={userSettingsAnchorEl}
                // anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
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
            </div>
          </Grid>
        </Grid>
      </Toolbar>
    </AppBar>
  );
}

CustomToolbar.defaultProps = {
  open: null,
  drawerWidth: 0,
  currentUser: { username: '' },
};

CustomToolbar.propTypes = {
  title: PropTypes.string.isRequired,
  open: PropTypes.bool,
  drawerWidth: PropTypes.number,
  currentUser: PropTypes.shape({
    username: PropTypes.string,
  }),
};

export default CustomToolbar;
