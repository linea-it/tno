import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Container from '@mui/material/Container'
import CardActionArea from '@mui/material/CardActionArea'
import CardMedia from '@mui/material/CardMedia'
import Typography from '@mui/material/Typography'
import styles from './styles'

function Interfaces() {
  const classes = styles()
  const navigate = useNavigate()

  const [interfaces] = useState([
    {
      id: '1',
      app_url: '/dashboard/stats',
      app_display_name: 'Statistics'
    },
    // {
    //   id: '2',
    //   app_url: '/dashboard/data-preparation/des/discovery',
    //   app_display_name: 'Discovery'
    // },
    {
      id: '3',
      app_url: '/dashboard/prediction-of-occultation',
      app_display_name: 'Prediction of Occultation'
    },
    {
      id: '4',
      app_url: '/dashboard/occultation',
      app_display_name: 'Occultation'
    }
  ])

  const handleCardClick = (pathname) => navigate(pathname)

  return (
    <Container>
      <Grid container spacing={2} direction='row' justifyContent='center' alignItems='stretch'>
        {interfaces.map((item) => (
          <Grid key={item.id} item xs={12} sm={6} md={4} lg={3}>
            <Card className={classes.card}>
              <CardActionArea className={classes.cardAction} onClick={() => handleCardClick(item.app_url)}>
                <CardMedia
                  alt={item.app_display_name}
                  className={classes.media}
                  image={`${process.env.PUBLIC_URL}/img/card${item.id}.jpg`}
                  title={item.app_display_name}
                >
                  <Typography gutterBottom className={classes.titleItem} variant='h5' component='h2'>
                    {item.app_display_name}
                  </Typography>
                </CardMedia>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  )
}

export default Interfaces
