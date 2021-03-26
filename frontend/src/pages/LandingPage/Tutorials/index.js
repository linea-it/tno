/* eslint-disable max-len */
import React, { useState, useEffect } from 'react';
import YouTube from 'react-youtube';
import {
  Container,
  Typography,
  Grid,
  Accordion,
  AccordionSummary,
  ListItem,
  ListItemIcon,
  ListItemText,
  Breadcrumbs,
  Link,
} from '@material-ui/core';
import MovieIcon from '@material-ui/icons/Movie';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import styles from './styles';

function Tutorials() {
  const classes = styles();
  const opts = { width: '100%' };
  const [idPlayer, setIdPlayer] = useState('');
  const [videoOnDisplay, setVideoOnDisplay] = useState({
    tutorial: '',
    video: '',
  });
  const treeTutorial = [
    {
      id: 1,
      title: 'SSO',
      videos: [
        {
          title: 'Overview',
          idVideo: 'SFmhC1o9pfQ',
        },
      ],
    },
  ];

  const [expanded, setExpanded] = React.useState('');
  const handleChange = (panel) => (event, newExpanded) => {
    setExpanded(newExpanded ? panel : false);
  };

  const handleSelected = (tutorial, video) => {
    setIdPlayer(video.idVideo);
    setVideoOnDisplay({ tutorial: tutorial.title, video: video.title });
  };

  useEffect(() => {
    handleSelected(treeTutorial[0], treeTutorial[0].videos[0]);
  }, []);

  return (
    <div className={classes.initContainer}>
      <Container>
        <Breadcrumbs aria-label="breadcrumb">
          <Link color="inherit" href="/">
            Home
          </Link>
          <Typography color="textPrimary">Tutorials</Typography>
        </Breadcrumbs>
        <Grid
          container
          spacing={9}
          direction="row"
          justify="space-evenly"
          alignItems="flex-start"
          className={classes.root}
        >
          <Grid item xs={12} sm={4}>
            {treeTutorial.map((tutorial, index) => (
              <Accordion
                key={tutorial.id}
                square
                expanded={expanded === `panel${index + 1}`}
                onChange={handleChange(`panel${index + 1}`)}
              >
                <AccordionSummary
                  aria-controls={`panel${index + 1}d-content`}
                  id={`panel${index + 1}d-header`}
                >
                  {expanded === `panel${index + 1}` ? (
                    <ArrowDropDownIcon />
                  ) : (
                    <ArrowRightIcon />
                  )}
                  <Typography>{tutorial.title}</Typography>
                </AccordionSummary>
                {tutorial.videos.map((video) => (
                  <ListItem
                    key={video.idVideo}
                    className={classes.item}
                    onClick={() => {
                      handleSelected(tutorial, video);
                    }}
                  >
                    <ListItemIcon>
                      <MovieIcon />
                    </ListItemIcon>
                    <ListItemText primary={video.title} />
                  </ListItem>
                ))}
              </Accordion>
            ))}
          </Grid>
          <Grid item xs={12} sm={8}>
            {idPlayer != '0' ? (
              <>
                <YouTube videoId={idPlayer} opts={opts} />
                <Typography variant="subtitle1" align="center" gutterBottom>
                  {`${videoOnDisplay.tutorial} - ${videoOnDisplay.video}`}
                </Typography>
              </>
            ) : (
              ''
            )}
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}

export default Tutorials;
