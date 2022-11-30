import React, { useState, useEffect } from 'react';
import useScrollTrigger from '@material-ui/core/useScrollTrigger';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
import Link from '@material-ui/core/Link';
import Popover from '@material-ui/core/Popover';
import { useLocation } from 'react-router-dom';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import Avatar from '@material-ui/core/Avatar';
// import { loggedUser, urlLogin, urlLogout } from '../../../services/api/Auth';
import styles from './styles';
import { useAuth } from '../../../contexts/AuthContext.js';
function Header() {

  const { isAuthenticated, user, signIn, logout } = useAuth()

  const location = useLocation();
  const trigger = useScrollTrigger({
    threshold: 10,
    disableHysteresis: true,
  });
  const classes = styles({
    scrollActive: trigger,
    pathname: location.pathname,
  });

  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  function UserLogged() {
    return (
      <>
        <Button color="inherit" onClick={handleClick}>
          <Avatar className={classes.avatar}>
            {user.username.substr(0, 1) || ''}
          </Avatar>
          {user.username || ''}
        </Button>
        <Popover
          id="simple-popover"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          PaperProps={{
            style: {
              transform: 'translateX(calc(100vw - 185px)) translateY(45px)',
            },
          }}
        >
          <List className={classes.list}>
            <ListItem button>
              <Button
                onClick={logout}
                color="inherit"
                startIcon={<ExitToAppIcon />}
              >
                Logout
              </Button>
            </ListItem>
          </List>
        </Popover>
      </>
    );
  }

  function UserUnLogged() {
    return (
      <>
        <Button onClick={signIn} color="inherit">
          Sign in
        </Button>
      </>
    );
  }

  const menus = [
    {
      description: 'Home',
      href: '/',
      target: '_self',
    },
    {
      description: 'About',
      href: '/about-us',
      target: '_self',
    },
    {
      description: 'Tutorials',
      href: '/tutorials',
      target: '_self',
    },
    {
      description: 'Contact',
      href: '/contact-us',
      target: '_self',
    },
  ];

  return (
    <AppBar position="static" className={classes.appbar}>
      <Toolbar className={classes.toolbar}>
        <img
          src={`${process.env.PUBLIC_URL}/img/linea-dark-invert.png`}
          alt="LIneA"
          className={classes.logoLIneA}
        />
        <List className={classes.menuList}>
          {menus.map((menu) => (
            <ListItem key={menu.href} className={classes.menuListItem}>
              <Link href={menu.href} className={classes.menuLink}>
                {menu.description}
              </Link>
            </ListItem>
          ))}
        </List>
        <div className={classes.separator} />
        {isAuthenticated ? <UserLogged /> : <UserUnLogged />}
      </Toolbar>
    </AppBar>
  );
}

export default Header;
