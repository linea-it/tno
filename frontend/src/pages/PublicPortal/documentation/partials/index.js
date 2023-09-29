import React from 'react'
import { CardMedia, Typography, Grid, Card, CardContent, Avatar } from '@material-ui/core'
import styles from './styles'

import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  image: {
    // Define the desired width and height for the image
    width: '50%', // Set to '100%' for responsiveness or specify fixed width like '200px'
    height: 'auto', // Let the height adjust proportionally to maintain the image aspect ratio
  },
}));


export function OccultationImagesFirstRow() {
  const classes = useStyles();

  const firstrowimg = [
    {
      id: 0,
      title: 'Stellar Occultation Geometry',
      image: 'thumbnail_occ.jpg',
      legend: 'Figure 1: the stellar occultation geometry. Reproduced from Santos-Sanz et al. 2016.',
    }
  ];

    const firstrowvid = [
    {
      id: 0,
      title: 'SOAR Occultation',
      image: '2007JJ43_SOAR_100ms.webp',
      legend: 'Figure 2: SOAR occulation.',
    }
  ];

  return (
    <div className={classes.root}>
    <Grid container spacing={2} direction='row' justifyContent='center' alignItems='stretch'>
      {/* First Grid */}
      <Grid item xs={6} sm={6} md={6} lg={6} xl={6}>
        {firstrowimg.map((item) => (
          <Card key={item.id}>
            <CardMedia
              className={classes.carouselItem}
              component='img'
              alt={item.title}
              image={`${process.env.PUBLIC_URL}/img/${item.image}`}
              title={item.title}
            />
            <CardContent>
              <Typography variant="body2" color="textSecondary" component="p">
                {item.legend}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Grid>

      {/* Second Grid */}
      <Grid item xs={6} sm={6} md={6} lg={6} xl={6}>
        {firstrowvid.map((item) => (
          <Card key={item.id}>
            <CardMedia
              className={classes.carouselItem}
              component='img'
              alt={item.title}
              src={`${process.env.PUBLIC_URL}/img/${item.image}`}
              title={item.title}
            /> 
          <CardContent>
              <Typography variant="body2" color="textSecondary" component="p">
                {item.legend}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Grid>
    </Grid>
  </div>
  );
}

export function OccultationImagesSecondRow() {
  const classes = useStyles();

  const secondrow = [
    {
      id: 0,
      title: 'Capes',
      image: 'thumbnail_lc.jpg',
      legend: 'Figure 3: The upper panel shows an example of a negative light curve, while the bottom panel presents a positive detection of a stellar occultation.',
    },
    {
      id: 1,
      title: 'Observed Limb',
      image: 'thumbnail_ellipse.jpg',
      legend: 'Figure 4: Model of the observed limb of 2002 MS4 during the stellar occultation recorded on August 8, 2020. Image obtained from Rommel et al. 2023.',
    },
  ];

  return (
    <div className={classes.root}>
      <Grid container spacing={2} direction='row' justifyContent='center' alignItems='stretch' >
        {secondrow.map((item) => (
          <Grid key={item.id} item xs={6} sm={6} md={6} lg={6} xl={6}>
            <Card>
              <CardMedia
                className={classes.carouselItem}
                component='img'
                alt={item.title}
                image={`${process.env.PUBLIC_URL}/img/${item.image}`}
                title={item.title}
              />
              <CardContent>
                <Typography variant="body2" color="textSecondary" component="p">
                  {item.legend}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
}


