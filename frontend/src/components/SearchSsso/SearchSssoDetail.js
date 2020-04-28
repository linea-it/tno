import React, { useState, useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import {
  Card, CardHeader, CardContent, Button,
} from '@material-ui/core';
import clsx from 'clsx';
import Icon from '@material-ui/core/Icon';
import PropTypes from 'prop-types';
import { getSkybotRecord } from '../../api/SearchSsso';
import CustomList from '../helpers/CustomList';

function SearchSSSoDetail({ history, setTitle, match: { params } }) {
  const [listData, setListData] = useState([{}]);

  const id = params ? params.id : 0;

  useEffect(() => {
    setTitle('Search SSSo Detail');
    loadData();
  }, []);

  const loadData = () => {
    getSkybotRecord({ id }).then((res) => {
      setListData(res ? res.data : []);
    });
  };

  const listColumns = [
    { title: 'Pointings: ', value: listData.pointing },
    { title: 'Object Name: ', value: listData.name },
    { title: 'Object Number:', value: listData.num },
    { title: 'Dynamic class:', value: listData.dynclass },
    { title: 'Visual Magnitude: (mag)', value: listData.mv },
    { title: 'Error on the position (arcsec):', value: listData.errpos },
    { title: 'Angular Distance (arcsec):', value: listData.d },
    { title: 'dRAcosDec: (arcsec/h) ', value: listData.dracosdec },
    { title: 'dDEC: (arcsec/h) ', value: listData.ddec },
    { title: 'Right Ascension  (degree): ', value: listData.raj2000 },
    { title: 'Declination (Dec) (degree): ', value: listData.decj2000 },
    { title: 'Geocentric distance (AU): ', value: listData.dgeo },
    { title: 'Heliocentric distance (AU): ', value: listData.dhelio },
    { title: 'Phase angle (degree): ', value: listData.phase },
    { title: 'Solar elongation: (deg) ', value: listData.solelong },
    { title: 'Vector position in x (AU): ', value: listData.px },
    { title: 'Vector position in y (AU): ', value: listData.py },
    { title: 'Vector position in z (AU): ', value: listData.pz },
    { title: 'Vector position in x (AU/d): ', value: listData.vx },
    { title: 'Vector position in y (AU/d): ', value: listData.vy },
    { title: 'Vector position in z (AU/d): ', value: listData.vz },
    { title: 'Epoch of the position vector (Julien Day): ', value: listData.jdref },
    { title: 'Band: ', value: listData.band },
    { title: 'Exposure: ', value: listData.expnum },
    { title: 'CCD number: ', value: listData.ccdnum },
    {
      title: 'External Link: ', value: () => checkLink(),
    },
  ];

  const checkLink = () => {
    let resp = '';

    if (!listData.externallink === 'link') {
      resp = <a target="_blank" href={listData.externallink}> Open Link</a>;
    } else {
      resp = 'no link';
    }
    return resp;
  };

  const handleBackNavigation = () => {
    history.push('/ssso');
  };

  return (
    <Grid>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Button
            variant="contained"
            color="primary"
            title="Back"
            onClick={handleBackNavigation}
          >
            <Icon className={clsx('fas', 'fa-undo')} />
            <span style={{ paddingLeft: '10px' }}> Back </span>
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="SkyBot Output"
            />
            <CardContent>
              <CustomList
                data={listColumns}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Grid>
  );
}

SearchSSSoDetail.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  setTitle: PropTypes.func.isRequired,
};

export default withRouter(SearchSSSoDetail);
