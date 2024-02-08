/* eslint-disable max-len */
import React from 'react'

import IconButton from '@mui/material/IconButton'
import Grid from '@mui/material/Grid'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Link from '@mui/material/Link'
import YouTubeIcon from '@mui/icons-material/YouTube';
import TwitterIcon from '@mui/icons-material/Twitter';
import GitHubIcon from '@mui/icons-material/GitHub';
import styles from './styles'

function PublicAboutUs() {
  const handlerClick = (socialMedia) => {
    let uri = ''
    switch (socialMedia) {
      case 'YouTube':
        uri = 'https://www.youtube.com/user/lineamcti'
        break
      case 'Twitter':
        uri = 'https://twitter.com/LIneA_mcti'
        break
      case 'GitHub':
        uri = 'https://github.com/linea-it/tno'
        break
      default:
        uri = 'https://www.youtube.com/user/lineamcti'
    }
    window.open(uri, '_blank')
  }

  const classes = styles()
  return (
    <div className={classes.initContainer}>
      <Container>
        <Grid item xs={12}>
          <Breadcrumbs aria-label='breadcrumb'>
            {/* <Link color="inherit" href="/">
              Home
            </Link> */}
            <Link color='inherit' to='/'>
              Home
            </Link>
            <Typography color='textPrimary'>Not Found</Typography>
          </Breadcrumbs>
          <>
            <div className={classes.notfound}>
              <Typography variant='h1' className={classes.title}>
                404
              </Typography>
              <Typography variant='h2' className={classes.subTitle}>
                Oops! Nothing was found
              </Typography>
              <Typography variant='subtitle1' className={classes.description}>
                The page you are looking for might have been removed, had its name changed or is temporarily unavailable.{' '}
                {/* <Link color="inherit" className={classes.returnPage} href="/">
                  Return to homepage
                </Link> */}
                <Link color='inherit' className={classes.returnPage} to='/'>
                  Return to homepage
                </Link>
              </Typography>
              <>
                <IconButton
                  className={classes.icon}
                  onClick={() => {
                    handlerClick('Youtube')
                  }}
                  color='inherit'
                  aria-label='YouTube'
                  component='span'
                >
                  <YouTubeIcon />
                </IconButton>
                <IconButton
                  className={classes.icon}
                  onClick={() => {
                    handlerClick('Twitter')
                  }}
                  color='inherit'
                  aria-label='Twitter'
                  component='span'
                >
                  <TwitterIcon />
                </IconButton>
                <IconButton
                  className={classes.icon}
                  onClick={() => {
                    handlerClick('GitHub')
                  }}
                  color='inherit'
                  aria-label='GitHub'
                  component='span'
                >
                  <GitHubIcon />
                </IconButton>
              </>
            </div>
          </>
        </Grid>
      </Container>
    </div>
  )
}

export default PublicAboutUs
