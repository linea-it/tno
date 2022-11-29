import React, { useState } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import {
  AppBar,
  Toolbar as MuiToolbar,
  Typography,
  Grid,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Button,
  IconButton,
} from '@material-ui/core';
import {
  ExitToApp as ExitToAppIcon,
  Menu as MenuIcon,
} from '@material-ui/icons';

import { logout } from '../../services/api/Auth';
import useStyles from './styles';

function Toolbar({ title, open, drawerWidth, currentUser, handleDrawerClick }) {
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
      <MuiToolbar>
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item>
            <Grid container alignItems="center" spacing={2}>
              {!open ? (
                <Grid item>
                  <IconButton
                    color="inherit"
                    aria-label="Open Drawer"
                    onClick={handleDrawerClick}
                    edge="start"
                  >
                    <MenuIcon />
                  </IconButton>
                </Grid>
              ) : null}
              <Grid>
                <Typography variant="h6" component="h1">
                  {title}
                </Typography>
              </Grid>
            </Grid>
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
      </MuiToolbar>
    </AppBar>
  );
}

Toolbar.defaultProps = {
  open: null,
  drawerWidth: 0,
  currentUser: { username: '' },
};

Toolbar.propTypes = {
  title: PropTypes.string.isRequired,
  open: PropTypes.bool,
  drawerWidth: PropTypes.number,
  currentUser: PropTypes.shape({
    username: PropTypes.string,
  }),
  handleDrawerClick: PropTypes.func.isRequired,
};

export default Toolbar;
