import React from 'react'
// import useScrollTrigger from '@mui/material/useScrollTrigger'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import { useNavigate } from 'react-router-dom'
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
function PublicHeader() {
  const navigate = useNavigate();

  // const location = useLocation()
  // const trigger = useScrollTrigger({
  //   threshold: 10,
  //   disableHysteresis: true
  // })
  // const classes = styles({
  //   scrollActive: trigger,
  //   pathname: location.pathname
  // })



  const menus = [
    {
      description: 'Home',
      href: '/',
      target: '_self'
    },
    {
      description: 'About',
      href: '/about-us',
      target: '_self'
    },
    {
      description: 'Documentation',
      href: '/documentation',
      target: '_self'
    },
    {
      description: 'Contact',
      href: '/contact-us',
      target: '_self',
    }
  ]

  const handleCardClick = (pathname) => navigate(pathname)

  return (
    <AppBar position='static' style={{ backgroundColor: '#24292e' }}>
      <Toolbar>
        <Box sx={{ pt: 1 }}>
          <img src={`${process.env.PUBLIC_URL}/img/linea-dark-invert.png`} alt='LIneA' width={75} />
        </Box>
        {menus.map((menu) => (
          <Button key={menu.description} color="inherit" onClick={() => handleCardClick(menu.href)}>{menu.description}</Button>
        ))}
      </Toolbar>
    </AppBar>
  )
}

export default PublicHeader