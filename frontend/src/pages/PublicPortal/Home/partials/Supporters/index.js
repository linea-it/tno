import React from 'react'
import { CardMedia, Typography, Grid } from '@material-ui/core'

function PublicSupporters() {

  const interfaces = [
    {
      id: 0,
      title: 'Capes',
      image: 'capes.png'
    },
    {
      id: 1,
      title: 'CNPq',
      image: 'cnpq.png'
    },
    {
      id: 2,
      title: 'FAPERJ',
      image: 'faperj.png'
    },
    {
      id: 3,
      title: 'Finep',
      image: 'finep.png'
    },
    {
      id: 4,
      title: 'INCT do Universo',
      image: 'e-universo_square.png'
    }
  ]
  return (
    <div m={4}>
      <Typography variant='h6' align='center' gutterBottom>
        LIneA is supported by
      </Typography>
      <Grid container spacing={2} direction='row' justifyContent='center' alignItems='stretch'>
        {interfaces.map((item) => (
          <Grid key={item.id} item>
            <CardMedia
              component='img'
              alt={item.title}
              image={`${process.env.PUBLIC_URL}/img/supporters/${item.image}`}
              title={item.title}
              style={{ maxWidth: '150px', width: 'auto', height: 'auto', margin: 'auto' }}
            />
          </Grid>
        ))}
      </Grid>
    </div>
  )
}

export default PublicSupporters
