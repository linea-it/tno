import React from 'react'
import useScrollTrigger from '@material-ui/core/useScrollTrigger'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Link from '@material-ui/core/Link'
import { useLocation } from 'react-router-dom'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import styles from './styles'
import './header.css'
import { useNavigate } from '../../../../node_modules/react-router-dom/dist/index'

function PublicHeader() {
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
      href: '/contact-us',
      target: '_self',
    }
  ]

  const handleCardClick = (pathname) => navigate(pathname)   

  return (
    <AppBar position='static' className={classes.appbar}>
      <Toolbar className={classes.toolbar}>
        <img src={`${process.env.PUBLIC_URL}/img/linea-dark-invert.png`} alt='LIneA' className={classes.logoLIneA} />
        <List className={classes.menuList}>
          {menus.map((menu) => (
            <ListItem key={menu.href?menu.href:Math.random() } className={classes.menuListItem}>
              { menu.description &&
                <Link onClick={() => handleCardClick(menu.href)} className={classes.menuLink}
                  style={{ cursor: 'pointer' }} >
                  {menu.description}
                </Link>
              }
            </ListItem>
          ))}
        </List>
      </Toolbar>
    </AppBar>
  )
}

export default PublicHeader
