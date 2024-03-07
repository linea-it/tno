import React, { useState } from 'react'
// import { useNavigate } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import MenuIcon from '@mui/icons-material/Menu'

const PublicHeader = () => {
  // const navigate = useNavigate()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const menus = [
    { description: 'Home', href: '/', target: '_self' },
    { description: 'About', href: '/about-us', target: '_self' },
    { description: 'Documentation', href: '/docs/', target: '_target' },
    { description: 'Contact', href: '/contact-us', target: '_self' }
  ]

  // TODO: Revisar essa função os botões foram alterados para utilizar href ao inves de onClick.
  // const handleCardClick = (pathname) => {
  //   navigate(pathname)
  //   setDrawerOpen(false)
  // }

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
        <Box sx={{ display: { xs: 'block', sm: 'none' }, pr: 1 }}>
          <IconButton size='large' edge='end' color='inherit' aria-label='menu' onClick={() => setDrawerOpen(true)}>
            <MenuIcon />
          </IconButton>
        </Box>
      </Toolbar>
      <Drawer anchor='left' open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box
          sx={{
            width: 250,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start',
            padding: 2
          }}
          role='presentation'
          onClick={() => setDrawerOpen(false)}
          onKeyDown={() => setDrawerOpen(false)}
        >
          {menus.map((menu) => (
            <Button key={menu.description} color='inherit' href={menu.href} target={menu.target}>
              {menu.description}
            </Button>
          ))}
        </Box>
      </Drawer>
    </AppBar>
  )
}

export default PublicHeader
