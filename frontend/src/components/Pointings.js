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

  const pointingsTableColumns = [
    {
      name: 'date_obs',
      title: 'Observation Date',
      width: 200,
      align: 'center',
      headerTooltip: 'Date and time of observation',
      sortingEnabled: false,
    },
    {
      name: 'filename',
      title: 'Filename',
      width: 120,
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
      title: 'CDD Number',
      align: 'center',
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
      title: 'Exposure time',
      align: 'center',
      width: 130,
      headerTooltip: 'Exposure time of observation',
      sortingEnabled: false,
    },
    {
      name: 'ra_cent',
      title: 'RA_CENT',
      align: 'center',
      headerTooltip: 'Exposure time of observation',
      sortingEnabled: false,
    },
    {
      name: 'dec_cent',
      title: 'DEC_CENT',
      align: 'center',
      headerTooltip: 'Exposure time of observation',
      sortingEnabled: false,
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
    {
      name: 'id',
      title: ' ',
      align: 'center',
      icon: <Icon className={clsx(`fas fa-info-circle ${classes.iconDetail}`)} />,
      action: (el) => history.push(`/pointings/${el.id}`),
    },
  ];

  const loadPointingsTableData = ({
    currentPage, pageSize, searchValue, filters = [],
  }) => {
    getPointingsList({
      page: currentPage + 1, pageSize, search: searchValue, filters,
    }).then((res) => {
      setPointingsTableCount(res.count);
      setPointingsTableData(res.results);
    });
  };

  useEffect(() => {
    setTitle('Pointings');
    // loadPointingsTableData({
    //   currentPage: 0, pageSize: 10,
    // });
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
                // hasSorting={false}
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
