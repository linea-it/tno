import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { useParams } from 'react-router-dom';
import { CardHeader, Grid, Card, CardContent } from '@material-ui/core';
import List from '../../components/List';
import { getJohnstonArchivesById } from '../../services/api/Input';

function JohnstonArchiveDetail({ setTitle }) {
  const { id } = useParams();
  const [listData, setListData] = useState([]);

  useEffect(() => {
    setTitle('Johnston Archives Details');
  }, [setTitle]);

  useEffect(() => {
    getJohnstonArchivesById(id).then((res) => {
      const updatedDate = moment(res.updated).format('YYYY-MM-DD HH:mm:ss');
      setListData([
        {
          title: 'Name',
          value: res.data.name,
        },
        {
          title: 'Number',
          value: res.data.number,
        },
        {
          title: 'Provisional Designation',
          value: res.data.provisional_designation,
        },
        {
          title: 'Dynamic Class',
          value: res.data.dynamical_class,
        },
        {
          title: 'A (AU)',
          value: res.data.a,
        },
        {
          title: 'E',
          value: res.data.e,
        },
        {
          title: 'Perihelion Distance - q(AU)',
          value: res.data.perihelion_distance,
        },
        {
          title: 'Aphelion Distance',
          value: res.data.aphelion_distance,
        },
        {
          title: 'I (deg)',
          value: res.data.i,
        },
        {
          title: 'Diameter (Km)',
          value: res.data.diameter,
        },
        {
          title: 'Diameter Flag',
          value: res.data.diameter_flag,
        },
        {
          title: 'Albedo',
          value: res.data.albedo,
        },
        {
          title: 'B R Mag',
          value: res.data.b_r_mag,
        },
        {
          title: 'Taxon',
          value: res.data.taxon,
        },
        {
          title: 'Density',
          value: res.data.density,
        },
        {
          title: 'Known Components',
          value: res.data.known_components,
        },
        {
          title: 'Discovery',
          value: res.data.discovery,
        },
        {
          title: 'Updated',
          value: updatedDate,
        },
      ]);
    });
  }, [id]);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title="Johnston Archives Details List" />
          <CardContent>
            <List data={listData} />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

JohnstonArchiveDetail.propTypes = {
  setTitle: PropTypes.func.isRequired,
};

export default JohnstonArchiveDetail;