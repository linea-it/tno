import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import Container from '@material-ui/core/Container';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import styles from './styles';

function Interfaces() {
  const classes = styles();
  const history = useHistory();

  const [interfaces] = useState([
    {
      id: '1',
      app_url: 'dashboard',
      app_display_name: 'Dashboard',
    },
    {
      id: '2',
      app_url: 'data-preparation/des/discovery',
      app_display_name: 'Discovery',
    },
    // {
    //   id: '3',
    //   app_url: 'data-preparation/des/download',
    //   app_display_name: 'Download',
    // },
    // {
    //   id: '4',
    //   app_url: 'data-preparation/des/astrometry',
    //   app_display_name: 'Astrometry',
    // },
    // {
    //   id: '5',
    //   app_url: 'refine-orbit',
    //   app_display_name: 'Refine Orbits',
    // },
    {
      id: '6',
      app_url: 'prediction-of-occultation',
      app_display_name: 'Prediction of Occultation',
    },
    {
      id: '7',
      app_url: 'occultation',
      app_display_name: 'Occultation',
    },
    {
      id: '8',
      app_url: 'occultation-calendar',
      app_display_name: 'Occultation Calendar',
    },
  ]);

  const handleCardClick = (pathname) => history.push(pathname);

  return (
    <Container>
      <Grid
        container
        spacing={2}
        direction="row"
        justify="center"
        alignItems="stretch"
      >
        {interfaces.map((item) => (
          <Grid key={item.id} item xs={12} sm={6} md={4} lg={3}>
            <Card className={classes.card}>
              <CardActionArea
                className={classes.cardAction}
                onClick={() => handleCardClick(item.app_url)}
              >
                <CardMedia
                  alt={item.app_display_name}
                  className={classes.media}
                  image={`${process.env.PUBLIC_URL}/img/card${item.id}.jpg`}
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
    </Container>
  );
}

export default Interfaces;
