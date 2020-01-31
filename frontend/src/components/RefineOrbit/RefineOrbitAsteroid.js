import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Grid, Card, makeStyles, CardHeader, CardContent,
} from '@material-ui/core';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Icon from '@material-ui/core/Icon';
import Carousel, { Modal, ModalGateway } from 'react-images';
import clsx from 'clsx';
import moment from 'moment';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import { withRouter } from 'react-router';
import CustomList from '../helpers/CustomList';
import CustomTable from '../helpers/CustomTable';
import { url as apiUrl } from '../../api/Auth';
import {
  getAsteroidById,
  getAsteroidInputs,
  getAsteroidFiles,
  getAsteroidNeighbors,
  getAsteroidDownloadLink,
} from '../../api/Orbit';
import CustomColumnStatus from '../helpers/CustomColumnStatus';


const useStyles = makeStyles((theme) => ({
  button: {
    margin: theme.spacing(1),
  },
  backButtonIcon: {
    margin: '0 10px 0 0 ',
  },
  downloadButtonIcon: {
    margin: '0 0 0 10px ',
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
  block: {
    marginBottom: 15,
    justifyContent: 'center',
  },
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    overflow: 'hidden',
    backgroundColor: theme.palette.background.paper,
  },
  chart: {
    width: '100%',
    maxWidth: '100%',
    height: 'auto',
  },
  chartTile: {
    height: 'auto !important',
    cursor: 'pointer',
  },
  cardContentWrapper: {
    maxHeight: 342,
    overflow: 'auto',
  },
  gridListTileBar: {
    position: 'relative',
    top: 'auto',
    bottom: 'auto',
    height: 'auto',
    background: 'transparent',
    textAlign: 'center',
    padding: '12px 0px 0px',
  },
  gridListTileBarText: {
    fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
    color: 'rgba(0, 0, 0, 0.67)',
    fontSize: 14,
    textTransform: 'uppercase',
    fontWeight: 'bolder',
    textShadow: '0 0 .75px',
  },
}));

function RefineOrbitAsteroid({
  history, setTitle, match, drawerOpen,
}) {
  const { id } = match.params;
  const classes = useStyles();
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

  const plotImagesOrder = [
    'comparison_nima_jpl_ra',
    'comparison_nima_jpl_dec',
    'residual_all_v1',
    'residual_recent',
    'comparison_bsp_integration',
  ];

  useEffect(() => {
    setTitle('Refine Orbit');
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

      data.results.forEach((e) => {
        if (
          e.file_type === '.png'
          && !excludedImages.includes(e.filename)
        ) {
          // O source deve apontar para o backend
          e.src = apiUrl + e.src;
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
  }, [reload, history.location]);


  useEffect(() => {
    setAsteroidList([
      {
        title: 'Status',
        value: () => <CustomColumnStatus status={asteroidData.status} title={asteroidData.error_msg} />,
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
      const file = apiUrl + src;

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

  const handleBackNavigation = () => history.push(`/refine-orbit/${asteroidData.orbit_run}`);


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
      <Grid container spacing={2}>
        <Grid item lg={4} xl={3} className={classes.block}>
          <Card>
            <CardHeader title="Asteroid" />
            <CardContent>
              <CustomList data={asteroidList} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {charts.length > 0 ? (
        <Grid container spacing={2}>
          <Grid item className={classes.block}>
            <Card>
              <CardHeader title="Comparing orbit determined with NIMA and that from JPL" />
              <GridList cols={2} className={classes.block}>
                {charts.map((image, i) => (
                  <GridListTile key={image.filename} item className={classes.chartTile}>
                    <GridListTileBar
                      className={classes.gridListTileBar}
                      title={<span className={classes.gridListTileBarText}>{image.filename}</span>}
                      subtitle={<span className={classes.gridListTileBarText}>{`type: ${image.type}`}</span>}
                    />
                    <img
                      src={image.src}
                      className={classes.chart}
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
        <Grid item lg={resultTableData.length > 0 ? 6 : 12} className={classes.block}>
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
        {resultTableData.length > 0 ? (
          <Grid item lg={6} className={classes.block}>
            <Card>
              <CardHeader title="Results" />
              <CardContent className={classes.cardContentWrapper}>
                <CustomTable
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

RefineOrbitAsteroid.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  setTitle: PropTypes.func.isRequired,
  drawerOpen: PropTypes.bool.isRequired,
};

export default withRouter(RefineOrbitAsteroid);
