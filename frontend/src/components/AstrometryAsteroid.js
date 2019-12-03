import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Grid, Card, makeStyles, CardHeader, CardContent,
} from '@material-ui/core';
import clsx from 'clsx';
import moment from 'moment';
import Carousel, { Modal, ModalGateway } from 'react-images';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import { withRouter } from 'react-router';
import filesize from 'filesize';
import CustomList from './utils/CustomList';
import CustomTable from './utils/CustomTable';
import { Donut } from './utils/CustomChart';
import { url } from '../api/Auth'
import {
  getAsteroidById,
  getAsteroidNeighbors,
  getAstrometryTable,
  getAsteroidMainOutputs,
  getOutputFile,
  getAstrometryPlots,
  getInputsByAsteroidId,
  getAsteroidOutputsTree,
  getCSV,
} from '../api/Praia';
import CustomDialog from './utils/CustomDialog';
import CustomLog from './utils/CustomLog';

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
  iconDetail: {
    fontSize: 18,
    cursor: 'pointer',
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
  buttonContained: {
    [theme.breakpoints.up('md')]: {
      width: '100%',
    },
  },
  cardTableResponsive: {
    maxHeight: 500,
    overflow: 'auto',
  },
}));

function AstrometryAsteroid({
  history,
  setTitle,
  match,
  drawerOpen,
}) {
  const classes = useStyles();
  const { id } = match.params;
  const [asteroidData, setAsteroidData] = useState([]);
  const [asteroidList, setAsteroidList] = useState([]);
  const [astrometryTable, setAstrometryTable] = useState([]);
  const [asteroidMainOutputs, setAsteroidMainOutputs] = useState([]);
  const [outputLog, setOutputLog] = useState({ visible: false, content: [], title: '' });
  const [astrometryPlots, setAstrometryPlots] = useState([]);
  const [inputTable, setInputTable] = useState([]);
  const [outputTable, setOutputTable] = useState([]);

  const [lightbox, setLightbox] = useState({
    isOpen: false,
    currentImage: 0,
  });
  const [neighbors, setNeighbors] = useState({
    prev: null,
    next: null,
  });
  const [reload, setReload] = useState(false);

  const [inputCsv, setInputCsv] = useState({ visible: false, content: '', title: '' });
  const [inputCsvVisible, setInputCsvVisible] = useState(false);
  const [inputCsvTable, setInputCsvTable] = useState({
    columns: [],
    rows: [],
    count: 0,
  });


  const astrometryColumns = [
    {
      name: 'ra',
      title: 'RA',
      align: 'right',
    },
    {
      name: 'dec',
      title: 'Dec',
      align: 'right',
    },
    {
      name: 'mag',
      title: 'mag',
      align: 'right',
    },
    {
      name: 'julian_date',
      title: 'Julian Date',
    },
    {
      name: 'obs_code',
      title: 'Obs. Code',
      align: 'right',
    },
    {
      name: 'catalog_code',
      title: 'Catalog Code',
      align: 'center',
    },
  ];
  const inputColumns = [
    {
      name: 'type_name',
      title: 'Input Type',
      width: 320,
    },
    {
      name: 'filename',
      title: 'Filename',
      width: 320,
    },
    {
      name: 'h_file_size',
      title: 'File Size',
      width: 150,
    },
    {
      name: 'id',
      title: ' ',
      customElement: (row) => {
        if (row.file_type && row.file_type === 'csv' && row.file_type !== '') {
          return (
            <Icon
              className={clsx(`fas fa-file-csv ${classes.iconDetail}`)}
              onClick={() => setInputCsv({ title: row.filename, content: row.file_path, visible: false })}
            />
          );
        }
      },
    },
  ];


  const outputColumns = [
    {
      name: 'ccd_filename',
      title: 'CCD Filename',
      width: 320,
    },
    {
      name: 'expnum',
      title: 'Expnum',
      width: 80,
    },
    {
      name: 'ccd_num',
      title: 'CCD',

      width: 80,
    },
    {
      name: 'band',
      title: 'Band',

      width: 80,
    },
    {
      name: 'count_outputs',
      title: 'Files',
      width: 80,
    },
    {
      name: 'type_name',
      title: 'Type',
      width: 180,
    },
    {
      name: 'catalog',
      title: 'Ref. Catalog',
      width: 120,
    },
    {
      name: 'file_type',
      title: 'Extension',
      width: 100,
    },
    {
      name: 'h_size',
      title: 'File size',
      width: 100,
    },
  ];


  useEffect(() => {
    setTitle('Astrometry Asteroid');
    setAsteroidData([]);

    setLightbox({
      isOpen: false,
      currentImage: 0,
    });
    setNeighbors({
      prev: null,
      next: null,
    });


    getAsteroidById({ id }).then((res) => setAsteroidData(res));

    getAsteroidNeighbors({ id }).then((res) => {
      setNeighbors({
        prev: res.prev,
        next: res.next,
      });
    });

    getAstrometryTable({ id }).then((res) => {
      setAstrometryTable(res.rows);
    });

    getAsteroidMainOutputs({ id }).then((res) => {
      setAsteroidMainOutputs(res.rows);
    });

    getAstrometryPlots({ id }).then((res) => {
      setAstrometryPlots(
        res.rows.map((row) => ({
          ...row,
          source: row.src ? url + row.src : null,
        })),
      );
    });

    getInputsByAsteroidId({ id }).then((res) => {
      setInputTable(res.results);
    });

    getAsteroidOutputsTree({ id }).then((res) => {
      const outputs = [];
      res.rows.forEach((row) => {
        row.outputs.forEach((output) => {
          outputs.push({
            ...output,
            band: row.band,
            ccd_filename: row.ccd_filename,
            ccd_num: row.ccd_num,
            count_outputs: row.count_outputs,
            expnum: row.expnum,
            h_size: filesize(output.file_size),
          });
        });
      });
      setOutputTable(outputs);
    });
  }, [reload, history.location]);

  useEffect(() => {
    setAsteroidList([
      { title: 'Process', value: asteroidData.proccess_displayname },
      { title: 'Asteroid', value: asteroidData.name },
      { title: 'Execution Time', value: asteroidData.h_execution_time },
      { title: 'CCDs', value: asteroidData.ccd_images },
      { title: 'Reference Catalog', value: asteroidData.catalogName },
      { title: 'Catalog Rows', value: asteroidData.catalog_rows },
      { title: 'Positions Detected', value: astrometryTable.length },
      { title: 'Processed CCDs', value: asteroidData.processed_ccd_image },
    ]);
  }, [asteroidData, astrometryTable]);


  const renderExecutionTime = () => {
    const colors = ['#1255a6', '#2b66b2', '#3f77be', '#5388c9', '#6699d4', '#7aabdf', '#8fbdea', '#a5cef4', '#bbe0ff'];

    const data = [
      {
        name: 'CCD Images',
        value:
          asteroidData.execution_ccd_list !== null
            ? Math.ceil(moment.duration(asteroidData.execution_ccd_list).asSeconds())
            : 0.0,
      },
      {
        name: 'Ephemeris JPL',
        value:
          asteroidData.execution_bsp_jpl !== null
            ? Math.ceil(moment.duration(asteroidData.execution_bsp_jpl).asSeconds())
            : 0.0,
      },
      {
        name: 'Reference Catalog',
        value:
          asteroidData.execution_reference_catalog !== null
            ? Math.ceil(moment.duration(asteroidData.execution_reference_catalog).asSeconds())
            : 0.0,
      },
      {
        name: 'Header Extraction',
        value:
          asteroidData.execution_header !== null
            ? Math.ceil(moment.duration(asteroidData.execution_header).asSeconds())
            : 0.0,
      },
      {
        name: 'Astrometry',
        value:
          asteroidData.execution_astrometry !== null
            ? moment.duration(asteroidData.execution_astrometry).asSeconds()
            : 0.0,
      },
      {
        name: 'Target Search',
        value:
          asteroidData.execution_targets !== null
            ? moment.duration(asteroidData.execution_targets).asSeconds()
            : 0.0,
      },
      {
        name: 'Plots',
        value:
          asteroidData.execution_plots !== null
            ? moment.duration(asteroidData.execution_plots).asSeconds()
            : 0.0,
      },
      {
        name: 'Registry',
        value:
          asteroidData.execution_registry !== null
            ? moment.duration(asteroidData.execution_registry).asSeconds()
            : 0.0,
      },
    ];

    return (
      <Donut
        data={data}
        fill={colors}
        height={408}
      />
    );
  };

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

  const handleAsteroidsNavigation = (asteroidId) => {
    history.push(`/astrometry/asteroid/${asteroidId}`);
    setReload(!reload);
  };

  const handleBackNavigation = () => history.push(`/astrometry/${asteroidData.astrometry_run}`);

  const handleMainOutputClick = (output) => {
    getOutputFile(output.file_path).then((res) => {
      setOutputLog({
        title: output.filename,
        visible: true,
        content: res.rows,
      });
    });
  };

  const loadInputCsvTableData = ({ currentPage, pageSize }) => {
    getCSV({ filepath: inputCsv.content, page: currentPage + 1, pageSize })
      .then((res) => {
        setInputCsvTable({
          ...res,
          columns: res.columns.map((column) => ({
            name: column,
            title: column,
          })),
        });
        setInputCsvVisible(true);
      });
  };

  useEffect(() => {
    console.log(astrometryPlots);
  }, [astrometryPlots]);


  useEffect(() => {
    if (inputCsv.content !== '') loadInputCsvTableData({ currentPage: 0, pageSize: 10 });
  }, [inputCsv]);

  const handleOutputLogClose = () => setOutputLog({ visible: false, content: '', title: '' });

  const handleInputCsvClose = () => {
    setInputCsvVisible(false);
    setInputCsv({ content: '', title: '' });
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
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
              <Icon className={clsx('fas', 'fa-undo', classes.buttonIcon)} />
              <span>Back</span>
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
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader title="Asteroid" />
              <CardContent>
                <CustomList data={asteroidList} />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={8}>
            <Card>
              <CardHeader title="Execution Time" />
              <CardContent>
                {renderExecutionTime()}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <ButtonGroup className={classes.buttonContained}>
              {asteroidMainOutputs.map((output) => (
                <Button
                  key={output.id}
                  className={classes.buttonContained}
                  variant="contained"
                  color="primary"
                  title="Back"
                  onClick={() => handleMainOutputClick(output)}
                >
                  {output.type_name}
                </Button>
              ))}
            </ButtonGroup>
          </Grid>
        </Grid>
      </Grid>

      <Grid item xs={12}>
        {astrometryTable.length > 0 ? (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Card>
                <CardHeader title="Astrometry" />
                <CardContent>
                  <CustomTable
                    columns={astrometryColumns}
                    data={astrometryTable}
                    totalCount={astrometryTable.length}
                    hasColumnVisibility={false}
                    remote={false}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        ) : null}
      </Grid>

      <Grid item xs={12}>
        {astrometryPlots.length > 0 ? (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Card>
                <CardHeader title="CCD x Stars x Asteroid" />
                <CardContent>
                  <Grid container spacing={2}>
                    {astrometryPlots.map((plot, i) => (
                      <Grid item xs={12} sm={6} md={3} key={plot.id}>
                        <img
                          src={plot.source}
                          onClick={(e) => openLightbox(i, e)}
                          className={clsx(classes.imgResponsive, classes.lightboxImage)}
                          title={plot.filename}
                          alt={plot.filename}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        ) : null}
      </Grid>

      <Grid item xs={12}>
        {inputTable.length > 0 ? (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Card>
                <CardHeader title="Input" />
                <CardContent className={classes.cardTableResponsive}>
                  <CustomTable
                    columns={inputColumns}
                    data={inputTable}
                    hasPagination={false}
                    hasColumnVisibility={false}
                    remote={false}
                    hasSearching={false}
                    hasToolbar={false}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        ) : null}
      </Grid>

      <Grid item xs={12}>
        {outputTable.length > 0 ? (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Card>
                <CardHeader title="Output" />
                <CardContent className={classes.cardTableResponsive}>
                  <CustomTable
                    columns={outputColumns}
                    data={outputTable}
                    hasGrouping
                    grouping={[{ columnName: 'ccd_filename' }]}
                    hasPagination={false}
                    hasColumnVisibility={false}
                    remote={false}
                    hasSearching={false}
                    hasToolbar={false}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        ) : null}
      </Grid>

      <CustomDialog
        maxWidth="md"
        visible={outputLog.visible}
        setVisible={handleOutputLogClose}
        title={outputLog.title}
        content={<CustomLog data={outputLog.content} />}
        headerStyle={classes.logToolbar}
        bodyStyle={classes.logBody}
        wrapperStyle={{ marginLeft: drawerOpen ? '240px' : '64px' }}
      />

      <CustomDialog
        maxWidth="lg"
        visible={inputCsvVisible}
        setVisible={handleInputCsvClose}
        title={inputCsv.title}
        content={() => (
          <CustomTable
            columns={inputCsvTable.columns}
            data={inputCsvTable.rows}
            totalCount={inputCsvTable.count}
            loadData={loadInputCsvTableData}
            hasSearching={false}
            hasSorting={false}
          />
        )}
        wrapperStyle={{ marginLeft: drawerOpen ? '240px' : '64px' }}
      />

      <ModalGateway>
        {lightbox.isOpen ? (
          <Modal onClose={closeLightbox}>
            <Carousel
              views={astrometryPlots}
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
    </Grid>
  );
}

AstrometryAsteroid.propTypes = {
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

export default withRouter(AstrometryAsteroid);
