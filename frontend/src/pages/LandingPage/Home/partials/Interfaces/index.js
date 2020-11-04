import React, { useState } from 'react';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import styles from './styles';

function Interfaces() {
  const classes = styles();
  const [interfaces] = useState([
    {
      id: '01',
      app_url: 'dashboard',
      app_display_name: 'Dashboard',
    },
    {
      id: '02',
      app_url: 'data-preparation/des/skybot',
      app_display_name: 'Skybot',
    },
    {
      id: '03',
      app_url: 'data-preparation/des/download',
      app_display_name: 'Download',
    },
    {
      id: '04',
      app_url: '',
      app_display_name: 'Astrometry',
    },
    {
      id: '05',
      app_url: 'refine-orbit',
      app_display_name: 'Refine Orbits',
    },
    {
      id: '06',
      app_url: 'prediction-of-occultation',
      app_display_name: 'Prediction of Occultation',
    },
    {
      id: '07',
      app_url: 'occultation',
      app_display_name: 'Occultation',
    },
    {
      id: '08',
      app_url: 'occultation-calendar',
      app_display_name: 'Occultation Calendar',
    },
  ]);

  return (
    <div className={classes.root}>
      <Grid
        container
        spacing={2}
        direction="row"
        justify="center"
        alignItems="stretch"
      >
        {interfaces.map((item, index) => (
          <Grid key={item.id} item xs={12} sm={6} md={4} lg={3}>
            <Card className={classes.card}>
              <CardActionArea
                href={item.app_url}
                target={item.url ? '_blanc' : '_self'}
              >
                <CardMedia
                  alt={item.app_display_name}
                  className={classes.media}
                  image={`${process.env.PUBLIC_URL}/img/card${index}.jpg`}
                  title={item.app_display_name}
                >
                  <Typography
                    gutterBottom
                    className={classes.titleItem}
                    variant="h5"
                    component="h2"
                  >
                    {item.app_display_name}
                  </Typography>
                </CardMedia>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
}

export default Interfaces;
