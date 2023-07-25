import React, { useEffect, useState } from 'react';
import moment from 'moment';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Slider,
  Box,
  Button,
  FormControl,

} from '@material-ui/core';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { getOccultations, filter_by_location } from '../../services/api/Occultation';
import Image from '../../components/List/Image';
import useStyles from './styles'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import {
  getDynClassList,
  getBaseDynClassList,
  getAsteroidsWithPredictionList,
  getFilteredWithPredictionList
} from '../../services/api/Asteroid'
import Select from 'react-select'
import { InfoOutlined as InfoOutlinedIcon } from '@material-ui/icons'
import { useNavigate } from '../../../node_modules/react-router-dom/dist/index'

import './occultation.css'
import { CardHeader, Icon, MenuItem, OutlinedInput } from '../../../node_modules/@material-ui/core/index';
import OccultationFilter from '../../components/OccultationFilter/index';
import OccultationTable from '../../components/OccultationTable/index';

function Occultation() {
  const [magnitude, setMagnitude] = useState([4, 23]);
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterValue, setFilterValue] = useState('');
  const [locationFilter, setLocationFilter] = useState(false);
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [radius, setRadius] = useState(500);
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
    return process.env.REACT_APP_SORA + '/map?body=' + encodeURI(occultation.name) + '&date=' + encodeURI(occultation.date_time.split('T')[0]) + '&time=' + encodeURI(occultation.date_time.split('T')[1].replaceAll('Z', ''))
  }


  const loadData = ({ sorting, pageSize, currentPage }) => {
    const ordering = sorting[0].direction === 'desc' ? `-${sorting[0].columnName}` : sorting[0].columnName;
    const start = dateStart ? new Date(dateStart).toISOString().slice(0, 10) + ' 00:00:00' : null;
    const end = dateEnd ? new Date(dateEnd).toISOString().slice(0, 10) + ' 23:59:59' : null;
    const type = filterType.value ? filterType.value.toLowerCase().replaceAll(' ', '_') : null;
    const value =  filterValue.value ? filterValue.value : null;
    const minmag = magnitude[0];
    const maxmag = magnitude[1];
    if (latitude && longitude && radius) {
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
              map: urlExists(getMapUrl(row)) ? getMapUrl(row) : '',
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
              map: urlExists(getMapUrl(row)) ? getMapUrl(row) : '',
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
