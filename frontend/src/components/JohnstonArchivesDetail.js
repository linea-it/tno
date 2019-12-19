import React, { useState, useEffect } from 'react';
import { CardHeader, Grid, Card, CardContent } from '@material-ui/core';
import CustomList from './utils/CustomList';
import { getJohnstonArchivesById } from '../api/Input';

function JohnstonArchivesDetail({ setTitle, match }) {

  const [listData, setListData] = useState([]);

  const { id } = match || match.params != "undefined" || match.params ? match.params : "";

  useEffect(() => {
    setTitle("Johnston Archives Details");
    loadData()
  }, []);

  const loadData = () => {
    getJohnstonArchivesById(id).then((res) => {
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
          value: res.data.updated,
        },

      ]);
    });
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Card>
          <CardHeader
            title="Johnston Archives Details List"
          />
          <CardContent>
            <CustomList
              data={listData}
            >
            </CustomList>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default JohnstonArchivesDetail;
