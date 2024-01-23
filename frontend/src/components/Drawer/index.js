import * as React from 'react'
import { useNavigate, matchRoutes, useLocation } from 'react-router-dom'
import { styled, useTheme } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import CssBaseline from '@mui/material/CssBaseline'
import MuiAppBar from '@mui/material/AppBar'
import List from '@mui/material/List'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import Collapse from '@mui/material/Collapse'
import DashToolbar from '../Toolbar'
import Logo from '../../assets/img/logo.png'
import Footer from '../Footer'
const drawerWidth = 240

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(({ theme, open }) => ({
  flexGrow: 1,
  width: `calc(100% - ${drawerWidth}px)`,
  padding: theme.spacing(3),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen
  }),
  marginLeft: `-${drawerWidth}px`,
  ...(open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen
    }),
    marginLeft: 0
  }),
}))

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open'
})(({ theme, open }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen
    })
  })
}))

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}))

const routes = [
  { path: '/dashboard/data-preparation/des/discovery', title: 'Skybot Discovery' },
  { path: '/dashboard/data-preparation/des/discovery/:id', title: 'Skybot Discovery' },
  { path: '/dashboard/data-preparation/des/discovery/asteroid/:id', title: 'Skybot Discovery' },
  { path: '/dashboard/data-preparation/des/statistics', title: 'Skybot Statistics' },  
  { path: '/dashboard/data-preparation/des/orbittrace', title: 'Orbit Trace' },
  { path: '/dashboard/data-preparation/des/management', title: 'DES Management' },
  { path: '/dashboard/prediction-of-occultation', title: 'Predict Occultation' },
  { path: '/dashboard/data-preparation/predict-detail/:id', title: 'Predict Occultation Details' },
  { path: '/dashboard/data-preparation/predict-asteroid/:id', title: 'Predict Occultation Asteroid' },
  { path: '/dashboard/occultation', title: 'Occultation' },
  { path: '/dashboard/occultation-detail/:id', title: 'Occultation Detail' },
  { path: '/dashboard/stats', title: 'Dashboard' },
  { path: '/dashboard/data-preparation/des/orbittrace-detail/:id', title: 'Orbit Trace Details' },
  { path: '/dashboard/data-preparation/des/orbittrace/asteroid/:id', title: 'Orbit Trace Asteroid' },
  { path: '/dashboard/asteroid_job', title: 'Asteroid Job' },
  { path: '/dashboard/asteroid_job/:id', title: 'Asteroid Job Detail' },  
]

const useCurrentPath = () => {
  const location = useLocation()
  const [{ route }] = matchRoutes(routes, location)

  return route
}

export default function PersistentDrawerLeft({ children }) {
  const theme = useTheme()

  const navigate = useNavigate()
  let location = useCurrentPath()
  const [open, setOpen] = React.useState(true)

  const handleDrawerOpen = () => {
    setOpen(true)
  }

  const handleDrawerClose = () => {
    setOpen(false)
  }

  const [desOpen, setDesOpen] = React.useState(false)

  const handleClickDes = () => {
    setDesOpen(!desOpen)
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position='fixed'
        open={open}
        sx={{
          color: '#34465d',
          background: theme.palette.common.white,
        }}
      >
        <DashToolbar open={open} handleDrawerOpen={handleDrawerOpen} title={location.title}></DashToolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box'
          }
        }}
        PaperProps={{
          sx: {
            color: theme.palette.common.white,
            background: 'rgb(69, 69, 69)'
          }
        }}
        variant='persistent'
        anchor='left'
        open={open}
      >
        <DrawerHeader>
          <ListItem button>
            {/* TNO LOGO */}
            <ListItemText
              primary={
                <>
                  <ListItemIcon>
                    <img src={Logo} alt='TNO' style={{ width: 140 }} />
                  </ListItemIcon>
                </>
              }
            />
          </ListItem>
          <IconButton onClick={handleDrawerClose} sx={{ color: 'white' }}>
            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider style={{ backgroundColor: 'rgba(255, 255, 255, 0.32)' }} />
        <List>
          <ListItemButton onClick={() => navigate('/dashboard/stats')}>
            <ListItemText primary='Dashboard' sx={{ fontWeight: 'bold' }} />
          </ListItemButton>
          <Divider style={{ backgroundColor: 'rgba(255, 255, 255, 0.32)' }} />
          {/* DES Data Preparation */}
          <ListItemButton onClick={handleClickDes}>
            <ListItemText primary='DES Data Preparation' />
            {desOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          <Collapse in={desOpen} timeout='auto' unmountOnExit>
            <List component='div' disablePadding>
              <ListItemButton sx={{ pl: 4 }} onClick={() => navigate('/dashboard/data-preparation/des/discovery')}>
                <ListItemText primary='Skybot Discovery' />
              </ListItemButton>
              <ListItemButton sx={{ pl: 4 }} onClick={() => navigate('/dashboard/data-preparation/des/statistics')}>
                <ListItemText primary='Skybot Statistics' />
              </ListItemButton>                            
              <ListItemButton sx={{ pl: 4 }} onClick={() => navigate('/dashboard/data-preparation/des/orbittrace')}>
                <ListItemText primary='Orbit Trace' />
              </ListItemButton>
              <ListItemButton sx={{ pl: 4 }} onClick={() => navigate('/dashboard/data-preparation/des/management')}>
                <ListItemText primary='DES Management' />
              </ListItemButton>
            </List>
          </Collapse>
          <Divider style={{ backgroundColor: 'rgba(255, 255, 255, 0.32)' }} />
          {/* Predict Occultation */}
          <ListItemButton onClick={() => navigate('/dashboard/prediction-of-occultation')}>
            <ListItemText primary='Predict Occultation' />
          </ListItemButton>
          {/* Occultation */}
          <Divider style={{ backgroundColor: 'rgba(255, 255, 255, 0.32)' }} />
          <ListItemButton onClick={() => navigate('/dashboard/occultation')}>
            <ListItemText primary='Occultation' />
          </ListItemButton>
          <ListItemButton onClick={() => navigate('/')}>
            <ListItemText primary='Public Page' />
          </ListItemButton>
          <ListItemButton onClick={() => navigate('/dashboard/asteroid_job')}>
            <ListItemText primary='Asteroid Jobs' />
          </ListItemButton>                    
        </List>
      </Drawer>
      <Main open={open}>
        <DrawerHeader />
        {children}
        <Footer drawerOpen={open} />
      </Main>
    </Box>
  )
}
