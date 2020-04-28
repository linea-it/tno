import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {
  Grid,
  Card,
  CardHeader,
  CardContent,
  Icon,
  Button,
  CircularProgress,
} from '@material-ui/core';
import Carousel, { Modal, ModalGateway } from 'react-images';
import { useParams, useHistory } from 'react-router-dom';
import Image from '../../components/List/Image';
import List from '../../components/List';
import Table from '../../components/Table';
import ColumnStatus from '../../components/Table/ColumnStatus';
import { url } from '../../services/api/Auth';
import { getOccultations } from '../../services/api/Occultation';
import {
  getAsteroidById,
  getAsteroidInputs,
  getAsteroidOutputs,
  getAsteroidDownloadLink,
  getAsteroidNeighbors,
} from '../../services/api/Prediction';

function PredictionOccultationAsteroid({ setTitle, drawerOpen }) {
  const { id } = useParams();
  const history = useHistory();
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
  }, [setTitle]);

  useEffect(() => {
    getAsteroidById({ id }).then((res) => setAsteroidData(res));
    getOccultations({
      filters: [
        {
          property: 'asteroid',
          value: id,
        },
      ],
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

      const neighborhoodStars = data.results.filter(
        (el) => el.type === 'neighborhood_stars'
      )[0];
      const asteroidOrbit = data.results.filter(
        (el) => el.type === 'asteroid_orbit'
      )[0];

      if (neighborhoodStars)
        setNeighborhoodStarsPlot(url + neighborhoodStars.src);
      if (asteroidOrbit) setAsteroidOrbitPlot(url + asteroidOrbit.src);

      setOutputTableData(tableData);
    });

    getAsteroidNeighbors({ id }).then((res) => {
      setNeighbors({
        prev: res.prev,
        next: res.next,
      });
    });
  }, [id, reload, history.location]);

  const formatExecutionTime = (duration) => {
    const seconds = Math.round(moment.duration(duration).asSeconds());
    return moment.utc(seconds * 1000).format('HH:mm:ss');
  };

  useEffect(() => {
    setAsteroidList([
      {
        title: 'Status',
        value: () => (
          <ColumnStatus
            status={asteroidData.status}
            title={asteroidData.error_msg}
          />
        ),
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

  const handleBackNavigation = () =>
    history.push(`/prediction-of-occultation/${asteroidData.predict_run}`);

  const handleImageClick = (occultationId) =>
    history.push(`/occultation/${occultationId}`);

  return (
    <>
      <Grid container justify="space-between" alignItems="center" spacing={2}>
        <Grid item xs={6}>
          <Button
            variant="contained"
            color="primary"
            title="Back"
            onClick={handleBackNavigation}
          >
            <Icon className="fas fa-undo" />
            <span>Back</span>
          </Button>
          <Button
            variant="contained"
            color="secondary"
            title="Download"
            disabled={downloading}
            onClick={handleDownload}
          >
            <span>Download</span>
            <Icon className="fas fa-download" />
            {downloading ? (
              <CircularProgress color="secondary" size={24} />
            ) : null}
          </Button>
        </Grid>
        <Grid item xs={6}>
          <Grid container justify="flex-end">
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                title="Previous"
                disabled={neighbors.prev === null}
                onClick={() => handleAsteroidsNavigation(neighbors.prev)}
              >
                <Icon className="fas fa-arrow-left" />
                <span>Prev</span>
              </Button>
              <Button
                variant="contained"
                color="primary"
                title="Next"
                disabled={neighbors.next === null}
                onClick={() => handleAsteroidsNavigation(neighbors.next)}
              >
                <span>Next</span>
                <Icon className="fas fa-arrow-right" />
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Asteroid" />
            <CardContent>
              <List data={asteroidList} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Info" />
            <CardContent>
              <List data={infoList} height={316} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Time Execution" />
            <CardContent>
              <List data={timeList} height={316} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {occultationData.length > 0 ? (
        <Grid container spacing={2}>
          <Grid item lg={12}>
            <Card>
              <CardHeader title="Occultations" />

              <CardContent>
                <Table
                  columns={occultationsColumns}
                  data={occultationData}
                  hasPagination={false}
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
                <Image
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
          <Grid item xs={12}>
            <Card>
              <CardHeader title="Catalog" />
              <CardContent>
                <Grid container spacing={2}>
                  {neighborhoodStarsPlot ? (
                    <Grid item xs={12} md={asteroidOrbitPlot ? 6 : 12}>
                      <img
                        src={neighborhoodStarsPlot}
                        title="Neighborhood Stars"
                        alt="Neighborhood Stars"
                      />
                    </Grid>
                  ) : null}
                  {asteroidOrbitPlot ? (
                    <Grid item xs={12} md={neighborhoodStarsPlot ? 6 : 12}>
                      <img
                        src={asteroidOrbitPlot}
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
      {inputTableData.length > 0 || outputTableData.length > 0 ? (
        <Grid container spacing={2}>
          {inputTableData.length > 0 ? (
            <Grid item xs={12} md={outputTableData.length > 0 ? 6 : 12}>
              <Card>
                <CardHeader title="Inputs" />
                <CardContent>
                  <Table
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
            <Grid item xs={12} md={inputTableData.length > 0 ? 6 : 12}>
              <Card>
                <CardHeader title="Outputs" />
                <CardContent>
                  <Table
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
                  maxWidth: drawerOpen
                    ? 'calc(100% - 240px)'
                    : 'calc(100% - 64px)',
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
  setTitle: PropTypes.func.isRequired,
  drawerOpen: PropTypes.bool.isRequired,
};

export default PredictionOccultationAsteroid;
