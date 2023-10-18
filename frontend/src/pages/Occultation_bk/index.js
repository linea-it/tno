import React, { useState } from 'react';
import {
  Grid,
} from '@material-ui/core';
import { getOccultations, filter_by_location } from '../../services/api/Occultation';
import './occultation.css'
import OccultationFilter from '../../components/OccultationFilter/index';
import OccultationTable from '../../components/OccultationTable/index';

function Occultation() {
  const [magnitude, setMagnitude] = useState([4, 14]);
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterValue, setFilterValue] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [radius, setRadius] = useState(500);
  const [geoFilter, setGeoFilter] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [erroLocation, setErroLocation] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  function urlExists(url) {
    var http = new XMLHttpRequest();
    http.open('HEAD', url, false);
    http.send();
    if (http.status != 404)
        return true;
    else
        return false;
  }

  function getMapUrl(occultation){
    return process.env.REACT_APP_SORA + '/map?name=' + encodeURI(occultation.name) + '&time=' + encodeURI(new Date(occultation.date_time).toISOString())
  }


  const loadData = ({ sorting, pageSize, currentPage }) => {
    const ordering = sorting[0].direction === 'desc' ? `-${sorting[0].columnName}` : sorting[0].columnName;
    const start = dateStart ? new Date(dateStart).toISOString().slice(0, 10) + ' 00:00:00' : null;
    const end = dateEnd ? new Date(dateEnd).toISOString().slice(0, 10) + ' 23:59:59' : null;
    const type = filterType.value ? filterType.value.toLowerCase().replaceAll(' ', '_') : null;
    const value =  filterValue.value ? filterValue.value : null;
    const minmag = magnitude[0];
    const maxmag = magnitude[1];
    if (latitude && longitude && radius && geoFilter) {
        setLoadingLocation(true);
        setTableData([]);
        setTotalCount(0);
        filter_by_location({
          page: currentPage + 1,
          pageSize,
          ordering: ordering,
          start_date: start,
          end_date: end,
          filter_type: value ? type : null,
          filter_value: value,
          min_mag: minmag,
          max_mag: maxmag,
          lat: latitude,
          long: longitude,
          radius: radius
        }).then((res) => {
          const { data } = res
          setLoadingLocation(false);
          setTableData(
            data.results.map((row) => ({
              key: row.id,
              detail: `/dashboard/occultation-detail/${row.id}`,
              // map: urlExists(getMapUrl(row)) ? getMapUrl(row) : '',
              ...row
            }))
          )
          setTotalCount(data.count)
        },
          (reason) => {
            setLoadingLocation(false);
            setErroLocation(true);
            console.error(reason); // Error!
          });
      }
      else {
        getOccultations({
          page: currentPage + 1,
          pageSize,
          ordering: ordering,
          start_date: start,
          end_date: end,
          filter_type: value ? type : null,
          filter_value: value,
          min_mag: minmag,
          max_mag: maxmag
        }).then((res) => {
          const { data } = res
          setTableData(
            data.results.map((row) => ({
              key: row.id,
              detail: `/dashboard/occultation-detail/${row.id}`,
              // map: urlExists(getMapUrl(row)) ? getMapUrl(row) : '',
              ...row
            }))
          )
          setTotalCount(data.count)
        })
      }
  }

  const filter = () => {
    setErroLocation(false);
    loadData({ sorting: [{ columnName: 'date_time', direction: 'asc' }], pageSize: 10, currentPage: 0 });
  }

  return (
    <Grid>
      <Grid container spacing={3}>
      <OccultationFilter
            dateStart={dateStart}
            setDateStart={setDateStart}
            dateEnd={dateEnd}
            setDateEnd={setDateEnd}
            filterType={filterType}
            setFilterType={setFilterType}
            filterValue={filterValue}
            setFilterValue={setFilterValue}
            magnitude={magnitude}
            setMagnitude={setMagnitude}
            latitude={latitude}
            setLatitude={setLatitude}
            longitude={longitude}
            setLongitude={setLongitude}
            radius={radius}
            setRadius={setRadius}
            geoFilter={geoFilter}
            setGeoFilter={setGeoFilter}
            loadingLocation={loadingLocation}
            setLoadingLocation={setLoadingLocation}
            erroLocation={erroLocation}
            setErroLocation={setErroLocation}
            filter={filter}
          />
        <Grid item xs={12}>
          <OccultationTable
            loadData={loadData}
            tableData={tableData}
            totalCount={totalCount}
            /> 
        </Grid>
      </Grid>
    </Grid>
  );
}

export default Occultation
