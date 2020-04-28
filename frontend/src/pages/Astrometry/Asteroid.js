import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {
  Grid,
  Card,
  CardHeader,
  CardContent,
  Button,
  ButtonGroup,
  Icon,
} from '@material-ui/core';
import Carousel, { Modal, ModalGateway } from 'react-images';
import { useParams, useHistory } from 'react-router-dom';
import filesize from 'filesize';
import List from '../../components/List';
import Table from '../../components/Table';
import Donut from '../../components/Chart/Donut';
import AstrometryTimeProfile from '../../components/Chart/AstrometryTimeProfile';
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
  getAsteroidTimeProfile,
} from '../../services/api/Praia';
import { url } from '../../services/api/Auth';
import Dialog from '../../components/Dialog';
import Log from '../../components/Log';

function AstrometryAsteroid({ setTitle, drawerOpen }) {
  const { id } = useParams();
  const history = useHistory();
  const [asteroidData, setAsteroidData] = useState([]);
  const [asteroidList, setAsteroidList] = useState([]);
  const [astrometryTable, setAstrometryTable] = useState([]);
  const [asteroidMainOutputs, setAsteroidMainOutputs] = useState([]);
  const [outputLog, setOutputLog] = useState({
    visible: false,
    content: [],
    title: '',
  });
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

  const [inputCsv, setInputCsv] = useState({
    visible: false,
    content: '',
    title: '',
  });
  const [inputCsvVisible, setInputCsvVisible] = useState(false);
  const [inputCsvTable, setInputCsvTable] = useState({
    columns: [],
    rows: [],
    count: 0,
  });

  const [astrometryTimeProfile, setAstrometryTimeProfile] = useState([]);

  const astrometryColumns = [
    {
      name: 'ra',
      title: 'RA',
      align: 'right',
      headerTooltip: 'Right Ascension',
    },
    {
      name: 'dec',
      title: 'Dec',
      align: 'right',
      headerTooltip: 'Declination',
    },
    {
      name: 'mag',
      title: 'Mag',
      align: 'right',
      headerTooltip: 'Magnitude',
    },
    {
      name: 'julian_date',
      title: 'Julian Date',
      headerTooltip: 'Julian Reference Date',
    },
    {
      name: 'obs_code',
      title: 'Obs Code',
      align: 'right',
      headerTooltip: 'Observation Code',
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
              className="fas fa-file-csv"
              onClick={() =>
                setInputCsv({
                  title: row.filename,
                  content: row.file_path,
                  visible: false,
                })
              }
            />
          );
        }
        return '-';
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
  }, [setTitle]);

  useEffect(() => {
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
        }))
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

    getAsteroidTimeProfile(id).then((res) =>
      setAstrometryTimeProfile(res.rows)
    );
  }, [reload, id, history.location]);

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
    const colors = [
      '#1255a6',
      '#2b66b2',
      '#3f77be',
      '#5388c9',
      '#6699d4',
      '#7aabdf',
      '#8fbdea',
      '#a5cef4',
      '#bbe0ff',
    ];

    const data = [
      {
        name: 'CCD Images',
        title: asteroidData.execution_ccd_list
          ? asteroidData.execution_ccd_list.split('.')[0]
          : 0,
        value:
          asteroidData.execution_ccd_list !== null
            ? Math.ceil(
                moment.duration(asteroidData.execution_ccd_list).asSeconds()
              )
            : 0.0,
      },
      {
        name: 'Ephemeris JPL',
        title: asteroidData.execution_bsp_jpl
          ? asteroidData.execution_bsp_jpl.split('.')[0]
          : 0,
        value:
          asteroidData.execution_bsp_jpl !== null
            ? Math.ceil(
                moment.duration(asteroidData.execution_bsp_jpl).asSeconds()
              )
            : 0.0,
      },
      {
        name: 'Reference Catalog',
        title: asteroidData.execution_reference_catalog
          ? asteroidData.execution_reference_catalog.split('.')[0]
          : 0,
        value:
          asteroidData.execution_reference_catalog !== null
            ? Math.ceil(
                moment
                  .duration(asteroidData.execution_reference_catalog)
                  .asSeconds()
              )
            : 0.0,
      },
      {
        name: 'Header Extraction',
        title: asteroidData.execution_header
          ? asteroidData.execution_header.split('.')[0]
          : 0,
        value:
          asteroidData.execution_header !== null
            ? Math.ceil(
                moment.duration(asteroidData.execution_header).asSeconds()
              )
            : 0.0,
      },
      {
        name: 'Astrometry',
        title: asteroidData.execution_astrometry
          ? asteroidData.execution_astrometry.split('.')[0]
          : 0,
        value:
          asteroidData.execution_astrometry !== null
            ? moment.duration(asteroidData.execution_astrometry).asSeconds()
            : 0.0,
      },
      {
        name: 'Target Search',
        title: asteroidData.execution_targets
          ? asteroidData.execution_targets.split('.')[0]
          : 0,
        value:
          asteroidData.execution_targets !== null
            ? moment.duration(asteroidData.execution_targets).asSeconds()
            : 0.0,
      },
      {
        name: 'Plots',
        title: asteroidData.execution_plots
          ? asteroidData.execution_plots.split('.')[0]
          : 0,
        value:
          asteroidData.execution_plots !== null
            ? moment.duration(asteroidData.execution_plots).asSeconds()
            : 0.0,
      },
      {
        name: 'Registry',
        title: asteroidData.execution_registry
          ? asteroidData.execution_registry.split('.')[0]
          : 0,
        value:
          asteroidData.execution_registry !== null
            ? moment.duration(asteroidData.execution_registry).asSeconds()
            : 0.0,
      },
    ];

    return <Donut data={data} fill={colors} height={408} />;
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

  const handleBackNavigation = () =>
    history.push(`/astrometry/${asteroidData.astrometry_run}`);

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
    getCSV({
      filepath: inputCsv.content,
      page: currentPage + 1,
      pageSize,
    }).then((res) => {
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

  const handleOutputLogClose = () =>
    setOutputLog({ visible: false, content: '', title: '' });

  const handleInputCsvClose = () => {
    setInputCsvVisible(false);
    setInputCsv({ content: '', title: '' });
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Grid container justify="space-between" alignItems="center" spacing={2}>
          <Grid item xs={4} md={4}>
            <Button
              variant="contained"
              color="primary"
              title="Back"
              onClick={handleBackNavigation}
            >
              <Icon className="fas fa-undo" />
              <span>Back</span>
            </Button>
          </Grid>
          <Grid item xs={8} md={4}>
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
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader title="Asteroid" />
              <CardContent>
                <List data={asteroidList} />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={8}>
            <Card>
              <CardHeader title="Execution Time" />
              <CardContent>{renderExecutionTime()}</CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <ButtonGroup>
              {asteroidMainOutputs.map((output) => (
                <Button
                  key={output.id}
                  variant="contained"
                  color="primary"
                  title={output.type_name}
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
                  <Table
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
                <CardContent>
                  <Table
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
                <CardContent>
                  <Table
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

        <Grid item xs={12}>
          <Card>
            <CardHeader title="Time Profile" />
            <CardContent>
              <AstrometryTimeProfile
                data={astrometryTimeProfile}
                width={1273}
                height={463}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog
        maxWidth="md"
        visible={outputLog.visible}
        setVisible={handleOutputLogClose}
        title={outputLog.title}
        content={<Log data={outputLog.content} />}
        wrapperStyle={{
          marginLeft: drawerOpen ? '240px' : '64px',
          marginBottom: 64,
        }}
      />

      <Dialog
        maxWidth="lg"
        visible={inputCsvVisible}
        setVisible={handleInputCsvClose}
        title={inputCsv.title}
        content={() => (
          <Table
            columns={inputCsvTable.columns}
            data={inputCsvTable.rows}
            totalCount={inputCsvTable.count}
            loadData={loadInputCsvTableData}
            hasSearching={false}
            hasSorting={false}
          />
        )}
        wrapperStyle={{
          marginLeft: drawerOpen ? '240px' : '64px',
          marginBottom: 64,
        }}
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
    </Grid>
  );
}

AstrometryAsteroid.propTypes = {
  setTitle: PropTypes.func.isRequired,
  drawerOpen: PropTypes.bool.isRequired,
};

export default AstrometryAsteroid;
