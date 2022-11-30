import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { useParams, useHistory } from 'react-router-dom';
import Carousel, { Modal, ModalGateway } from 'react-images';
import {
  Grid,
  Card,
  CardHeader,
  CardContent,
  Button,
  CircularProgress,
  Icon,
  GridList,
  GridListTile,
  GridListTileBar,
} from '@material-ui/core';
import List from '../../components/List';
import Table from '../../components/Table';
import ColumnStatus from '../../components/Table/ColumnStatus';
import { url } from '../../services/api/Auth';
import {
  getAsteroidById,
  getAsteroidInputs,
  getAsteroidFiles,
  getAsteroidNeighbors,
  getAsteroidDownloadLink,
} from '../../services/api/Orbit';

function RefineOrbitAsteroid({ setTitle, drawerOpen }) {
  const { id } = useParams();
  const history = useHistory();
  const [asteroidData, setAsteroidData] = useState([]);
  const [asteroidList, setAsteroidList] = useState([]);
  const [inputTableData, setInputTableData] = useState([]);
  const [resultTableData, setResultTableData] = useState([]);
  const [charts, setCharts] = useState([]);
  const [lightbox, setLightbox] = useState({
    currentImage: 0,
    isOpen: false,
  });
  const [downloading, setDownloading] = useState(false);
  const [neighbors, setNeighbors] = useState({
    prev: null,
    next: null,
  });
  const [reload, setReload] = useState(false);

  const inputColumns = [
    {
      name: 'input_type',
      title: 'Inputs',
    },
    {
      name: 'source',
      title: 'Source',
    },
    {
      name: 'date_time',
      title: 'Date',
      customElement: (el) => (
        <span>
          {el.date_time ? moment(el.date_time).format('YYYY-MM-DD') : ''}
        </span>
      ),
      width: 150,
    },
    {
      name: 'filename',
      title: 'Filename',
    },
  ];

  const resultColumns = [
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
    setTitle('Refine Orbit');
  }, [setTitle]);

  useEffect(() => {
    setAsteroidData([]);
    setAsteroidList([]);
    setInputTableData([]);
    setResultTableData([]);
    setCharts([]);
    setAsteroidList([]);
    setDownloading(false);
    setNeighbors({
      prev: null,
      next: null,
    });

    getAsteroidById({ id }).then((data) => setAsteroidData(data));

    getAsteroidInputs({ id }).then((data) => {
      const tableData = data.results.map((res) => ({
        input_type: res.input_type,
        source: res.source,
        date_time: res.date_time,
        filename: res.filename,
      }));
      setInputTableData(tableData);
    });
    getAsteroidFiles({ id }).then((data) => {
      const resultData = data.results.map((res) => ({
        filename: res.filename,
        h_size: res.h_size,
        file_type: res.file_type,
      }));

      // Lista so com os arquivos que sao imagens
      const excludedImages = ['omc_sep.png'];
      const images = [];
      const plotImagesOrder = [
        'comparison_nima_jpl_ra',
        'comparison_nima_jpl_dec',
        'residual_all_v1',
        'residual_recent',
        'comparison_bsp_integration',
      ];

      data.results.forEach((e) => {
        if (e.file_type === '.png' && !excludedImages.includes(e.filename)) {
          // O source deve apontar para o backend
          e.src = url + e.src;
          // Saber em qual ordem deve ser exibida a imagem.
          const idx = plotImagesOrder.indexOf(e.type);

          if (idx > -1) {
            images[idx] = e;
          }
        }
      });
      setCharts(images);
      setResultTableData(resultData);
    });

    getAsteroidNeighbors({ id }).then((res) => {
      setNeighbors({
        prev: res.prev,
        next: res.next,
      });
    });
  }, [reload, history.location, id]);

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
        title: 'Executed',
        value: asteroidData.h_time,
      },
      {
        title: 'Execution Time',
        value: asteroidData.h_execution_time,
      },
      {
        title: 'Size',
        value: asteroidData.h_size,
      },
    ]);
  }, [asteroidData]);

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
    history.push(`/refine-orbit/asteroid/${asteroidId}`);
    setReload(!reload);
  };

  const handleBackNavigation = () =>
    history.push(`/refine-orbit/${asteroidData.orbit_run}`);

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
      <Grid container spacing={2}>
        <Grid item xs={12} lg={4} xl={3}>
          <Card>
            <CardHeader title="Asteroid" />
            <CardContent>
              <List data={asteroidList} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {charts.length > 0 ? (
        <Grid container spacing={2}>
          <Grid item>
            <Card>
              <CardHeader title="Comparing orbit determined with NIMA and that from JPL" />
              <GridList cols={2}>
                {charts.map((image, i) => (
                  <GridListTile key={image.filename} item>
                    <GridListTileBar
                      title={<span>{image.filename}</span>}
                      subtitle={<span>{`type: ${image.type}`}</span>}
                    />
                    <img
                      src={image.src}
                      alt={image.filename}
                      title={image.filename}
                      onClick={(e) => openLightbox(i, e)}
                    />
                  </GridListTile>
                ))}
              </GridList>
              <CardContent />
            </Card>
          </Grid>
        </Grid>
      ) : null}

      <Grid container spacing={2}>
        <Grid item lg={resultTableData.length > 0 ? 6 : 12}>
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
        {resultTableData.length > 0 ? (
          <Grid item lg={6}>
            <Card>
              <CardHeader title="Results" />
              <CardContent>
                <Table
                  columns={resultColumns}
                  data={resultTableData}
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
      <ModalGateway>
        {lightbox.isOpen ? (
          <Modal onClose={closeLightbox}>
            <Carousel
              views={charts}
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

RefineOrbitAsteroid.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  setTitle: PropTypes.func.isRequired,
  drawerOpen: PropTypes.bool.isRequired,
};

export default RefineOrbitAsteroid;
