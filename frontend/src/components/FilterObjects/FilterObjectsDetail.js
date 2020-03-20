import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Grid, Card, makeStyles, CardHeader, CardContent,
} from '@material-ui/core';
import Icon from '@material-ui/core/Icon';
import Divider from '@material-ui/core/Divider';
import clsx from 'clsx';
import Highlight from 'react-syntax-highlight';
import moment from 'moment';
import 'highlight.js/styles/default.css';
import 'highlight.js/styles/atom-one-light.css';
import sqlFormatter from 'sql-formatter';
import Switch from '@material-ui/core/Switch';
import CustomTable from '../helpers/CustomTable';
import CustomCardStats from '../helpers/CustomCardStats';
import { getStatsById, getObjectsList } from '../../api/Filter';

const useStyles = makeStyles((theme) => ({
  block: {
    marginBottom: 15,
  },
  iconDetail: {
    fontSize: 18,
  },
  invisibleButton: {
    backgroundColor: 'transparent',
    cursor: 'pointer',
    color: 'rgb(85, 85, 85)',
    '&:hover': {
      color: 'rgba(0, 0, 0, 0.87)',
    },
    padding: 0,
    fontSize: '1rem',
    lineHeight: 1.75,
    fontHeight: 500,
    letterSpacing: '0.02857em',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '100%',
  },
  highlightSqlBlock: {
    backgroundColor: '#fff',
  },
  filterClassWrapper: {
    color: 'rgba(0, 0, 0, 0.87)',
    border: 'none',
    cursor: 'default',
    height: 32,
    display: 'inline-flex',
    outline: 0,
    fontSize: '0.8125rem',
    boxSizing: 'border-box',
    transition: 'background-color 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
    alignItems: 'center',
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    whiteSpace: 'nowrap',
    borderRadius: 16,
    verticalAlign: 'middle',
    justifyContent: 'center',
    textDecoration: 'none',
    backgroundColor: '#e0e0e0',
    padding: 10,
    margin: 2,
    fontWeight: 'normal',
  },
  allClassesInfo: {
    padding: '10px 20px',
    fontWeight: 'bold',
    cursor: 'help',
    position: 'relative',
  },
  classIconDetail: {
    fontSize: 13,
    position: 'absolute',
    top: -3,
    right: 2,
    width: 'auto',
    color: '#444',
  },
  overflowAuto: {
    overflow: 'auto',
  },
  sqlLogMarginTop: {
    display: 'block',
    marginTop: -theme.spacing(1),
  },
}));

