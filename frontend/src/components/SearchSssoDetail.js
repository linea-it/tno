import React, { useState, useEffect, useLayoutEffect } from 'react';
import { withRouter } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import { Card, CardHeader, CardContent, Button } from '@material-ui/core';
import Table from './utils/CustomTable';
import CustomList from './utils/CustomList';
import { getSkybotRecord } from '../api/SearchSsso';
import clsx from 'clsx';
import Icon from '@material-ui/core/Icon';


function SearchSSSoDetail({ history, setTitle, match: { params } }) {

  const [tableData, setTableData] = useState([]);
  const [listData, setListData] = useState([{}]);

  const id = params ? params.id : 0;

  useEffect(() => {
    setTitle("Search SSSo Detail");
    loadData();
  }, []);

  const loadData = () => {
    getSkybotRecord({ id }).then((res) => {
      setListData(res ? res.data : []);
    });
  };

  const columsTable = [{}];

  const listColumns = [
    { title: "Pointings: ", value: listData.pointing },
    { title: "Object Name: ", value: listData.name },
    { title: "Object Number:", value: listData.num },
    { title: "Dynamic class:", value: listData.dynclass },
    { title: "Right Ascension (RA) [hms]:", value: listData.ra },
    { title: "Declination (Dec) [dms]:", value: listData.dec },
    { title: "Visual Magnitude:", value: listData.mv },
    { title: "Error on the position [arcsec]:", value: listData.errpos },
    { title: "Angular Distance [arcsec]:", value: listData.d },
    { title: "dRAcosDec: ", value: listData.dracosdec },
    { title: "dDEC: ", value: listData.ddec },
    { title: "Right Ascension (RA) [degree]: ", value: listData.raj2000 },
    { title: "Declination (Dec) [degree]: ", value: listData.decj2000 },
    { title: "dRAcosDec: ", value: listData.dracosdec },
    { title: "Geocentric distance [AU]: ", value: listData.dgeo },
    { title: "Heliocentric distance [AU]: ", value: listData.dhelio },
    { title: "Phase angle [degrees]: ", value: listData.phase },
    { title: "Solar elongation: ", value: listData.solelong },
    { title: "Vector position in x [AU]: ", value: listData.px },
    { title: "Vector position in y [AU]: ", value: listData.py },
    { title: "Vector position in z [AU]: ", value: listData.pz },
    { title: "Vector position in x [AU/d]: ", value: listData.vx },
    { title: "Vector position in y [AU/d]: ", value: listData.vy },
    { title: "Vector position in z [AU/d]: ", value: listData.vz },
    { title: "Epoch of the position vector [Julien Day]: ", value: listData.jdref },
    { title: "Band: ", value: listData.band },
    { title: "Exposure: ", value: listData.expnum },
    { title: "CCD number: ", value: listData.ccdnum },
    {
      title: "External Link: ", value: <a target="_blank" href={listData.externallink}> Open Link</a>
    },
  ]

  const handleBackNavigation = () => {
    history.push('/ssso');
  };

  return (
    <Grid>
      <Grid container spacing={2}>
        {/* <Grid item lg={12}>
          <Card>
            <CardHeader
              title={"Observation"}
            />
            <CardContent>
              <Table
                data={tableData}
                columns={columsTable}
                hasSearching={false}
                hasToolbar={false}
                hasFiltering={false}
                hasColumnVisibility={false}
                hasPagination={false}
                hasSorting={false}
              >
              </Table>
            </CardContent>
          </Card>
        </Grid> */}
        <Grid item lg={12} xl={4}>
          <Button
            variant="contained"
            color="primary"
            title="Back"
            onClick={handleBackNavigation}
          >
            <Icon className={clsx('fas', 'fa-undo')} />
            <span style={{ paddingLeft: "10px" }}> Back </span>
          </Button>
        </Grid>
        <Grid item lg={8} xl={7}>
          <Card>
            <CardHeader
              title={"SkyBot Output"}
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
};
export default withRouter(SearchSSSoDetail);