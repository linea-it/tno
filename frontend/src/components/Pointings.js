import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Grid, Card, makeStyles, CardHeader, CardContent,
} from '@material-ui/core';
import Icon from '@material-ui/core/Icon';
import { withRouter } from 'react-router';
import clsx from 'clsx';
import CustomTable from './utils/CustomTable';
import { getPointingsList } from '../api/Pointings';
import moment from 'moment';


const useStyles = makeStyles({
  block: {
    marginBottom: 15,
  },
  cardContentWrapper: {
    overflow: 'auto',
  },
  iconDetail: {
    fontSize: 18,
  },
});

function Pointings({ setTitle, history }) {
  const classes = useStyles();
  const [pointingsTableData, setPointingsTableData] = useState([]);
  const [pointingsTableCount, setPointingsTableCount] = useState(0);
  const [loading, setLoading] = useState(false);


  const handleValues = (value) => {
    const roundValue = parseFloat(value).toFixed(3);
    const stringValue = roundValue.toString();
    return stringValue;
  };

  const pointingsTableColumns = [
    {
      name: 'id',
      title: 'Details',
      align: 'center',
      width: 100,
      icon: <Icon className={clsx(`fas fa-info-circle ${classes.iconDetail}`)} />,
      action: (el) => history.push(`/pointings/${el.id}`),
      sortingEnabled: false,
    },
    {
      name: 'date_obs',
      title: 'Observation Date',
      customElement: (row) => (
        <span>
          {row.date_obs ? moment(row.date_obs).format("YYYY-MM-DD") : ""}
        </span>
      ),
      width: 200,
      align: 'center',
      headerTooltip: 'Date and time of observation',
      sortingEnabled: false,
    },
    {
      name: 'filename',
      title: 'Filename',
      width: 170,
      customElement: (el) => (
        <span title={el.filename}>
          {el.filename}
        </span>
      ),
      headerTooltip: 'Name of FITS file with a CCD image',
      sortingEnabled: false,
    },
    {
      name: 'ccdnum',
      title: 'CCD Number',
      align: 'right',
      width: 120,
      headerTooltip: 'CCD Number (1, 2, ..., 62)',
      sortingEnabled: false,
    },
    {
      name: 'band',
      title: 'Band',
      align: 'center',
      width: 100,
      headerTooltip: 'Filter used to do the observation (u, g, r, i, z, Y)',
      sortingEnabled: false,
    },
    {
      name: 'exptime',
      title: 'Expos time (s)',
      align: 'right',
      width: 100,
      headerTooltip: 'Exposure time of observation',
      sortingEnabled: false,
    },
    {
      name: 'ra_cent',
      title: 'ra_cent (deg)',
      align: 'right',
      headerTooltip: 'Right Ascension of the center of the CCD image',
      sortingEnabled: false,
      customElement: (row) => (
        <span>
          {row.ra_cent ? handleValues(row.ra_cent) : ''}
        </span>
      ),
    },
    {
      name: 'dec_cent',
      title: 'dec_cent (deg)',
      align: 'right',
      headerTooltip: 'Declination of the center of the CCD image',
      sortingEnabled: false,
      customElement: (row) => (
        <span>
          {row.dec_cent ? handleValues(row.dec_cent) : ''}
        </span>
      ),
    },
    {
      name: 'downloaded',
      title: 'Downloaded',
      align: 'center',
      headerTooltip: 'flag indicating whether the image was downloaded from DES',
      sortingEnabled: false,
      customElement: (el) => (el.downloaded ? (
        <span title={el.downloaded}>
          <Icon className={clsx(`fas fa-check ${classes.iconDetail}`)} style={{ color: '#009900' }} />
        </span>
      ) : (
          <span title={el.downloaded}>
            <Icon className={clsx(`fas fa-times ${classes.iconDetail}`)} style={{ color: '#ff1a1a' }} />
          </span>
        )),
    },
  ];

  const loadPointingsTableData = ({
    currentPage, pageSize, searchValue, filters = [],
  }) => {
    setLoading(true);
    getPointingsList({
      page: currentPage + 1, pageSize, search: searchValue, filters,
    }).then((res) => {
      setPointingsTableCount(res.count);
      setPointingsTableData(res.results);
      setLoading(false);
    }).catch((err) => {
      console.error(err);
      setLoading(false);
    });
  };

  useEffect(() => {
    setTitle('Pointings');
  }, []);

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12} className={classes.block}>
          <Card>
            <CardHeader title="List With All Pointings" />
            <CardContent className={classes.cardContentWrapper}>
              <CustomTable
                columns={pointingsTableColumns}
                data={pointingsTableData}
                loadData={loadPointingsTableData}
                totalCount={pointingsTableCount}
                loading={loading}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}

Pointings.propTypes = {
  setTitle: PropTypes.func.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};

export default withRouter(Pointings);
