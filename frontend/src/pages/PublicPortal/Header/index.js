import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import AccountCircle from '@mui/icons-material/AccountCircle'
import MenuItem from '@mui/material/MenuItem'
import Menu from '@mui/material/Menu'
import SettingsIcon from '@mui/icons-material/Settings'
import DashboardIcon from '@mui/icons-material/Dashboard'

import Tooltip from '@mui/material/Tooltip'
import { loggedUser, logout } from '../../../services/api/Auth'

const PublicHeader = () => {
  const navigate = useNavigate()

  const menus = [
    { description: 'Home', href: '/', target: '_self' },
    { description: 'About', href: '/about-us', target: '_self' },
    { description: 'Documentation', href: '/docs/', target: '_target' },
    { description: 'Contact', href: '/contact-us', target: '_self' }
  ]

  const [auth, setAuth] = React.useState(false)
  const [user, setUser] = React.useState({ username: '', dashboard: false })
  const [anchorEl, setAnchorEl] = React.useState(null)

  useEffect(() => {
    loggedUser()
      .then((res) => {
        setAuth(true)
        setUser(res)
      })
      .catch((res) => {
        setAuth(false)
        console.log('Not logged')
      })
  }, [])

  const handleLogin = () => {
    navigate('/login/')
  }

  const handleAuthMenu = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleCloseAuthMenu = () => {
    setAnchorEl(null)
  }

  const handleSettings = () => {
    navigate('/newsletter_settings/')
  }

  const handleDashboard = () => {
    navigate('/dashboard/')
  }

  const renderAuthMenu = (
    <Menu
      id='menu-appbar'
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right'
      }}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right'
      }}
      sx={{ mt: '45px' }}
      open={Boolean(anchorEl)}
      onClose={handleCloseAuthMenu}
    >
      <MenuItem onClick={handleSettings}>Preferences</MenuItem>
      <MenuItem onClick={logout}>Logout</MenuItem>
    </Menu>
  )

  return (
    <AppBar position='static' sx={{ backgroundColor: '#24292e' }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ pt: 1 }}>
            <img src={`${process.env.PUBLIC_URL}/img/linea-dark-invert.png`} alt='LIneA' width={75} />
          </Box>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            {menus.map((menu) => (
              <Button key={menu.description} color='inherit' href={menu.href} target={menu.target}>
                {menu.description}
              </Button>
            ))}
          </Box>
        </Box>
        <Box sx={{ flexGrow: 1 }} />

        {!auth && (
          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            <Button color='inherit' onClick={handleLogin}>
              Login
            </Button>
          </Box>
        )}

        {auth && (
          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            <Tooltip title='Open user preferences'>
              <IconButton size='large' aria-label='preferences of current user' onClick={handleSettings} color='inherit'>
                <SettingsIcon />
              </IconButton>
            </Tooltip>
            {user?.dashboard && (
              <Tooltip title='Open dashboard'>
                <IconButton size='large' aria-label='go to dashboard' onClick={handleDashboard} color='inherit'>
                  <DashboardIcon />
                </IconButton>
              </Tooltip>
            )}
            <IconButton
              size='large'
              aria-label='account of current user'
              aria-controls='menu-appbar'
              aria-haspopup='true'
              onClick={handleAuthMenu}
              color='inherit'
            >
              <AccountCircle />
            </IconButton>
          </Box>
        )}

        {renderAuthMenu}
      </Toolbar>
    </AppBar>
  )
}

export default PublicHeader
