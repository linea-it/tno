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
import { getStatsById, getObjectsList } from '../api/Filter';
import CustomCardStats from './utils/CustomCardStats';
import CustomTable from './utils/CustomTable';
// https://github.com/zlargon/react-highlight
import 'highlight.js/styles/default.css';
import 'highlight.js/styles/atom-one-light.css';

// https://github.com/zeroturnaround/sql-formatter
import sqlFormatter from 'sql-formatter';

const useStyles = makeStyles({
  block: {
    marginBottom: 15,
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
    backgroundColor: '#009900',
    color: '#fff',
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
});

function FilterObjectsDetail({ setTitle, match }) {
  const classes = useStyles();
  const { id } = match.params;
  const [stats, setStats] = useState({});
  const [objectsTableCount, setObjectsTableCount] = useState(0);
  const [objectsTableData, setObjectsTableData] = useState([]);

  const objectsColumns = [
    {
      title: 'Pointing',
      name: 'pointing_id',
      hidden: true,
      width: 100,
    },
    {
      name: 'dynclass',
      title: 'Class',
      width: 100,
    },
    { name: 'name', title: 'Name' },
    {
      name: 'raj2000',
      title: 'RA',
      width: 80,
    },
    {
      name: 'decj2000',
      title: 'Dec',
      width: 80,
    },
    {
      name: 'errpos',
      title: 'Errpos',
      width: 70,
    },
    {
      name: 'jdref',
      title: 'Jref',
      width: 80,
    },
    {
      title: 'Exp Num',
      name: 'expnum',
      width: 80,
    },
    {
      title: 'CCD Num',
      name: 'ccdnum',
      width: 80,
    },
    {
      name: 'band',
      title: 'Band',
      align: 'center',
      width: 60,
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
    },
    {
      name: 'externallink',
      title: 'VizieR',
      customElement: (el) => (
        <a href={el.externallink} target="_blank" rel="noopener noreferrer" className={classes.invisibleButton} title={el.externallink}>
          <Icon className={clsx(`fas fa-external-link-square-alt ${classes.iconDetail}`)} />
        </a>
      ),
      align: 'center',
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

  return (
    <>
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
            title="CCDs"
            services={stats.rows}
            color="#FF9500"
            icon="fa-database"
            size={stats.h_size}
          />
        </Grid>
        <Grid item xs={12} md={4} className={classes.block}>
          <CustomCardStats
            title="Need to be Download"
            services={stats.not_downloaded}
            color="#FF4A55"
            icon="fa-download"
            size={stats.size_not_downloaded}
          />
        </Grid>
      </Grid>
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
                hasSorting={false}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {stats.id ? (
        <Grid container spacing={2}>
          <Grid item xs={12} className={classes.block}>
            <Card>
              <CardHeader title="Detail" />
              <CardContent>
                <div>
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
                    {stats.filter_morefilter}
                  </span>
                  <br />
                  <span>
                    <b>Filter by Name:</b>
                    {' '}
                    {stats.filter_name}
                  </span>
                  <br />
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
                </div>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ) : null}
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
