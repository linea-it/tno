import * as React from 'react'
import { useAuth } from '../../contexts/AuthContext.js'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import MenuIcon from '@mui/icons-material/Menu'
import styles from './styles'
import Button from '@mui/material/Button'
import Popover from '@mui/material/Popover'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ExitToAppIcon from '@mui/icons-material/ExitToApp'

function DashToolbar({ open, handleDrawerOpen, title }) {
  const { isAuthenticated, user, logout } = useAuth()
  const classes = styles()
  const [anchorEl, setAnchorEl] = React.useState(null)

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  const MenuOpen = Boolean(anchorEl)

  function UserLogged() {
    return (
      <>
        <Button color='inherit' onClick={handleClick}>
          {user?.username || ''}
        </Button>
        <Popover
          id='user_menu'
          anchorEl={anchorEl}
          open={MenuOpen}
          onClose={handleClose}
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

  return (
    <Toolbar>
      <IconButton
        color='inherit'
        aria-label='open drawer'
        onClick={handleDrawerOpen}
        edge='start'
        sx={{ mr: 2, ...(open && { display: 'none' }) }}
      >
        <MenuIcon />
      </IconButton>
      <Typography variant='h6' noWrap component='div'>
        {title}
      </Typography>
      <div className={classes.separator} />
      {isAuthenticated ? <UserLogged /> : null}
    </Toolbar>
  )
}

export default DashToolbar
