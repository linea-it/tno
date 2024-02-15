import React from 'react'
import useScrollTrigger from '@mui/material/useScrollTrigger'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import Popover from '@mui/material/Popover'
import { useLocation } from 'react-router-dom'
import List from '@mui/material/List'
import Box from '@mui/material/Box'
import ListItem from '@mui/material/ListItem'
import ExitToAppIcon from '@mui/icons-material/ExitToApp'
import styles from './styles'
import { useAuth } from '../../../contexts/AuthContext.js'
import { useNavigate } from 'react-router-dom'

function Header() {
  const { isAuthenticated, user, signIn, logout } = useAuth()

  const navigate = useNavigate();
  const location = useLocation()
  const trigger = useScrollTrigger({
    threshold: 10,
    disableHysteresis: true
  })
  const classes = styles({
    scrollActive: trigger,
    pathname: location.pathname
  })

  const [anchorEl, setAnchorEl] = React.useState(null)

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const open = Boolean(anchorEl)

  function UserLogged() {
    return (
      <>
        <Button color='inherit' onClick={handleMenuClick}>
          {user?.username || ''}
        </Button>
        <Popover
          id='simple-popover'
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          PaperProps={{
            style: {
              transform: 'translateX(calc(100vw - 185px)) translateY(45px)'
            }
          }}
        >
          <List className={classes.list}>
            <ListItem button>
              <Button onClick={logout} color='inherit' startIcon={<ExitToAppIcon />}>
                Logout
              </Button>
            </ListItem>
          </List>
        </Popover>
      </>
    )
  }

  function UserUnLogged() {
    return (
      <>
        <Button onClick={signIn} color='inherit'>
          Sign in
        </Button>
      </>
    )
  }

  const menus = [
    // TODO: Criar páginas independentes para o Dashboard.
    // Se usar as mesmas a rota para home fica errada nos outras páginas
    // {
    //   description: 'Home',
    //   href: '/dashboard',
    //   target: '_self'
    // },
    // {
    //   description: 'About',
    //   href: '/about-us',
    //   target: '_self'
    // },
    // {
    //   description: 'Documentation',
    //   href: '/documentation',
    //   target: '_self'
    // },
    // {
    //   description: 'Contact',
    //   href: '/contact-us',
    //   target: '_self'
    // }
  ]
  const handleClick = (pathname) => navigate(pathname)
  return (
    <AppBar position='static' style={{ backgroundColor: '#24292e' }}>
      <Toolbar>
        <Box sx={{ pt: 1 }}>
          <img src={`${process.env.PUBLIC_URL}/img/linea-dark-invert.png`} alt='LIneA' width={75} />
        </Box>
        <Box sx={{ flexGrow: 1 }}>
          {menus.map((menu) => (
            <Button key={menu.description} color="inherit" onClick={() => handleClick(menu.href)}>{menu.description}</Button>
          ))}
          <div className={classes.separator} />
        </Box>
        {isAuthenticated ? <UserLogged /> : <UserUnLogged />}
      </Toolbar>

    </AppBar>
  )
}

export default Header
