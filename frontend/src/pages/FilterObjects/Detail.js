import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {
  Grid,
  Card,
  CardHeader,
  CardContent,
  Icon,
  Divider,
  Switch,
} from '@material-ui/core';
import Highlight from 'react-syntax-highlight';
import sqlFormatter from 'sql-formatter';
import Table from '../../components/Table';
import { getStatsById, getObjectsList } from '../../services/api/Filter';
import 'highlight.js/styles/default.css';
import 'highlight.js/styles/atom-one-light.css';

function FilterObjectsDetail({ setTitle, match }) {
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
      name: 'name',
      title: 'Name',
      sortingEnabled: false,
      headerTooltip: 'Object Name',
    },
    {
      name: 'raj2000',
      title: 'RA (deg)',
      headerTooltip: 'Right Ascension',
      width: 80,
      align: 'right',
      customElement: (row) => (
        <span>{row.raj2000 ? handleValues(row.raj2000) : ''}</span>
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
        <span>{row.decj2000 ? handleValues(row.decj2000) : ''}</span>
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
        <span>{row.errpos ? handleValues(row.errpos) : ''}</span>
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
      customElement: (el) =>
        el.filename ? (
          <span title={el.filename}>
            <Icon className="fas fa-check" style={{ color: '#009900' }} />
          </span>
        ) : (
          <span title={el.filename}>
            <Icon className="fas fa-times" style={{ color: '#ff1a1a' }} />
          </span>
        ),
      sortingEnabled: false,
    },
    {
      name: 'externallink',
      title: 'VizieR',
      customElement: (el) =>
        el.externallink !== 'link' ? (
          <a
            href={el.externallink}
            target="_blank"
            rel="noopener noreferrer"
            title={el.externallink}
          >
            <Icon className="fas fa-external-link-square-alt" />
          </a>
        ) : (
          '-'
        ),
      align: 'center',
      sortingEnabled: false,
    },
  ];

  useEffect(() => {
    setTitle('Filter Objects');
    getStatsById({ id }).then((res) => setStats(res));
  }, []);

  const loadObjectsTableData = ({ currentPage, pageSize }) => {
    getObjectsList({
      tablename: stats.tablename,
      page: currentPage + 1,
      pageSize,
    }).then((res) => {
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
      {stats.id ? (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Card>
              <CardHeader title="Detail" />
              <CardContent>
                <div>
                  <span>
                    <b>Owner:</b> {stats.owner}
                  </span>
                  <br />
                  <span>
                    <b>Display Name:</b> {stats.displayname}
                  </span>
                  <br />
                  <span>
                    <b>Tablename:</b> {stats.tablename}
                  </span>
                  <br />
                  <span>
                    <b>Creation Date:</b>{' '}
                    {moment(stats.creation_date).format('MM-DD-YYYY HH:mm:ss')}
                  </span>
                  <br />
                  <span>
                    <b>Description:</b> {stats.description}
                  </span>
                  <br />
                  <span>
                    <b>Objects:</b> {stats.distinct_objects}
                  </span>
                  <br />
                  <span>
                    <b>Rows:</b> {stats.rows}
                  </span>
                  <br />
                  <span>
                    <b>Pointings:</b> {stats.distinct_pointing}
                  </span>
                  <br />
                  <span>
                    <b>Objects not on CCD:</b> {stats.missing_pointing}
                  </span>
                  <br />
                  {stats.filter_name !== '' && stats.filter_name !== null ? (
                    <>
                      <span>
                        <b>Filter by Name:</b> {stats.filter_name}
                      </span>
                      <br />
                    </>
                  ) : (
                    <>
                      <span>
                        <b>Class:</b> {stats.filter_dynclass}
                      </span>
                      <br />
                      <span>
                        <b>Magnitude:</b> {stats.filter_magnitude}
                      </span>
                      <br />
                      <span>
                        <b>Minimun difference time between observations:</b>
                        {stats.filter_diffdatenights}
                      </span>
                      <br />
                      <span>
                        <b>More than one Filter:</b>{' '}
                        {stats.filter_morefilter.toString()}
                      </span>
                      <br />
                    </>
                  )}
                  <span>
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
                      <Divider />
                      <div>
                        <span>
                          <b>SQL:</b>
                        </span>
                        <Highlight
                          lang="sql"
                          value={sqlFormatter.format(stats.sql)}
                        />
                      </div>

                      <Divider />
                      <div>
                        <span>
                          <b>SQL Create:</b>
                        </span>
                        <Highlight
                          lang="sql"
                          value={sqlFormatter.format(stats.sql_creation)}
                        />
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
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Objects" />
            <CardContent>
              <Table
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