function FilterObjectsDetail({ setTitle, match }) {
  const classes = useStyles();
  const { id } = match.params;
  const [stats, setStats] = useState({});
  const [objectsTableCount, setObjectsTableCount] = useState(0);
  const [objectsTableData, setObjectsTableData] = useState([]);
  const [sqlLogVisible, setSqlLogVisible] = useState(false);

  const handleValues = (value) => {
    const roundValue = parseFloat(value).toFixed(3);
    const stringValue = roundValue.toString();
    return stringValue;
  };

  const objectsColumns = [
    {
      title: 'Pointing',
      name: 'pointing_id',
      hidden: true,
      width: 120,
      align: 'right',
    },
    {
      name: 'dynclass',
      title: 'Class',
      width: 120,
      headerTooltip: 'Class',
      sortingEnabled: false,

    },
    {
      name: 'name', title: 'Name', sortingEnabled: false, headerTooltip: 'Object Name',
    },
    {
      name: 'raj2000',
      title: 'RA (deg)',
      headerTooltip: 'Right Ascension',
      width: 80,
      align: 'right',
      customElement: (row) => (
        <span>
          {row.raj2000 ? handleValues(row.raj2000) : ''}
        </span>
      ),
      sortingEnabled: false,
    },
    {
      name: 'decj2000',
      title: 'Dec (deg)',
      headerTooltip: 'Declination',
      width: 80,
      align: 'right',
      customElement: (row) => (
        <span>
          {row.decj2000 ? handleValues(row.decj2000) : ''}
        </span>
      ),
      sortingEnabled: false,
    },
    {
      name: 'errpos',
      title: 'Error (arcsec)',
      width: 110,
      align: 'right',
      headerTooltip: 'Error on the position',
      customElement: (row) => (
        <span>
          {row.errpos ? handleValues(row.errpos) : ''}
        </span>
      ),
      sortingEnabled: false,
    },
    {
      name: 'jdref',
      title: 'Jref (JD)',
      width: 80,
      align: 'right',
      sortingEnabled: false,
      headerTooltip: 'Julian Reference Day',
    },
    {
      title: 'Exp Num',
      name: 'expnum',
      width: 80,
      align: 'right',
      sortingEnabled: false,
      headerTooltip: 'Exposure Number',
    },
    {
      title: 'CCD Num',
      name: 'ccdnum',
      width: 80,
      align: 'right',
      sortingEnabled: false,
      headerTooltip: 'CCD Number',
    },
    {
      name: 'band',
      title: 'Band',
      align: 'center',
      width: 60,
      sortingEnabled: false,
    },
    {
      name: 'filename',
      title: 'Downloaded',
      align: 'center',
      width: 100,
      customElement: (el) => (el.filename ? (
        <span title={el.filename}>
          <Icon className={clsx(`fas fa-check ${classes.iconDetail}`)} style={{ color: '#009900' }} />
        </span>
      ) : (
          <span title={el.filename}>
            <Icon className={clsx(`fas fa-times ${classes.iconDetail}`)} style={{ color: '#ff1a1a' }} />
          </span>
        )),
      sortingEnabled: false,
    },
    {
      name: 'externallink',
      title: 'VizieR',
      customElement: (el) => (el.externallink !== 'link' ? (
        <a href={el.externallink} target="_blank" rel="noopener noreferrer" className={classes.invisibleButton} title={el.externallink}>
          <Icon className={clsx(`fas fa-external-link-square-alt ${classes.iconDetail}`)} />
        </a>
      ) : '-'),
      align: 'center',
      sortingEnabled: false,
    },
  ];


  useEffect(() => {
    setTitle('Filter Objects');
    getStatsById({ id }).then((res) => setStats(res));
  }, []);

  const loadObjectsTableData = ({ currentPage, pageSize }) => {
    getObjectsList({ tablename: stats.tablename, page: currentPage + 1, pageSize }).then((res) => {
      setObjectsTableCount(res.count);
      setObjectsTableData(res.results);
    });
  };

  useEffect(() => {
    if (stats.tablename) {
      loadObjectsTableData({ currentPage: 0, pageSize: 10 });
    }
  }, [stats]);

  const handleSqlLogChange = () => setSqlLogVisible(!sqlLogVisible);

  return (
    <>
      {/* <Grid container spacing={2}>
        <Grid item xs={12} md={3} className={classes.block}>
          <CustomCardStats
            title="Objects"
            services={stats.distinct_objects}
            color="#4d4d4d"
            icon="fa-meteor"
          />
        </Grid>
        <Grid item xs={12} md={3} className={classes.block}>
          <CustomCardStats
            title="Rows"
            services={stats.rows}
            color="#3333ff"
            icon="fa-stream"
          />
        </Grid>
        <Grid item xs={12} md={3} className={classes.block}>
          <CustomCardStats
            title="Objects not on CCD"
            services={stats.missing_pointing}
            color="#804000"
            icon="fa-eye-slash"
          />
        </Grid>
        <Grid item xs={12} md={3} className={classes.block}>
          <CustomCardStats
            title="Class"
            // services={stats.filter_dynclass}
            customServices={() => {
              const filterClasses = stats.filter_dynclass ? stats.filter_dynclass.split(';') : [];
              return (
                <>
                  <span className={classes.filterClassWrapper}>
                    {filterClasses[0]}
                  </span>
                  <span title={filterClasses.join('; ')} className={clsx(classes.filterClassWrapper, classes.allClassesInfo)}>
                    <span>...</span>
                    <sup><Icon className={clsx('fas fa-info-circle', classes.classIconDetail)} /></sup>
                  </span>
                </>
              );
            }}
            color="#ff3385"
            icon="fa-angle-double-right"
          />
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4} className={classes.block}>
          <CustomCardStats
            title="Exposures"
            services={stats.distinct_pointing}
            color="#87CB16"
            icon="fa-images"
            size={stats.size_ccdimages}
          />
        </Grid>
        <Grid item xs={12} md={4} className={classes.block}>
          <CustomCardStats
            title="CCDs With Objects"
            services={stats.rows}
            color="#FF9500"
            icon="fa-database"
            size={stats.h_size}
          />
        </Grid>
        <Grid item xs={12} md={4} className={classes.block}>
          <CustomCardStats
            title="Need Downloading"
            services={stats.not_downloaded}
            color="#FF4A55"
            icon="fa-download"
            size={stats.size_not_downloaded}
          />
        </Grid>
      </Grid> */}
      {stats.id ? (
        <Grid container spacing={2}>
          <Grid item xs={12} className={classes.block}>
            <Card>
              <CardHeader title="Detail" />
              <CardContent>
                <div className={classes.overflowAuto}>
                  <span>
                    <b>Owner:</b>
                    {' '}
                    {stats.owner}
                  </span>
                  <br />
                  <span>
                    <b>Display Name:</b>
                    {' '}
                    {stats.displayname}
                  </span>
                  <br />
                  <span>
                    <b>Tablename:</b>
                    {' '}
                    {stats.tablename}
                  </span>
                  <br />
                  <span>
                    <b>Creation Date:</b>
                    {' '}
                    {moment(stats.creation_date).format('MM-DD-YYYY HH:mm:ss')}
                  </span>
                  <br />
                  <span>
                    <b>Description:</b>
                    {' '}
                    {stats.description}
                  </span>
                  <br />
                  <span>
                    <b>Objects:</b>
                    {' '}
                    {stats.distinct_objects}
                  </span>
                  <br />
                  <span>
                    <b>Rows:</b>
                    {' '}
                    {stats.rows}
                  </span>
                  <br />
                  <span>
                    <b>Pointings:</b>
                    {' '}
                    {stats.distinct_pointing}
                  </span>
                  <br />
                  <span>
                    <b>Objects not on CCD:</b>
                    {' '}
                    {stats.missing_pointing}
                  </span>
                  <br />
                  {(stats.filter_name !== '' && stats.filter_name !== null)
                    ? (
                      <>
                        <span>
                          <b>Filter by Name:</b>
                          {' '}
                          {stats.filter_name}
                        </span>
                        <br />
                      </>
                    )
                    : (
                      <>
                        <span>
                          <b>Class:</b>
                          {' '}
                          {stats.filter_dynclass}
                        </span>
                        <br />
                        <span>
                          <b>Magnitude:</b>
                          {' '}
                          {stats.filter_magnitude}
                        </span>
                        <br />
                        <span>
                          <b>Minimun difference time between observations:</b>
                          {stats.filter_diffdatenights}
                        </span>
                        <br />
                        <span>
                          <b>More than one Filter:</b>
                          {' '}
                          {stats.filter_morefilter.toString()}
                        </span>
                        <br />
                      </>
                    )}
                  <span className={classes.sqlLogMarginTop}>
                    <b>SQL Log:</b>
                    <Switch
                      checked={sqlLogVisible}
                      onChange={handleSqlLogChange}
                      value={sqlLogVisible}
                      color="primary"
                    />
                  </span>
                  {sqlLogVisible ? (
                    <>
                      <Divider style={{ marginTop: 30 }} />
                      <div style={{ margin: '30px 0' }}>
                        <span>
                          <b>SQL:</b>
                        </span>
                        <Highlight lang="sql" value={sqlFormatter.format(stats.sql)} />
                      </div>

                      <Divider style={{ marginTop: 30 }} />
                      <div style={{ margin: '30px 0' }}>
                        <span>
                          <b>SQL Create:</b>
                        </span>
                        <Highlight lang="sql" value={sqlFormatter.format(stats.sql_creation)} />
                      </div>
                    </>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ) : null}
      <Grid container spacing={2}>
        <Grid item xs={12} className={classes.block}>
          <Card>
            <CardHeader title="Objects" />
            <CardContent>
              <CustomTable
                columns={objectsColumns}
                data={objectsTableData}
                totalCount={objectsTableCount}
                loadData={loadObjectsTableData}
                hasSearching={false}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}

FilterObjectsDetail.propTypes = {
  setTitle: PropTypes.func.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default FilterObjectsDetail;
