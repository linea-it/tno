import React, { useState, useEffect, Fragment } from 'react';
import PropTypes from 'prop-types';
import {
  Grid, Card, makeStyles, CardHeader, CardContent,
} from '@material-ui/core';
import clsx from 'clsx';
import moment from 'moment';
import Carousel, { Modal, ModalGateway } from 'react-images';
import LazyLoad from 'react-lazyload';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import { withRouter } from 'react-router';
import CustomList from './utils/CustomList';
import CustomTable from './utils/CustomTable';
import {
  getAsteroidById,
  getOccultations,
  getAsteroidInputs,
  getAsteroidOutputs,
  url,
  getAsteroidDownloadLink,
  getAsteroidNeighbors,
} from '../api/Prediction';
import loading from '../assets/img/loading.gif';

const useStyles = makeStyles((theme) => ({
  button: {
    margin: theme.spacing(1),
  },
  buttonIcon: {
    margin: '0 2px',
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
  btn: {
    textTransform: 'none',
    padding: '1px 5px',
    width: '7em',
    minHeight: '1em',
    display: 'block',
    textAlign: 'center',
    lineHeight: '2',
    boxShadow: `0px 1px 5px 0px rgba(0, 0, 0, 0.2),
      0px 2px 2px 0px rgba(0, 0, 0, 0.14),
      0px 3px 1px -2px rgba(0, 0, 0, 0.12)`,
    borderRadius: '4px',
    boxSizing: 'border-box',
  },
  btnSuccess: {
    backgroundColor: 'green',
    color: '#fff',
  },
  btnFailure: {
    backgroundColor: 'red',
    color: '#fff',
  },
  btnRunning: {
    backgroundColor: '#ffba01',
    color: '#000',
  },
  btnNotExecuted: {
    backgroundColor: '#ABA6A2',
    color: '#fff',
  },
  btnWarning: {
    backgroundColor: '#D79F15',
    color: '#FFF',
  },
  block: {
    marginBottom: 15,
  },
  iconDetail: {
    fontSize: 18,
  },
  logToolbar: {
    backgroundColor: '#F1F2F5',
    color: '#454545',
  },
  logBody: {
    backgroundColor: '#1D4455',
    color: '#FFFFFF',
  },
  tableWrapper: {
    maxWidth: '100%',
  },
  plotsWrapper: {
    alignItems: 'center',
  },
  imgResponsive: {
    width: '100%',
    maxWidth: '100%',
    height: 'auto',
  },
  lightboxImage: {
    cursor: 'pointer',
  },
  root: {
    width: '100%',
    maxWidth: '100%',
    position: 'relative',
    overflow: 'auto',
    maxHeight: 218,
    [theme.breakpoints.up('xl')]: {
      maxHeight: 285,
    },
    backgroundColor: '#fff',
  },
  listSection: {
    backgroundColor: 'inherit',
  },
  ul: {
    backgroundColor: 'inherit',
    padding: 0,
  },
  cardContentWrapper: {
    maxHeight: 440,
    overflow: 'auto',
  },
}));

function PredictionOccultationAsteroid({
  history,
  setTitle,
  match,
  drawerOpen,
}) {
  const classes = useStyles();
  const { id } = match.params;
  const [asteroidData, setAsteroidData] = useState([]);
  const [asteroidList, setAsteroidList] = useState([]);
  const [infoList, setInfoList] = useState([]);
  const [timeList, setTimeList] = useState([]);
  const [occultationData, setOccultationData] = useState([]);
  const [inputTableData, setInputTableData] = useState([]);
  const [outputTableData, setOutputTableData] = useState([]);
  const [neighborhoodStarsPlot, setNeighborhoodStarsPlot] = useState('');
  const [asteroidOrbitPlot, setAsteroidOrbitPlot] = useState('');
  const [lightbox, setLightbox] = useState({
    isOpen: false,
    currentImage: 0,
  });
  const [downloading, setDownloading] = useState(false);
  const [neighbors, setNeighbors] = useState({
    prev: null,
    next: null,
  });
  const [reload, setReload] = useState(false);


  const occultationsColumns = [
    {
      name: 'date_time',
      title: 'Date Time',
      width: 135,
    },
    {
      name: 'ra_star_candidate',
      title: 'RA Candidate Star (hms)',
      width: 133,
    },
    {
      name: 'dec_star_candidate',
      title: 'Dec Candidate Star (dms)',
      width: 140,
    },
    {
      name: 'ra_target',
      title: 'RA Target',
    },
    {
      name: 'dec_target',
      title: 'Dec Target',
      width: 100,
    },
    {
      name: 'velocity',
      title: 'Velocity In Plane of Sky',
      width: 90,
    },
    {
      name: 'closest_approach',
      title: 'C/A [arcsec]',
      width: 60,
    },
    {
      name: 'position_angle',
      title: 'P/A [deg]',
      width: 60,
    },
    {
      name: 'g',
      title: 'G*',
      width: 60,
    },
    {
      name: 'j',
      title: 'J*',
      width: 60,
    },
    {
      name: 'h',
      title: 'H*',
      width: 60,
    },
    {
      name: 'k',
      title: 'K*',
      width: 60,
    },
  ];

  const inputColumns = [
    {
      name: 'input_type',
      title: 'Inputs',
    },
    {
      name: 'filename',
      title: 'Filename',
    },
    {
      name: 'file_size',
      title: 'File Size',
    },
  ];


  const outputColumns = [
    {
      name: 'filename',
      title: 'Name',
      width: 220,
    },
    {
      name: 'h_size',
      title: 'Size',
      width: 170,
    },
    {
      name: 'file_type',
      title: 'Type',
    },
  ];

  useEffect(() => {
    setTitle('Prediction of Occultations');
    setAsteroidData([]);
    setAsteroidList([]);
    setInfoList([]);
    setTimeList([]);
    setOccultationData([]);
    setInputTableData([]);
    setOutputTableData([]);
    setNeighborhoodStarsPlot('');
    setAsteroidOrbitPlot('');
    setLightbox({
      isOpen: false,
      currentImage: 0,
    });
    setDownloading(false);
    setNeighbors({
      prev: null,
      next: null,
    });

    getAsteroidById({ id }).then((res) => setAsteroidData(res));
    getOccultations({ id }).then((data) => {
      setOccultationData(
        data.results.map((row) => ({
          ...row,
          source: row.src ? url + row.src : null,
        })),
      );
    });
    getAsteroidInputs({ id }).then((data) => {
      const tableData = data.results.map((res) => ({
        input_type: res.input_type,
        filename: res.filename,
        file_size: res.h_size,
      }));
      setInputTableData(tableData);
    });
    getAsteroidOutputs({ id }).then((data) => {
      const tableData = data.results.map((res) => ({
        filename: res.filename,
        h_size: res.h_size,
        file_type: res.file_type,
      }));

      const neighborhoodStars = data.results.filter((el) => el.type === 'neighborhood_stars')[0];
      const asteroidOrbit = data.results.filter((el) => el.type === 'asteroid_orbit')[0];
      if (neighborhoodStars) setNeighborhoodStarsPlot(url + neighborhoodStars.src);
      if (asteroidOrbit) setAsteroidOrbitPlot(url + asteroidOrbit.src);

      setOutputTableData(tableData);
    });

    getAsteroidNeighbors({ id }).then((res) => {
      setNeighbors({
        prev: res.prev,
        next: res.next,
      });
    });
  }, [reload]);


  const formatExecutionTime = (duration) => {
    const seconds = Math.round(moment.duration(duration).asSeconds());
    return moment.utc(seconds * 1000).format('HH:mm:ss');
  };

  useEffect(() => {
    setAsteroidList([
      {
        title: 'Status',
        value: () => {
          if (asteroidData.status === 'failure') {
            return (
              <span
                className={clsx(classes.btn, classes.btnFailure)}
                title={asteroidData.error_msg}
              >
                Failure
              </span>
            );
          } if (asteroidData.status === 'running') {
            return (
              <span
                className={clsx(classes.btn, classes.btnRunning)}
                title={asteroidData.status}
              >
                Running
              </span>
            );
          } if (asteroidData.status === 'not_executed') {
            return (
              <span
                className={clsx(classes.btn, classes.btnNotExecuted)}
                title={asteroidData.error_msg}
              >
                Not Executed
              </span>
            );
          } if (asteroidData.status === 'warning') {
            return (
              <span
                className={clsx(classes.btn, classes.btnWarning)}
                title={asteroidData.error_msg ? asteroidData.error_msg : 'Warning'}
              >
                Warning
              </span>
            );
          }

          return (
            <span
              className={clsx(classes.btn, classes.btnSuccess)}
              title={asteroidData.status}
            >
              Success
            </span>
          );
        },
      },
      {
        title: 'Asteroid',
        value: asteroidData.name,
      },
      {
        title: 'Number',
        value: asteroidData.number,
      },
      {
        title: 'Occultations',
        value: asteroidData.occultations,
      },
      {
        title: 'Date',
        value: moment(asteroidData.finish_maps).format('YYYY-MM-DD HH:mm:ss'),
      },
      {
        title: 'Execution Time',
        value: asteroidData.h_execution_time,
      },
    ]);

    setInfoList([
      {
        title: 'Catalog',
        value: asteroidData.catalog,
      },
      {
        title: 'Neighborhood Stars',
        value: asteroidData.catalog_rows,
      },
      {
        title: 'Planetary Ephemeris',
        value: asteroidData.planetary_ephemeris,
      },
      {
        title: 'Leap Seconds',
        value: asteroidData.leap_second,
      },
      {
        title: 'Observations',
        value: '*TODO*',
      },
    ]);

    setTimeList([
      {
        title: 'Ephemeris',
        value: formatExecutionTime(asteroidData.execution_ephemeris),
      },
      {
        title: 'Catalog',
        value: formatExecutionTime(asteroidData.execution_catalog),
      },
      {
        title: 'Search Candidate',
        value: formatExecutionTime(asteroidData.execution_search_candidate),
      },
      {
        title: 'Maps',
        value: formatExecutionTime(asteroidData.execution_maps),
      },
    ]);
  }, [asteroidData, occultationData]);

  const openLightbox = (i, e) => {
    e.preventDefault();
    setLightbox({
      currentImage: i,
      isOpen: true,
    });
  };

  const closeLightbox = () => {
    setLightbox({
      currentImage: 0,
      isOpen: false,
    });
  };

  const handleDownload = async () => {
    setDownloading(true);

    const data = await getAsteroidDownloadLink({ id });

    if (data.success) {
      const { src } = data;
      const file = url + src;

      window.location.assign(file);
      setTimeout(() => {
        setDownloading(false);
      }, [3000]);
    } else {
      // TODO: Implementar notificacao de erro.
      setTimeout(() => {
        setDownloading(false);
      }, [1000]);
    }
  };

  const handleAsteroidsNavigation = (asteroidId) => {
    history.push(`/prediction-of-occultation/asteroid/${asteroidId}`);
    setReload(!reload);
  };

  const handleBackNavigation = () => history.push(`/prediction-of-occultation/${asteroidData.predict_run}`);

  return (
    <>
      <Grid
        container
        justify="space-between"
        alignItems="center"
        spacing={2}
      >
        <Grid item xs={12} md={4}>
          <Button
            variant="contained"
            color="primary"
            title="Back"
            className={classes.button}
            onClick={handleBackNavigation}
          >
            <i className={clsx('fas', 'fa-undo', classes.buttonIcon)} />
            <span>Back</span>
          </Button>
          <Button
            variant="contained"
            color="secondary"
            title="Download"
            className={classes.button}
            disabled={downloading}
            onClick={handleDownload}
          >
            <span>Download</span>
            <i className={clsx('fas', 'fa-download', classes.buttonIcon)} />
            {downloading ? (
              <CircularProgress
                color="secondary"
                className={classes.buttonProgress}
                size={24}
              />
            ) : null}
          </Button>
        </Grid>
        <Grid item xs={12} md={4}>
          <Grid container justify="flex-end">
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                title="Previous"
                className={classes.button}
                disabled={neighbors.prev === null}
                onClick={() => handleAsteroidsNavigation(neighbors.prev)}
              >
                <i className={clsx('fas', 'fa-arrow-left', classes.buttonIcon)} />
                <span>Prev</span>
              </Button>
              <Button
                variant="contained"
                color="primary"
                title="Next"
                className={classes.button}
                disabled={neighbors.next === null}
                onClick={() => handleAsteroidsNavigation(neighbors.next)}
              >
                <span>Next</span>
                <i className={clsx('fas', 'fa-arrow-right', classes.buttonIcon)} />
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4} className={classes.block}>
          <Card>
            <CardHeader title="Asteroid" />
            <CardContent>
              <CustomList data={asteroidList} />
            </CardContent>
          </Card>
        </Grid>


        <Grid item xs={12} md={4} className={classes.block}>
          <Card>
            <CardHeader title="Info" />
            <CardContent>
              <CustomList data={infoList} height={316} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4} className={classes.block}>
          <Card>
            <CardHeader title="Time Execution" />
            <CardContent>
              <CustomList data={timeList} height={316} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {occultationData.length > 0 ? (
        <Grid container spacing={2}>
          <Grid item lg={12} className={clsx(classes.block, classes.tableWrapper)}>
            <Card>
              <CardHeader title="Asteroids" />

              <CardContent>
                <CustomTable
                  columns={occultationsColumns}
                  data={occultationData}
                  hasPagination
                  pageSize={10}
                  hasSearching={false}
                  hasColumnVisibility={false}
                  hasToolbar={false}
                  remote={false}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ) : null}
      {occultationData.length > 0 ? (
        <Grid container spacing={2}>
          <Grid item xs={12} className={classes.block}>
            <Card>
              <CardContent>
                <Grid container spacing={2} className={classes.plotsWrapper}>
                  {occultationData.map((el, i) => (
                    <Fragment key={el.id}>
                      {el.source !== null ? (

                        <Grid item xs={12} sm={6} md={3}>
                          <LazyLoad
                            height={141}
                            offset={[-100, 0]}
                            once
                            placeholder={(
                              <img src={loading} alt="Loading..." />
                          )}
                          >
                            <img
                              id={el.id}
                              src={el.source}
                              onClick={(e) => openLightbox(i, e)}
                              className={clsx(classes.imgResponsive, classes.lightboxImage)}
                              title={el.asteroid_mame}
                              alt={el.asteroid_mame}
                            />
                          </LazyLoad>
                        </Grid>
                      ) : null}
                      <Grid item xs={12} sm={6} md={el.source !== null ? 3 : 6}>
                        <LazyLoad
                          height={141}
                          offset={[-100, 0]}
                          once
                        >
                          <List className={classes.root} subheader={<li />} dense>
                            <li className={classes.listSection}>
                              <ul className={classes.ul}>
                                <ListSubheader><strong>{el.date_time}</strong></ListSubheader>
                                <ListItem>
                                  <ListItemText primary="Already Happened:" secondary={<span>{ el.already_happened ? 'Yes' : 'No' }</span>} />
                                </ListItem>
                                <ListItem>
                                  <ListItemText primary="Asteroid(s):" secondary={<span>{el.asteroid}</span>} />
                                </ListItem>
                                <ListItem>
                                  <ListItemText primary="Closest Approach:" secondary={<span>{el.closest_approach}</span>} />
                                </ListItem>
                                <ListItem>
                                  <ListItemText primary="CT:" secondary={<span>{el.ct}</span>} />
                                </ListItem>
                                {/* <ListItem>
                                  <ListItemText primary="Date Time:" secondary={<span>{el.date_time}</span>} />
                                </ListItem> */}
                                <ListItem>
                                  <ListItemText primary="DEC Star Candidate:" secondary={<span>{el.dec_star_candidate}</span>} />
                                </ListItem>
                                <ListItem>
                                  <ListItemText primary="DEC Target:" secondary={<span>{el.dec_target}</span>} />
                                </ListItem>
                                <ListItem>
                                  <ListItemText primary="Delta:" secondary={<span>{el.delta}</span>} />
                                </ListItem>
                                <ListItem>
                                  <ListItemText primary="E RA:" secondary={<span>{el.e_ra}</span>} />
                                </ListItem>
                                <ListItem>
                                  <ListItemText primary="G:" secondary={<span>{el.g}</span>} />
                                </ListItem>
                                <ListItem>
                                  <ListItemText primary="H:" secondary={<span>{el.h}</span>} />
                                </ListItem>
                                <ListItem>
                                  <ListItemText primary="Loc T:" secondary={<span>{el.loc_t}</span>} />
                                </ListItem>
                                <ListItem>
                                  <ListItemText primary="Multiplicity Flag:" secondary={<span>{el.multiplicity_flag}</span>} />
                                </ListItem>
                              </ul>
                            </li>
                          </List>
                          <Divider />
                        </LazyLoad>
                      </Grid>
                    </Fragment>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ) : null}
      {neighborhoodStarsPlot || asteroidOrbitPlot ? (
        <Grid container spacing={2}>
          <Grid item xs={12} className={classes.block}>
            <Card>
              <CardHeader title="Catalog" />
              <CardContent>
                <Grid container spacing={2} className={classes.plotsWrapper}>
                  {neighborhoodStarsPlot ? (
                    <Grid item xs={12} md={asteroidOrbitPlot ? 6 : 12}>
                      <LazyLoad
                        height={450}
                        width="100%"
                        offset={[-100, 0]}
                        placeholder={(
                          <img src={loading} alt="Loading..." />
                        )}
                      >
                        <img
                          src={neighborhoodStarsPlot}
                          className={classes.imgResponsive}
                          title="Neighborhood Stars"
                          alt="Neighborhood Stars"
                        />
                      </LazyLoad>
                    </Grid>
                  ) : null}
                  {asteroidOrbitPlot ? (
                    <Grid item xs={12} md={neighborhoodStarsPlot ? 6 : 12}>
                      <LazyLoad
                        height={450}
                        offset={[-200, 0]}
                        once
                        placeholder={(
                          <img src={loading} alt="Loading..." />
                        )}
                      >
                        <img
                          src={asteroidOrbitPlot}
                          className={classes.imgResponsive}
                          title="Asteroid Orbit"
                          alt="Asteroid Orbit"
                        />
                      </LazyLoad>
                    </Grid>
                  ) : null}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ) : null}
      {inputTableData.length > 0 || outputTableData.length > 0 ? (
        <Grid container spacing={2}>
          {inputTableData.length > 0 ? (
            <Grid item xs={12} md={outputTableData.length > 0 ? 6 : 12} className={classes.block}>
              <Card>
                <CardHeader title="Inputs" />
                <CardContent className={classes.cardContentWrapper}>
                  <CustomTable
                    columns={inputColumns}
                    data={inputTableData}
                    hasPagination={false}
                    hasSearching={false}
                    hasColumnVisibility={false}
                    hasToolbar={false}
                    remote={false}
                  />
                </CardContent>
              </Card>
            </Grid>
          ) : null}
          {inputTableData.length > 0 || outputTableData.length > 0 ? (
            <Grid
              item
              xs={12}
              md={inputTableData.length > 0 ? 6 : 12}
              className={clsx(classes.block, classes.tableWrapper)}
            >
              <Card>
                <CardHeader title="Outputs" />
                <CardContent className={classes.cardContentWrapper}>
                  <CustomTable
                    columns={outputColumns}
                    data={outputTableData}
                    hasPagination={false}
                    hasSearching={false}
                    hasColumnVisibility={false}
                    hasToolbar={false}
                    remote={false}
                  />
                </CardContent>
              </Card>
            </Grid>
          ) : null}
        </Grid>
      ) : null}
      <ModalGateway>
        {lightbox.isOpen ? (
          <Modal onClose={closeLightbox}>
            <Carousel
              views={occultationData}
              currentIndex={lightbox.currentImage}
              isOpen={lightbox.isOpen}
              onClose={closeLightbox}
              styles={{
                container: () => ({
                  maxWidth: drawerOpen ? 'calc(100% - 240px)' : 'calc(100% - 64px)',
                  marginLeft: drawerOpen ? '240px' : '64px',
                }),
              }}
            />
          </Modal>
        ) : null}
      </ModalGateway>
    </>
  );
}

export default withRouter(PredictionOccultationAsteroid);