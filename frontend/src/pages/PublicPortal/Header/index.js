import React from 'react'
import { AppBar, Toolbar, IconButton, Button, Box } from '@mui/material'
import { Brightness4, Brightness7 } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

const PublicHeader = ({ darkMode, toggleTheme }) => {
  const navigate = useNavigate()

  const menus = [
    { description: 'Home', href: '/', target: '_self' },
    { description: 'About', href: '/about-us', target: '_self' },
    { description: 'Documentation', href: '/documentation', target: '_self' },
    { description: 'Contact', href: '/contact-us', target: '_self' },
  ]

  const handleToggleDarkMode = () => {
    toggleTheme()
  }

  const handleCardClick = (pathname) => navigate(pathname)

  return (
    <AppBar position='static' sx={{ backgroundColor: '#24292e' }}>
      <Toolbar>
        <Box sx={{ pt: 1 }}>
          <img src={`${process.env.PUBLIC_URL}/img/linea-dark-invert.png`} alt='LIneA' width={75} />
        </Box>
        {menus.map((menu) => (
          <Button key={menu.description} color="inherit" onClick={() => handleCardClick(menu.href)}>{menu.description}</Button>
        ))}
        {/* <IconButton
          size="large"
          edge="end"
          color="inherit"
          onClick={handleToggleDarkMode}
        >
          {darkMode ? <Brightness7 /> : <Brightness4 />}
        </IconButton> */}
      </Toolbar>
    </AppBar>
  )
}

export default PublicHeader
