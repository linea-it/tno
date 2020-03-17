import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Grid, Card, makeStyles, CardHeader, CardContent,
} from '@material-ui/core';
import clsx from 'clsx';
import moment from 'moment';
import Carousel, { Modal, ModalGateway } from 'react-images';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import CircularProgress from '@material-ui/core/CircularProgress';
import { withRouter } from 'react-router';
import CustomGridList from '../helpers/CustomGridList';
import CustomList from '../helpers/CustomList';
import CustomTable from '../helpers/CustomTable';
import { url } from '../../api/Auth';
import {
  getAsteroidById,
  getAsteroidInputs,
  getAsteroidOutputs,
  getAsteroidDownloadLink,
  getAsteroidNeighbors,
} from '../../api/Prediction';
import { getOccultations } from '../../api/Occultation';
import loading from '../../assets/img/loading.gif';
import CustomColumnStatus from '../helpers/CustomColumnStatus';

const useStyles = makeStyles((theme) => ({
  button: {
    margin: theme.spacing(1),
  },
  backButtonIcon: {
    margin: '0 10px 0 0',
  },
  downloadButtonIcon: {
    margin: '0 0 0 10px',
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
  const [pageSize, setPageSize] = useState(10);


  const occultationsColumns = [
    {
      name: 'date_time',
      title: 'Date Time',
      width: 170,
      align: 'center',
    },
    {
      name: 'ra_star_candidate',
      title: 'RA Candidate Star (hms)',
      width: 210,
      align: 'center',
    },
    {
      name: 'dec_star_candidate',
      title: 'Dec Candidate Star (dms)',
      width: 220,
      align: 'center',
    },
    {
      name: 'ra_target',
      title: 'RA Target',
      align: 'center',

    },
    {
      name: 'dec_target',
      title: 'Dec Target',
      width: 100,
      align: 'center',
    },
    {
      name: 'velocity',
      title: 'Velocity In Plane of Sky',
      width: 195,
      align: 'center',
    },
    {
      name: 'closest_approach',
      title: 'C/A [arcsec]',
      width: 110,
      align: 'center',
    },
    {
      name: 'position_angle',
      title: 'P/A [deg]',
      width: 90,
      align: 'center',
    },
    {
      name: 'g',
      title: 'G*',
      width: 60,
      align: 'center',
    },
    {
      name: 'j',
      title: 'J*',
      width: 60,
      align: 'center',
    },
    {
      name: 'h',
      title: 'H*',
      width: 60,
      align: 'center',
    },
    {
      name: 'k',
      title: 'K*',
      width: 60,
      align: 'center',
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
    getOccultations({
      filters: [{
        property: 'asteroid',
        value: id,
      }],
      pageSize: null,
    }).then((data) => {
      setOccultationData(data.results);
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
  }, [reload, history.location]);


  const formatExecutionTime = (duration) => {
    const seconds = Math.round(moment.duration(duration).asSeconds());
    return moment.utc(seconds * 1000).format('HH:mm:ss');
  };

  useEffect(() => {
    setAsteroidList([
      {
        title: 'Status',
        value: () => <CustomColumnStatus status={asteroidData.status} title={asteroidData.error_msg} />,
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
        value: '',
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

  const handleImageClick = (id) => history.push(`/occultations/${id}`);

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
            <Icon className={clsx('fas', 'fa-undo', classes.backButtonIcon)} />
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
            <Icon className={clsx('fas', 'fa-download', classes.downloadButtonIcon)} />
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
                <Icon className={clsx('fas', 'fa-arrow-left', classes.buttonIcon)} />
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
                <Icon className={clsx('fas', 'fa-arrow-right', classes.buttonIcon)} />
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid container spacing={3}>
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
              <CardHeader title="Occultations" />

              <CardContent className={classes.cardContentWrapper}>
                <CustomTable
                  columns={occultationsColumns}
                  data={occultationData}
                  hasPagination={false}
                  pageSize={pageSize}
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
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <CustomGridList
                  data={occultationData}
                  baseUrl={url}
                  handleImageClick={handleImageClick}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ) : null}

      {neighborhoodStarsPlot !== '' || asteroidOrbitPlot !== '' ? (
        <Grid container spacing={2}>
          <Grid item xs={12} className={classes.block}>
            <Card>
              <CardHeader title="Catalog" />
              <CardContent>
                <Grid container spacing={2} className={classes.plotsWrapper}>
                  {neighborhoodStarsPlot ? (
                    <Grid item xs={12} md={asteroidOrbitPlot ? 6 : 12}>
                      <img
                        src={neighborhoodStarsPlot}
                        className={classes.imgResponsive}
                        title="Neighborhood Stars"
                        alt="Neighborhood Stars"
                      />
                    </Grid>
                  ) : null}
                  {asteroidOrbitPlot ? (
                    <Grid item xs={12} md={neighborhoodStarsPlot ? 6 : 12}>
                      <img
                        src={asteroidOrbitPlot}
                        className={classes.imgResponsive}
                        title="Asteroid Orbit"
                        alt="Asteroid Orbit"
                      />
                    </Grid>
                  ) : null}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ) : null}
      {inputTableData.length > 0 ? (
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
          {outputTableData.length > 0 ? (
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

PredictionOccultationAsteroid.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  setTitle: PropTypes.func.isRequired,
  drawerOpen: PropTypes.bool.isRequired,
};

export default withRouter(PredictionOccultationAsteroid);
